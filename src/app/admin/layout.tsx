import Link from "next/link"
import { Aperture, LayoutDashboard, Video, Users, ListChecks, LogOut } from "lucide-react"
import { adminLogout } from "@/app/actions/admin"

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Video },
  { href: "/admin/contributors", label: "Contributors", icon: Users },
  { href: "/admin/tasks", label: "Tasks", icon: ListChecks },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 border-r border-border flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 h-14 px-4 border-b border-border font-semibold">
          <Aperture className="size-4" />
          <span>GroundTruth</span>
          <span className="text-xs text-muted-foreground ml-auto">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
