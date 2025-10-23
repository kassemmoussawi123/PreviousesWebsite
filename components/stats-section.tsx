import { FileText, Users, BookOpen, Download } from "lucide-react"

interface StatsSectionProps {
  totalCourses: number
  totalMaterials: number
}

export function StatsSection({ totalCourses, totalMaterials }: StatsSectionProps) {
  const stats = [
    {
      icon: BookOpen,
      value: `${totalCourses}+`,
      label: "Courses Covered",
    },
    {
      icon: FileText,
      value: `${totalMaterials}+`,
      label: "Study Materials",
    },
    {
      icon: Users,
      value: "5,000+",
      label: "Active Students",
    },
    {
      icon: Download,
      value: "50K+",
      label: "Downloads",
    },
  ]

  return (
    <section className="border-b border-border/40 bg-secondary/30 py-12">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="mb-3 h-8 w-8 text-accent" />
              <div className="mb-1 text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
