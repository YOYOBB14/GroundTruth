export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} GroundTruth</span>
        <span>AI training data for humanoid robotics</span>
      </div>
    </footer>
  )
}
