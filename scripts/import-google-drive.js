#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js")
const { createSign } = require("crypto")

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const DRIVE_ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID

function base64UrlEncode(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url")
}

function buildJwtAssertion() {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  const privateKey = requireEnv("GOOGLE_SERVICE_ACCOUNT_KEY").replace(/\\n/g, "\n")

  const header = { alg: "RS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }

  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(payload)
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const signer = createSign("RSA-SHA256")
  signer.update(signingInput)
  signer.end()

  const signature = signer.sign(privateKey, "base64url")
  return `${signingInput}.${signature}`
}

async function fetchAccessToken() {
  const assertion = buildJwtAssertion()
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  })

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  const json = await response.json()
  return json.access_token
}

async function driveRequest(path, accessToken, params = {}) {
  const url = new URL(`https://www.googleapis.com/drive/v3${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Drive API error ${response.status} ${response.statusText}: ${errorBody}`)
  }

  return response.json()
}

async function getFolderMetadata(folderId, accessToken) {
  const data = await driveRequest(`/files/${folderId}`, accessToken, {
    fields: "id, name",
  })
  return data
}

async function listFolderChildren(folderId, accessToken) {
  const files = []
  let pageToken

  do {
    const data = await driveRequest("/files", accessToken, {
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime)",
      pageSize: 1000,
      orderBy: "folder,name,modifiedTime desc",
      pageToken,
    })

    files.push(...data.files)
    pageToken = data.nextPageToken
  } while (pageToken)

  return files
}

function inferCourseMetadata(folderName, departmentName) {
  const name = folderName.trim()
  const hyphenMatch = name.match(/^(?<code>[A-Za-z]{2,}\s?\d{2,})\s*[-–]\s*(?<title>.+)$/)
  if (hyphenMatch?.groups) {
    return {
      code: hyphenMatch.groups.code.replace(/\s+/, " ").toUpperCase(),
      name: hyphenMatch.groups.title.trim(),
      department: departmentName,
    }
  }

  const split = name.split(/\s+/)
  const code = split.slice(0, 2).join(" ").toUpperCase()
  const title = split.slice(2).join(" ") || name
  return {
    code,
    name: title,
    department: departmentName,
  }
}

const MATERIAL_TYPE_PATTERNS = [
  { type: "exam", patterns: [/exam/i, /midterm/i, /final/i, /makeup/i] },
  { type: "quiz", patterns: [/quiz/i] },
  { type: "assignment", patterns: [/assignment/i, /project/i, /homework/i, /hw/i] },
  { type: "notes", patterns: [/notes?/i, /lecture/i, /summary/i] },
  { type: "solution", patterns: [/solution/i, /answer/i, /key/i] },
]

function inferMaterialType(name, pathSegments) {
  const haystack = `${pathSegments.join(" ")} ${name}`
  for (const entry of MATERIAL_TYPE_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(haystack))) {
      return entry.type
    }
  }
  return "other"
}

function parseSemesterAndYear(name, pathSegments) {
  const haystack = `${pathSegments.join(" ")} ${name}`
  const semesterMatch = haystack.match(/(spring|summer|fall|winter)\s*(\d{4})?/i)
  const yearMatch = haystack.match(/(20\d{2})/)

  return {
    semester: semesterMatch ? capitalize(semesterMatch[1]) : null,
    year: semesterMatch && semesterMatch[2] ? Number.parseInt(semesterMatch[2], 10) : yearMatch ? Number.parseInt(yearMatch[1], 10) : null,
  }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str
}

function normaliseTitle(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim()
}

async function collectFilesRecursively(folderId, accessToken, ancestors = []) {
  const children = await listFolderChildren(folderId, accessToken)
  const folders = []
  const files = []

  for (const item of children) {
    if (item.mimeType === "application/vnd.google-apps.folder") {
      folders.push(item)
    } else {
      files.push({
        ...item,
        pathSegments: ancestors,
      })
    }
  }

  for (const folder of folders) {
    const nested = await collectFilesRecursively(folder.id, accessToken, [...ancestors, folder.name])
    files.push(...nested)
  }

  return files
}

async function importDepartmentFolder(departmentFolder, accessToken, supabase) {
  const departmentName = departmentFolder.name.trim()
  const courseFolders = await listFolderChildren(departmentFolder.id, accessToken)
  const folders = courseFolders.filter((item) => item.mimeType === "application/vnd.google-apps.folder")

  for (const courseFolder of folders) {
    await importCourseFolder(courseFolder, departmentName, accessToken, supabase)
  }
}

async function importCourseFolder(courseFolder, departmentName, accessToken, supabase) {
  const courseMetadata = inferCourseMetadata(courseFolder.name, departmentName)
  const description = `Imported automatically from Google Drive folder: ${courseFolder.name}`

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .upsert(
      {
        code: courseMetadata.code,
        name: courseMetadata.name,
        department: courseMetadata.department,
        description,
      },
      { onConflict: "code" }
    )
    .select()
    .single()

  if (courseError) {
    throw courseError
  }

  const files = await collectFilesRecursively(courseFolder.id, accessToken, [])

  for (const file of files) {
    const type = inferMaterialType(file.name, file.pathSegments)
    const { semester, year } = parseSemesterAndYear(file.name, file.pathSegments)
    const title = normaliseTitle(file.name)
    const downloadUrl = `https://drive.google.com/uc?id=${file.id}&export=download`

    const { error: materialError } = await supabase
      .from("materials")
      .upsert(
        {
          course_id: course.id,
          title,
          type,
          semester,
          year,
          file_url: downloadUrl,
          file_name: file.name,
          file_size: file.size ? Number.parseInt(file.size, 10) : null,
          source: "google-drive",
          external_id: file.id,
          metadata: {
            path: file.pathSegments,
            mimeType: file.mimeType,
            driveCreatedTime: file.createdTime,
            driveModifiedTime: file.modifiedTime,
          },
        },
        { onConflict: "external_id" }
      )

    if (materialError) {
      throw materialError
    }
  }
}

async function main() {
  if (!DRIVE_ROOT_FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is required to import content")
  }

  const accessToken = await fetchAccessToken()
  const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"))

  console.log("Fetching folders from Google Drive...")
  const root = await getFolderMetadata(DRIVE_ROOT_FOLDER_ID, accessToken)
  console.log(`Root folder: ${root.name} (${root.id})`)

  const children = await listFolderChildren(root.id, accessToken)
  const departmentFolders = children.filter((item) => item.mimeType === "application/vnd.google-apps.folder")

  for (const departmentFolder of departmentFolders) {
    console.log(`Importing department: ${departmentFolder.name}`)
    await importDepartmentFolder(departmentFolder, accessToken, supabase)
  }

  console.log("Import complete!")
}

main().catch((error) => {
  console.error("Import failed:", error)
  process.exit(1)
})
