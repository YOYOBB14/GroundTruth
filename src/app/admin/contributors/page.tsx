export const dynamic = "force-dynamic"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { ContributorsClient } from "./contributors-client"
import type { Contributor } from "@/types"

export const metadata = { title: "Contributors — GroundTruth Admin" }

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"] as const

interface Props {
  searchParams: { status?: string }
}

export default async function ContributorsPage({ searchParams }: Props) {
  const supabase = createAdminClient()
  const status = searchParams.status ?? "all"

  let query = supabase
    .from("contributors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data: contributors, error } = await query

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">Contributors</h1>
          <p className="text-sm text-muted-foreground">{contributors?.length ?? 0} shown</p>
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <Link
              key={s}
              href={s === "all" ? "/admin/contributors" : `/admin/contributors?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                status === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-6 text-destructive text-sm">Failed to load contributors: {error.message}</div>
      ) : (
        <div className="flex-1 min-h-0">
          <ContributorsClient contributors={(contributors ?? []) as Contributor[]} />
        </div>
      )}
    </div>
  )
}
