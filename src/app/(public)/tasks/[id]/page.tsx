import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { TaskUploadClient } from "./task-upload-client"
import type { Task } from "@/types"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient()
  const { data } = await supabase.from("tasks").select("title").eq("id", params.id).single()
  return { title: data ? `${data.title} — GroundTruth` : "Task — GroundTruth" }
}

export const revalidate = 60

export default async function TaskDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", params.id)
    .eq("status", "active")
    .single()

  if (error || !task) notFound()

  const t = task as Task
  const current = t.submission_count || 0
  const target = t.target_submission_count || 0
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const spotsLeft = target - current
  const isFull = target > 0 && spotsLeft <= 0
  const requirements = Array.isArray(t.requirements) ? t.requirements : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <Badge variant="secondary" className="text-sm">Reward: Available</Badge>
        </div>
        <p className="text-muted-foreground mb-4">{t.description}</p>

        {/* Progress */}
        <div className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{current} / {target} videos collected</span>
            <span className="text-muted-foreground">{!isFull ? `${spotsLeft} spots left` : "Closed"}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {isFull ? (
        <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">
          <p className="font-medium mb-1">This task is full</p>
          <p className="text-sm">All spots have been filled. Check back for other active tasks.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Instructions panel */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-5">
              <h2 className="font-semibold mb-3">Instructions</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-foreground font-medium flex-shrink-0">·</span>Record from first-person perspective</li>
                <li className="flex items-start gap-2"><span className="text-foreground font-medium flex-shrink-0">·</span>Mount your phone at eye level</li>
                <li className="flex items-start gap-2"><span className="text-foreground font-medium flex-shrink-0">·</span>Good lighting required</li>
                <li className="flex items-start gap-2"><span className="text-foreground font-medium flex-shrink-0">·</span>5–10 minute continuous clip</li>
                <li className="flex items-start gap-2"><span className="text-foreground font-medium flex-shrink-0">·</span>No faces, no children, no personal documents</li>
              </ul>
              <a href="/instructions" className="mt-3 inline-block text-sm underline text-foreground">
                Full recording guidelines →
              </a>
            </div>

            {requirements.length > 0 && (
              <div className="rounded-xl border border-border p-5">
                <h2 className="font-semibold mb-3">Requirements</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-foreground font-medium flex-shrink-0">·</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Upload panel */}
          <TaskUploadClient task={t} />
        </div>
      )}
    </div>
  )
}
