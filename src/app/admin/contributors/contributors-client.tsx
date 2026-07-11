"use client"

import { useState, useTransition } from "react"
import { updateContributorStatus } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Contributor } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

interface Props {
  contributors: Contributor[]
}

export function ContributorsClient({ contributors }: Props) {
  const [selected, setSelected] = useState<Contributor | null>(null)
  const [isPending, startTransition] = useTransition()
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  function selectContributor(c: Contributor) {
    setSelected(c)
    setActionError(null)
  }

  function handleStatusUpdate(status: string) {
    if (!selected) return
    setActionError(null)
    startTransition(async () => {
      const result = await updateContributorStatus(selected.id, status)
      if (result?.error) {
        setActionError(result.error)
        return
      }
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
                  <span className="text-sm font-medium truncate max-w-[160px]">{c.full_name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus(c)]}`}
                  >
                    {currentStatus(c)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                <div className="text-xs text-muted-foreground">{c.country}</div>
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
            isPending={isPending}
            actionError={actionError}
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
  isPending,
  actionError,
  onStatusUpdate,
}: {
  contributor: Contributor
  currentStatus: string
  isPending: boolean
  actionError: string | null
  onStatusUpdate: (status: string) => void
}) {
  const infoRows: [string, string][] = [
    ["Country", c.country || "—"],
    ["WhatsApp", c.whatsapp || "Not provided"],
    ["Phone model", c.phone_model || "Not provided"],
    ["Can record 1080p", c.can_record_1080p || "Not provided"],
    ["Payment method", c.payment_method || "Not provided"],
    ["Payment details", c.payment_details || "Not provided"],
    ["Signed up", new Date(c.created_at).toLocaleDateString()],
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{c.full_name}</h2>
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

      {/* Status actions */}
      {actionError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to update status: {actionError}
        </div>
      )}
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
