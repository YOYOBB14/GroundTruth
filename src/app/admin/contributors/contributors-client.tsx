"use client"

import { useState, useTransition } from "react"
import { updateContributorStatus } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Contributor } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

/** Parse the structured notes field into key/value pairs */
function parseNotes(notes: string | null): Record<string, string> {
  if (!notes) return {}
  const result: Record<string, string> = {}
  for (const line of notes.split("\n")) {
    const idx = line.indexOf(": ")
    if (idx !== -1) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 2).trim()
      result[key] = value
    }
  }
  return result
}

interface Props {
  contributors: Contributor[]
}

export function ContributorsClient({ contributors }: Props) {
  const [selected, setSelected] = useState<Contributor | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

  function selectContributor(c: Contributor) {
    setSelected(c)
    // Don't pre-fill notes — those are structured data; let admin add separate notes
    setAdminNotes("")
  }

  function handleStatusUpdate(status: string) {
    if (!selected) return
    startTransition(async () => {
      await updateContributorStatus(selected.id, status, adminNotes || undefined)
      setLocalStatuses((prev) => ({ ...prev, [selected.id]: status }))
      setSelected((prev) =>
        prev ? { ...prev, status: status as Contributor["status"] } : null
      )
    })
  }

  const currentStatus = (c: Contributor) => localStatuses[c.id] ?? c.status

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-80 border-r border-border overflow-y-auto">
        {contributors.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No contributors found</div>
        ) : (
          <div className="divide-y divide-border">
            {contributors.map((c) => (
              <button
                key={c.id}
                onClick={() => selectContributor(c)}
                className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors ${
                  selected?.id === c.id ? "bg-secondary/50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium truncate max-w-[160px]">{c.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus(c)]}`}
                  >
                    {currentStatus(c)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                <div className="text-xs text-muted-foreground">{c.location}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Select a contributor to review
          </div>
        ) : (
          <DetailPanel
            contributor={selected}
            currentStatus={currentStatus(selected)}
            adminNotes={adminNotes}
            setAdminNotes={setAdminNotes}
            isPending={isPending}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  )
}

function DetailPanel({
  contributor: c,
  currentStatus,
  adminNotes,
  setAdminNotes,
  isPending,
  onStatusUpdate,
}: {
  contributor: Contributor
  currentStatus: string
  adminNotes: string
  setAdminNotes: (v: string) => void
  isPending: boolean
  onStatusUpdate: (status: string) => void
}) {
  const parsed = parseNotes(c.notes)

  const infoRows: [string, string][] = [
    ["Country", c.location || "—"],
    ["WhatsApp", c.phone || "Not provided"],
    ["Phone model", parsed["Phone model"] || "Not provided"],
    ["Payment method", parsed["Payment method"] || "Not provided"],
    ["Payment details", parsed["Payment details"] || "Not provided"],
    ["Signed up", new Date(c.created_at).toLocaleDateString()],
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{c.name}</h2>
          <p className="text-sm text-muted-foreground">{c.email}</p>
        </div>
        <span
          className={`text-sm px-2 py-1 rounded-full font-medium ${
            { pending: "bg-secondary text-foreground", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" }[currentStatus] ?? ""
          }`}
        >
          {currentStatus}
        </span>
      </div>

      {/* Info grid */}
      <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
        {infoRows.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-muted-foreground w-36 flex-shrink-0">{label}:</span>
            <span className={value === "Not provided" ? "text-muted-foreground italic" : ""}>{value}</span>
          </div>
        ))}
      </div>

      {/* Consent */}
      <div className="rounded-xl border border-border p-4 text-sm space-y-2">
        <div className="text-muted-foreground text-xs">
          Consent recorded at {new Date(c.consent_timestamp).toLocaleString()}
        </div>
        {[
          ["Age confirmed (18+)", c.consent_confirmed],
          ["Commercial & AI use agreed", c.commercial_use_agreed],
          ["AI training use agreed", c.ai_training_use_agreed],
          ["Privacy rules agreed", c.privacy_rules_agreed],
        ].map(([label, value]) => (
          <div key={label as string} className="flex items-center gap-2">
            <span className={value ? "text-green-600" : "text-red-500"}>{value ? "✓" : "✗"}</span>
            <span className={value ? "" : "text-muted-foreground"}>{label as string}</span>
          </div>
        ))}
      </div>

      {/* Admin notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Admin notes</label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Internal notes (not shown to contributor)…"
          rows={3}
        />
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {["approved", "rejected", "pending"].map((status) => (
          <Button
            key={status}
            variant={currentStatus === status ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() => onStatusUpdate(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
        {isPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground self-center" />
        )}
      </div>
    </div>
  )
}
