import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm">
            <BookOpen className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Your Academic Success Hub</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            AUB Course Materials & Previous Exams
          </h1>

          <p className="mb-8 text-lg text-muted-foreground text-balance leading-relaxed md:text-xl">
            Access a comprehensive collection of study materials, previous exams, and course resources shared by AUB
            students. Prepare better, study smarter.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2">
              Browse Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contribute Materials
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
