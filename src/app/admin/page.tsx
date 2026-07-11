export const dynamic = "force-dynamic"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { Video, Users, ListChecks, CheckCircle, Clock, XCircle } from "lucide-react"

export const metadata = { title: "Dashboard — GroundTruth Admin" }

const ZERO_STATS = {
  totalContributors: 0,
  pendingContributors: 0,
  totalSubmissions: 0,
  pendingSubmissions: 0,
  approvedSubmissions: 0,
  rejectedSubmissions: 0,
  activeTasks: 0,
  error: null as string | null,
}

async function getStats() {
  try {
    const supabase = createAdminClient()

    const [
      { count: totalContributors, error: e1 },
      { count: pendingContributors, error: e2 },
      { count: totalSubmissions, error: e3 },
      { count: pendingSubmissions, error: e4 },
      { count: approvedSubmissions, error: e5 },
      { count: rejectedSubmissions, error: e6 },
      { count: activeTasks, error: e7 },
    ] = await Promise.all([
      supabase.from("contributors").select("*", { count: "exact", head: true }),
      supabase.from("contributors").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("submissions").select("*", { count: "exact", head: true }),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "active"),
    ])

    const firstError = e1 ?? e2 ?? e3 ?? e4 ?? e5 ?? e6 ?? e7
    if (firstError) {
      console.error("[admin/getStats] Supabase error:", firstError.message)
      return { ...ZERO_STATS, error: firstError.message }
    }

    return {
      totalContributors: totalContributors ?? 0,
      pendingContributors: pendingContributors ?? 0,
      totalSubmissions: totalSubmissions ?? 0,
      pendingSubmissions: pendingSubmissions ?? 0,
      approvedSubmissions: approvedSubmissions ?? 0,
      rejectedSubmissions: rejectedSubmissions ?? 0,
      activeTasks: activeTasks ?? 0,
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[admin/getStats] Unexpected error:", message)
    return { ...ZERO_STATS, error: message }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Dashboard</h1>

      {stats.error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load stats: {stats.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard label="Total submissions" value={stats.totalSubmissions} icon={<Video className="size-4" />} />
        <StatCard label="Pending review" value={stats.pendingSubmissions} icon={<Clock className="size-4" />} highlight />
        <StatCard label="Approved" value={stats.approvedSubmissions} icon={<CheckCircle className="size-4" />} />
        <StatCard label="Rejected" value={stats.rejectedSubmissions} icon={<XCircle className="size-4" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <StatCard label="Contributors" value={stats.totalContributors} icon={<Users className="size-4" />} />
        <StatCard label="Pending contributors" value={stats.pendingContributors} icon={<Clock className="size-4" />} highlight />
        <StatCard label="Active tasks" value={stats.activeTasks} icon={<ListChecks className="size-4" />} />
      </div>

      <div>
        <h2 className="font-semibold mb-4">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/admin/submissions", label: "Review submissions", desc: `${stats.pendingSubmissions} pending` },
            { href: "/admin/contributors", label: "Manage contributors", desc: `${stats.pendingContributors} pending` },
            { href: "/admin/tasks", label: "Manage tasks", desc: `${stats.activeTasks} active` },
            { href: "/admin/submissions?status=approved", label: "Export approved", desc: "CSV download" },
            { href: "/admin/tasks/new", label: "Create new task", desc: "Add a recording task" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-border p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="font-medium text-sm mb-0.5">{link.label}</div>
              <div className="text-xs text-muted-foreground">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-foreground/30 bg-secondary/50" : "border-border"}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
