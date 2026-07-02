export const dynamic = "force-dynamic"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

export const metadata = { title: "Tasks — GroundTruth Admin" }

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-secondary text-muted-foreground",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
}

export default async function TasksPage() {
  const supabase = createAdminClient()
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Tasks</h1>
        <Link href="/admin/tasks/new" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="mr-1 size-4" /> New task
        </Link>
      </div>

      {error && (
        <div className="text-destructive text-sm mb-4">Failed to load tasks: {error.message}</div>
      )}

      <div className="space-y-3">
        {(!tasks || tasks.length === 0) ? (
          <div className="rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
            No tasks yet. Create your first task.
          </div>
        ) : (
          (tasks as Task[]).map((task) => {
            const pct = Math.min((task.submission_count / task.target_submission_count) * 100, 100)
            return (
              <div key={task.id} className="rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold">{task.title}</h2>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>${task.reward_usd} per video</span>
                      <span>{task.submission_count} / {task.target_submission_count} collected</span>
                      <span>{Math.round(pct)}% complete</span>
                    </div>
                    <div className="mt-2 h-1.5 max-w-xs rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link
                    href={`/admin/tasks/${task.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-shrink-0")}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
