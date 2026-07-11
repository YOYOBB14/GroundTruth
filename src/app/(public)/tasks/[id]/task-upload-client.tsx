"use client"

import { useState, useRef, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { verifyContributorEmail, submitVideo, type SubmitVideoState } from "@/app/actions/submission"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"
import type { Task } from "@/types"

interface Props {
  task: Task
}

type Step = "email" | "form" | "uploading"

const CONSENT_TEXT =
  "I confirm this video was recorded by me, that I am 18 or older, and that I consent to GroundTruth using this footage for AI training purposes."

export function TaskUploadClient({ task }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [contributorName, setContributorName] = useState("")
  const [emailError, setEmailError] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [storagePath, setStoragePath] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [formState, setFormState] = useState<SubmitVideoState>({ success: false })
  const [formPending, startFormTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleEmailVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setEmailLoading(true)
    setEmailError("")
    const result = await verifyContributorEmail(task.id, email.trim())
    setEmailLoading(false)
    if (result.ok) {
      setContributorName(result.contributorName ?? "")
      setStep("form")
    } else {
      setEmailError(result.error ?? "Verification failed")
    }
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const MAX_SIZE = 2 * 1024 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        setUploadError("File exceeds the 2 GB limit.")
        return
      }

      if (!file.name.match(/\.(mp4|mov|avi|mkv)$/i)) {
        setUploadError("Unsupported format. Use MP4, MOV, AVI, or MKV.")
        return
      }

      setUploadError("")
      setStep("uploading")
      setUploadProgress(0)

      const supabase = createClient()
      const path = `${task.id}/${email}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`

      const { error } = await supabase.storage.from("submissions").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        setUploadError("Upload failed: " + error.message)
        setStep("form")
        return
      }

      setStoragePath(path)
      setUploadProgress(100)
      setStep("form")
    },
    [task.id, email]
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startFormTransition(async () => {
      const result = await submitVideo(formState, formData)
      if (result.success && result.submissionId) {
        router.push(`/success?id=${result.submissionId}`)
      } else {
        setFormState(result)
      }
    })
  }

  const fieldError = (field: string) => formState.fieldErrors?.[field]?.[0]

  return (
    <div className="space-y-6">
      {/* Step: Email verification */}
      {step === "email" && (
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-1">Verify your email</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the email address you signed up with to continue.
          </p>
          <form onSubmit={handleEmailVerify} className="flex gap-2 max-w-sm">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1"
            />
            <Button type="submit" disabled={emailLoading}>
              {emailLoading && <Loader2 className="mr-1 size-4 animate-spin" />}
              Verify
            </Button>
          </form>
          {emailError && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="size-4" /> {emailError}
            </p>
          )}
        </div>
      )}

      {/* Step: Form + upload */}
      {(step === "form" || step === "uploading") && (
        <>
          {/* Email confirmed banner */}
          <div className="rounded-xl border border-border p-4 flex items-center gap-2 text-sm">
            <CheckCircle className="size-4 flex-shrink-0" />
            <span>
              Verified as <strong>{contributorName}</strong> ({email})
            </span>
          </div>

          {/* Upload area */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-1">Upload your video</h2>
            <p className="text-sm text-muted-foreground mb-4">
              MP4, MOV, AVI, or MKV — max 2 GB
            </p>

            {storagePath ? (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="size-4" />
                Video uploaded successfully
              </div>
            ) : step === "uploading" ? (
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" /> Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.avi,.mkv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="size-4" /> {uploadError}
              </p>
            )}
          </div>

          {/* Metadata form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="storagePath" value={storagePath} />

            <h2 className="font-semibold">Recording details</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="mount_type">Camera mount</Label>
                <select
                  id="mount_type"
                  name="mount_type"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select…</option>
                  <option value="head">Head mount</option>
                  <option value="chest">Chest mount</option>
                  <option value="other">Other (describe below)</option>
                </select>
                {fieldError("mount_type") && <p className="text-xs text-destructive">{fieldError("mount_type")}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camera_model">Camera model</Label>
                <Input id="camera_model" name="camera_model" placeholder="GoPro Hero 12, iPhone 15 Pro…" required />
                {fieldError("camera_model") && <p className="text-xs text-destructive">{fieldError("camera_model")}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resolution">Resolution</Label>
                <select
                  id="resolution"
                  name="resolution"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select…</option>
                  <option value="4K">4K (3840×2160)</option>
                  <option value="2.7K">2.7K (2704×1520)</option>
                  <option value="1080p">1080p (1920×1080)</option>
                  <option value="Other">Other</option>
                </select>
                {fieldError("resolution") && <p className="text-xs text-destructive">{fieldError("resolution")}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room_type">Room / location</Label>
                <select
                  id="room_type"
                  name="room_type"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select…</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Laundry room">Laundry room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Living room">Living room</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Pantry">Pantry / Storage</option>
                  <option value="Other">Other</option>
                </select>
                {fieldError("room_type") && <p className="text-xs text-destructive">{fieldError("room_type")}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lighting">Lighting conditions</Label>
                <select
                  id="lighting"
                  name="lighting"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select…</option>
                  <option value="natural">Natural (window light)</option>
                  <option value="artificial">Artificial (overhead / lamps)</option>
                  <option value="mixed">Mixed</option>
                </select>
                {fieldError("lighting") && <p className="text-xs text-destructive">{fieldError("lighting")}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration_seconds">Video duration (seconds, optional)</Label>
                <Input id="duration_seconds" name="duration_seconds" type="number" min={0} placeholder="e.g. 240" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="additional_notes">Additional notes (optional)</Label>
              <Textarea
                id="additional_notes"
                name="additional_notes"
                placeholder="Anything the reviewer should know…"
                rows={3}
              />
            </div>

            {/* Consent */}
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide">Submission consent</p>
              <p className="text-sm text-muted-foreground">{CONSENT_TEXT}</p>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" name="consent" value="true" className="mt-0.5 size-4" required />
                <span className="text-sm">I agree</span>
              </label>
            </div>

            {formState.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 flex-shrink-0" /> {formState.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={formPending || !storagePath || step === "uploading"}
            >
              {formPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {!storagePath ? "Upload a video first" : "Submit recording"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
