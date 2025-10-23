import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CourseGrid } from "@/components/course-grid"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  const { data: courses } = await supabase.from("courses").select("*, materials(count)").order("code")

  const { count: totalMaterials } = await supabase.from("materials").select("*", { count: "exact", head: true })

  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <StatsSection totalCourses={totalCourses || 0} totalMaterials={totalMaterials || 0} />
        <CourseGrid courses={courses || []} />
      </main>
      <Footer />
    </div>
  )
}
