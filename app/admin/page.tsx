import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch courses for the admin dashboard
  const { data: courses, error } = await supabase.from("courses").select("*").order("code")

  if (error) {
    console.error("Error fetching courses:", error)
  }

  return <AdminDashboard courses={courses || []} />
}
