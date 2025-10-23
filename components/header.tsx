import { BookOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          <span className="text-xl font-semibold">AUB Resources</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10 bg-secondary/50" />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Browse
          </Button>
          <Button variant="ghost" className="hidden sm:inline-flex">
            Upload
          </Button>
          <Button>Sign In</Button>
        </nav>
      </div>
    </header>
  )
}
