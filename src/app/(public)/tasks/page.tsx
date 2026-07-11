import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import type { Task } from "@/types"

export const metadata = {
  title: "Active Tasks — GroundTruth",
}

export const dynamic = "force-dynamic"

export default async function TasksPage() {
  // --- DIAGNOSTIC START (remove after diagnosis) ---
  console.log("[DIAG] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20))
  console.log("[DIAG] NEXT_PUBLIC_SUPABASE_ANON_KEY defined:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log("[DIAG] query: tasks.select(*).eq(status, active).order(created_at, asc)")
  // --- DIAGNOSTIC END ---

  const supabase = createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })

  // --- DIAGNOSTIC START (remove after diagnosis) ---
  console.log("[DIAG] TASKS QUERY result:", JSON.stringify({ data, error }, null, 2))
  // --- DIAGNOSTIC END ---

  if (error) {
    console.error("[tasks] Supabase error:", error.code, error.message)
  }

  const tasks = (data ?? []) as Task[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Active Tasks</h1>
        <p className="text-muted-foreground">
          Each task pays per approved submission. Sign up first, then pick a task to record.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">
          <p className="font-medium mb-1">Could not load tasks</p>
          <p className="text-sm">Please try again in a moment.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">
          <p className="font-medium mb-1">No active tasks right now</p>
          <p className="text-sm">Check back soon — new tasks are posted regularly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const current = task.submission_count || 0
            const target = task.target_submission_count || 0
            const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
            const spotsLeft = target - current
            const isFull = target > 0 && spotsLeft <= 0
            return (
              <div key={task.id} className="rounded-xl border border-border p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-base">{task.title}</h2>
                      <Badge variant="secondary" className="text-xs">
                        ${task.reward_usd} per video
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                    <div className="mb-1">
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isFull ? "Task full" : `${spotsLeft} spots remaining`}
                    </p>
                  </div>
                  <Link
                    href={`/tasks/${task.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-shrink-0")}
                  >
                    View <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">First time?</strong>{" "}
        You need to{" "}
        <Link href="/signup" className="underline text-foreground">
          sign up as a contributor
        </Link>{" "}
        before uploading. Signing up takes under 2 minutes.
      </div>
    </div>
  )
}
