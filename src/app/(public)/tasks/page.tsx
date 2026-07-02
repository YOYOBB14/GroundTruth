import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

export const metadata = {
  title: "Active Tasks — GroundTruth",
}

export const revalidate = 60

const STATIC_TASKS = [
  {
    id: "static-1",
    title: "Wash Dishes",
    description: "Record yourself washing dishes from start to finish.",
    duration: "5–10 minutes",
  },
  {
    id: "static-2",
    title: "Fold Laundry",
    description: "Fold at least 8–10 clean clothing items on a flat surface.",
    duration: "5–8 minutes",
  },
  {
    id: "static-3",
    title: "Organize Shelves",
    description: "Organize items on a kitchen shelf or cabinet.",
    duration: "5–10 minutes",
  },
]

export default async function TasksPage() {
  let tasks: Task[] | null = null
  let isPreview = false

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true })

    if (!error) {
      tasks = data as Task[]
    }
  } catch {
    isPreview = true
  }

  if (tasks === null) {
    isPreview = true
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {isPreview && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Preview mode — connect Supabase to load live tasks
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Active Tasks</h1>
        <p className="text-muted-foreground">
          Each task pays per approved submission. Sign up first, then pick a task to record.
        </p>
      </div>

      {isPreview ? (
        <div className="space-y-4">
          {STATIC_TASKS.map((task) => (
            <div key={task.id} className="rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-base">{task.title}</h2>
                    <Badge variant="secondary" className="text-xs">
                      Reward: Available
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{task.duration}</p>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Link
                  href="/tasks"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-shrink-0")}
                >
                  View Task
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : !tasks || tasks.length === 0 ? (
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
                        Reward: Available
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
