import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  course: {
    id: string
    code: string
    name: string
    department: string
    materials: Array<{ count: number }>
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const materialCount = course.materials?.[0]?.count || 0

  return (
    <Card className="group transition-all hover:shadow-lg hover:border-accent/50">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit rounded-md bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {course.code}
        </div>
        <h3 className="text-lg font-semibold leading-tight text-balance group-hover:text-accent transition-colors">
          {course.name}
        </h3>
        <p className="text-sm text-muted-foreground">{course.department}</p>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{materialCount} materials</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="ghost" className="w-full gap-2 group-hover:bg-accent/10 group-hover:text-accent">
          <Link href={`/course/${course.id}`}>
            View Materials
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
