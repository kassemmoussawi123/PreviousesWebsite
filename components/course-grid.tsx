import { CourseCard } from "@/components/course-card"

interface CourseGridProps {
  courses: Array<{
    id: string
    code: string
    name: string
    department: string
    materials: Array<{ count: number }>
  }>
}

export function CourseGrid({ courses }: CourseGridProps) {
  const sortedCourses = [...courses].sort((a, b) => a.code.localeCompare(b.code))
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">Popular Courses</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Browse our most accessed course materials and exam archives
          </p>
        </div>

        {sortedCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No courses available yet. Check back soon!</p>
        )}
      </div>
    </section>
  )
}
