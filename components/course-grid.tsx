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

const courses = [
  {
    id: "1",
    code: "CMPS 200",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    materials: [{ count: 45 }],
  },
  {
    id: "2",
    code: "MATH 201",
    name: "Calculus II",
    department: "Mathematics",
    materials: [{ count: 38 }],
  },
  {
    id: "3",
    code: "ECON 210",
    name: "Principles of Economics",
    department: "Economics",
    materials: [{ count: 52 }],
  },
  {
    id: "4",
    code: "PHYS 210",
    name: "General Physics II",
    department: "Physics",
    materials: [{ count: 41 }],
  },
  {
    id: "5",
    code: "CHEM 201",
    name: "Organic Chemistry I",
    department: "Chemistry",
    materials: [{ count: 36 }],
  },
  {
    id: "6",
    code: "BIOL 240",
    name: "Cell Biology",
    department: "Biology",
    materials: [{ count: 44 }],
  },
  {
    id: "7",
    code: "ENGL 204",
    name: "Academic Writing",
    department: "English",
    materials: [{ count: 29 }],
  },
  {
    id: "8",
    code: "PSYC 201",
    name: "Introduction to Psychology",
    department: "Psychology",
    materials: [{ count: 33 }],
  },
]

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">Popular Courses</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Browse our most accessed course materials and exam archives
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}
