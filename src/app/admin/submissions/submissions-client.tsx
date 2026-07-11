"use client"

import { useState, useTransition } from "react"
import { updateSubmissionStatus } from "@/app/actions/admin"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Submission } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-blue-100 text-blue-800",
}

interface Props {
  submissions: Submission[]
}

export function SubmissionsClient({ submissions }: Props) {
  const [selected, setSelected] = useState<Submission | null>(null)
  const [notes, setNotes] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoLoading, setVideoLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  async function loadVideo(storagePath: string) {
    setVideoLoading(true)
    setVideoUrl("")
    const supabase = createClient()
    const { data } = await supabase.storage.from("videos").createSignedUrl(storagePath, 3600)
    setVideoUrl(data?.signedUrl ?? "")
    setVideoLoading(false)
  }

  function selectSubmission(s: Submission) {
    setSelected(s)
    setNotes(s.notes ?? "")
    setVideoUrl("")
    setActionError(null)
    loadVideo(s.storage_path)
  }

  function handleStatusUpdate(status: string) {
    if (!selected) return
    setActionError(null)
    startTransition(async () => {
      const result = await updateSubmissionStatus(selected.id, status, notes)
      if (result?.error) {
        setActionError(result.error)
        return
      }
      setLocalStatuses((prev) => ({ ...prev, [selected.id]: status }))
      setSelected((prev) => prev ? { ...prev, status: status as Submission["status"], notes } : null)
    })
  }

  const currentStatus = (s: Submission) => localStatuses[s.id] ?? s.status

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-96 border-r border-border overflow-y-auto">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No submissions found</div>
        ) : (
          <div className="divide-y divide-border">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSubmission(s)}
                className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors ${selected?.id === s.id ? "bg-secondary/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {s.task?.title ?? s.task_id.slice(0, 8)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus(s)]}`}>
                    {currentStatus(s)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{s.contributor_email}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Select a submission to review
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{selected.task?.title ?? "Submission"}</h2>
                <p className="text-sm text-muted-foreground">{selected.contributor_email}</p>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full font-medium ${STATUS_COLORS[currentStatus(selected)]}`}>
                {currentStatus(selected)}
              </span>
            </div>

            {/* Video */}
            <div className="rounded-xl border border-border overflow-hidden bg-black aspect-video flex items-center justify-center">
              {videoLoading ? (
                <Loader2 className="size-6 text-white animate-spin" />
              ) : videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full" />
              ) : (
                <div className="text-white/50 text-sm">No preview available</div>
              )}
            </div>

            {/* Metadata */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">Metadata</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(selected.metadata ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}: </span>
                    <span>{String(v ?? "—")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="rounded-xl border border-border p-4 text-sm">
              <div className="text-muted-foreground text-xs mb-1">Consent recorded at {new Date(selected.consent_timestamp).toLocaleString()}</div>
              <p className="text-muted-foreground">{selected.consent_text}</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reviewer notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes visible to you only…"
                rows={3}
              />
            </div>

            {/* Actions */}
            {actionError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Failed to update status: {actionError}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {["approved", "rejected", "paid", "pending"].map((status) => (
                <Button
                  key={status}
                  variant={currentStatus(selected) === status ? "default" : "outline"}
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(status)}
                >
                  {isPending && currentStatus(selected) !== status ? null : null}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
              {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground self-center" />}
            </div>

            <div className="text-xs text-muted-foreground">
              Submitted {new Date(selected.created_at).toLocaleString()} ·{" "}
              Storage: <span className="font-mono">{selected.storage_path}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
