export const dynamic = "force-dynamic"
export const revalidate = 0
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { SubmissionsClient } from "./submissions-client"
import type { Submission } from "@/types"

export const metadata = { title: "Submissions — GroundTruth Admin" }

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "paid"] as const

interface Props {
  searchParams: { status?: string }
}

export default async function SubmissionsPage({ searchParams }: Props) {
  const supabase = createAdminClient()
  const status = searchParams.status ?? "all"

  let query = supabase
    .from("submissions")
    .select("*, task:tasks(title)")
    .order("created_at", { ascending: false })
    .limit(200)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data: submissions, error } = await query

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">Submissions</h1>
          <p className="text-sm text-muted-foreground">{submissions?.length ?? 0} shown</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Status filters */}
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <Link
                key={s}
                href={s === "all" ? "/admin/submissions" : `/admin/submissions?status=${s}`}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                  status === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          {/* CSV export */}
          <a
            href={`/api/export?status=${status}`}
            className="text-sm text-muted-foreground underline"
          >
            Export CSV
          </a>
        </div>
      </div>

      {error ? (
        <div className="p-6 text-destructive text-sm">Failed to load submissions: {error.message}</div>
      ) : (
        <div className="flex-1 min-h-0">
          <SubmissionsClient submissions={(submissions ?? []) as Submission[]} />
        </div>
      )}
    </div>
  )
}
