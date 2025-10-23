import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

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
        </div>

        {materials && materials.length > 0 ? (
          <div className="grid gap-4">
            {materials.map((material) => (
              <Card key={material.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent" />
                        {material.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{material.type}</Badge>
                        {material.semester && material.year && (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {material.semester} {material.year}
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{material.file_name}</span>
                    {material.file_size && <span>{(material.file_size / 1024 / 1024).toFixed(2)} MB</span>}
                  </div>
                </CardContent>
              </Card>
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
