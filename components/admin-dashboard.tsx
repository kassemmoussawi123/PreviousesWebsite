"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Plus, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  code: string
  name: string
  department: string
  description: string | null
}

interface AdminDashboardProps {
  courses: Course[]
}

export function AdminDashboard({ courses: initialCourses }: AdminDashboardProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  // Course form state
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    department: "",
    description: "",
  })

  // Material form state
  const [materialForm, setMaterialForm] = useState({
    courseId: "",
    title: "",
    type: "exam",
    semester: "",
    year: new Date().getFullYear().toString(),
    file: null as File | null,
  })

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingCourse(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("courses").insert([courseForm]).select().single()

      if (error) throw error

      setCourses([...courses, data])
      setCourseForm({ code: "", name: "", department: "", description: "" })
      setUploadProgress("Course added successfully!")
      setTimeout(() => setUploadProgress(""), 3000)
    } catch (error) {
      console.error("Error adding course:", error)
      setUploadProgress("Error adding course")
    } finally {
      setIsAddingCourse(false)
    }
  }

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialForm.file) return

    setIsUploadingMaterial(true)
    setUploadProgress("Uploading file...")

    try {
      // Upload file to Blob
      const formData = new FormData()
      formData.append("file", materialForm.file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Upload failed")

      const { url, filename, size } = await uploadResponse.json()
      setUploadProgress("Saving to database...")

      // Save material info to database
      const supabase = createClient()
      const { error } = await supabase.from("materials").insert([
        {
          course_id: materialForm.courseId,
          title: materialForm.title,
          type: materialForm.type,
          file_url: url,
          file_name: filename,
          file_size: size,
          semester: materialForm.semester,
          year: Number.parseInt(materialForm.year),
        },
      ])

      if (error) throw error

      setMaterialForm({
        courseId: "",
        title: "",
        type: "exam",
        semester: "",
        year: new Date().getFullYear().toString(),
        file: null,
      })
      setUploadProgress("Material uploaded successfully!")
      setTimeout(() => setUploadProgress(""), 3000)
    } catch (error) {
      console.error("Error uploading material:", error)
      setUploadProgress("Error uploading material")
    } finally {
      setIsUploadingMaterial(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage courses and upload materials</p>
        </div>

        {uploadProgress && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-300">{uploadProgress}</div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Course */}
          <Card className="bg-[#1a1f3a] border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Course
              </CardTitle>
              <CardDescription>Create a new course entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CMPS200"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    required
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Introduction to CS"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    required
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={courseForm.department}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        department: e.target.value,
                      })
                    }
                    required
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Course description..."
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <Button type="submit" disabled={isAddingCourse} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isAddingCourse ? "Adding..." : "Add Course"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Upload Material */}
          <Card className="bg-[#1a1f3a] border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Material
              </CardTitle>
              <CardDescription>Add study materials to a course</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadMaterial} className="space-y-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={materialForm.courseId}
                    onValueChange={(value) => setMaterialForm({ ...materialForm, courseId: value })}
                    required
                  >
                    <SelectTrigger className="bg-[#0a0e27] border-gray-700">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Material Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Midterm Exam Fall 2024"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    required
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Material Type</Label>
                  <Select
                    value={materialForm.type}
                    onValueChange={(value) => setMaterialForm({ ...materialForm, type: value })}
                  >
                    <SelectTrigger className="bg-[#0a0e27] border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="solution">Solution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={materialForm.semester}
                      onValueChange={(value) => setMaterialForm({ ...materialForm, semester: value })}
                    >
                      <SelectTrigger className="bg-[#0a0e27] border-gray-700">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={materialForm.year}
                      onChange={(e) => setMaterialForm({ ...materialForm, year: e.target.value })}
                      className="bg-[#0a0e27] border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    required
                    className="bg-[#0a0e27] border-gray-700"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUploadingMaterial || !materialForm.file}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isUploadingMaterial ? "Uploading..." : "Upload Material"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Courses */}
        <Card className="bg-[#1a1f3a] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Existing Courses ({courses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 bg-[#0a0e27] rounded-lg border border-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {course.code} - {course.name}
                      </h3>
                      <p className="text-sm text-gray-400">{course.department}</p>
                      {course.description && <p className="text-sm text-gray-500 mt-2">{course.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
