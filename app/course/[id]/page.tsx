import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, ArrowLeft, FolderTree, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

type MaterialRecord = {
  id: string
  title: string
  type: string | null
  semester: string | null
  year: number | null
  file_url: string
  file_name: string
  file_size: number | null
  source?: string | null
  created_at: string
  metadata?: {
    path?: string[]
    [key: string]: unknown
  } | null
}

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  exam: "Exams",
  quiz: "Quizzes",
  assignment: "Assignments",
  notes: "Notes",
  solution: "Solutions",
  other: "Other Materials",
}

const MATERIAL_TYPE_ORDER = ["exam", "quiz", "assignment", "solution", "notes", "other"]

export default async function CoursePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch course details
  const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", id).single()

  if (courseError || !course) {
    notFound()
  }

  // Fetch materials for this course
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("course_id", id)
    .order("created_at", { ascending: false })

  const typedMaterials = (materials || []) as MaterialRecord[]

  const materialGroups = typedMaterials.reduce<Record<string, MaterialRecord[]>>((acc, material) => {
    const typeKey = material.type && MATERIAL_TYPE_LABELS[material.type] ? material.type : "other"
    const existing = acc[typeKey] || []
    existing.push({
      ...material,
      metadata: typeof material.metadata === "object" && material.metadata !== null ? material.metadata : null,
    })
    acc[typeKey] = existing
    return acc
  }, {})

  const orderedMaterialGroups = Object.entries(materialGroups).sort((a, b) => {
    const aIndex = MATERIAL_TYPE_ORDER.indexOf(a[0])
    const bIndex = MATERIAL_TYPE_ORDER.indexOf(b[0])
    const safeA = aIndex === -1 ? MATERIAL_TYPE_ORDER.length : aIndex
    const safeB = bIndex === -1 ? MATERIAL_TYPE_ORDER.length : bIndex
    return safeA - safeB
  })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="mb-8">
          <Badge className="mb-4">{course.code}</Badge>
          <h1 className="mb-2 text-4xl font-bold">{course.name}</h1>
          <p className="text-lg text-muted-foreground">{course.department}</p>
          {course.description && <p className="mt-4 text-muted-foreground">{course.description}</p>}
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-semibold">Available Materials ({materials?.length || 0})</h2>
          <p className="text-muted-foreground">Materials are grouped automatically by type and semester when available.</p>
        </div>

        {orderedMaterialGroups.length > 0 ? (
          <div className="space-y-10">
            {orderedMaterialGroups.map(([type, groupedMaterials]) => (
              <section key={type} className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{MATERIAL_TYPE_LABELS[type] || MATERIAL_TYPE_LABELS.other}</h3>
                  <p className="text-sm text-muted-foreground">
                    {groupedMaterials.length} material{groupedMaterials.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="grid gap-4">
                  {groupedMaterials
                    .sort((a, b) => {
                      const yearDiff = (b.year || 0) - (a.year || 0)
                      if (yearDiff !== 0) return yearDiff
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    })
                    .map((material) => (
                      <Card key={material.id} className="transition-all hover:shadow-md">
                        <CardHeader>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <CardTitle className="mb-2 flex flex-wrap items-center gap-2">
                                <FileText className="h-5 w-5 text-accent" />
                                <span>{material.title}</span>
                              </CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{material.type}</Badge>
                                {material.semester && material.year && (
                                  <Badge variant="outline" className="gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {material.semester} {material.year}
                                  </Badge>
                                )}
                                {material.source && (
                                  <Badge variant="outline" className="gap-1">
                                    <LinkIcon className="h-3 w-3" />
                                    {material.source === "google-drive" ? "Google Drive" : material.source}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button asChild size="sm" className="gap-2">
                              <a href={material.file_url} target="_blank" rel="noopener noreferrer" download>
                                <Download className="h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                              <span>{material.file_name}</span>
                              {material.file_size && (
                                <span>{(material.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              )}
                            </div>
                            {material.metadata?.path?.length ? (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FolderTree className="h-4 w-4" />
                                <span className="truncate">
                                  {material.metadata.path.join(" › ")}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No materials available yet for this course.</p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
