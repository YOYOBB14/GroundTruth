import Link from "next/link"
import { Aperture } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Aperture className="size-5" />
          GroundTruth
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/tasks" className="hover:text-foreground transition-colors">
            Tasks
          </Link>
          <Link href="/instructions" className="hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors font-medium text-foreground">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  )
}
