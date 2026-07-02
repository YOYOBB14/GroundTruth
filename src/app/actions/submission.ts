"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SubmissionMetadata } from "@/types"

const verifyEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  taskId: z.string().uuid(),
})

const metadataSchema = z.object({
  email: z.string().email(),
  taskId: z.string().uuid(),
  mount_type: z.enum(["head", "chest", "other"]),
  camera_model: z.string().min(1, "Camera model required"),
  resolution: z.string().min(1, "Resolution required"),
  room_type: z.string().min(1, "Room type required"),
  lighting: z.enum(["natural", "artificial", "mixed"]),
  duration_seconds: z.coerce.number().nullable().optional(),
  additional_notes: z.string().optional(),
})

export type VerifyEmailState = {
  ok: boolean
  error?: string
  contributorName?: string
  alreadySubmitted?: boolean
}

export async function verifyContributorEmail(
  taskId: string,
  email: string
): Promise<VerifyEmailState> {
  const result = verifyEmailSchema.safeParse({ email, taskId })
  if (!result.success) return { ok: false, error: "Invalid email address" }

  const supabase = createAdminClient()

  const { data: contributor, error: contribError } = await supabase
    .from("contributors")
    .select("name, email, status")
    .eq("email", email)
    .single()

  if (contribError || !contributor) {
    return {
      ok: false,
      error:
        "Email not found. Please sign up first or check for typos.",
    }
  }

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("contributor_email", email)
    .eq("task_id", taskId)
    .maybeSingle()

  if (existing) {
    return {
      ok: false,
      alreadySubmitted: true,
      error: `You already have a submission for this task (status: ${existing.status}).`,
    }
  }

  return { ok: true, contributorName: contributor.name }
}

export type SubmitVideoState = {
  success: boolean
  submissionId?: string
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function submitVideo(
  _prev: SubmitVideoState,
  formData: FormData
): Promise<SubmitVideoState> {
  const raw = {
    email: formData.get("email"),
    taskId: formData.get("taskId"),
    mount_type: formData.get("mount_type"),
    camera_model: formData.get("camera_model"),
    resolution: formData.get("resolution"),
    room_type: formData.get("room_type"),
    lighting: formData.get("lighting"),
    duration_seconds: formData.get("duration_seconds") || null,
    additional_notes: formData.get("additional_notes"),
    storagePath: formData.get("storagePath"),
    consent: formData.get("consent"),
  }

  if (!raw.storagePath) {
    return { success: false, error: "Video file required. Please upload a file." }
  }
  if (raw.consent !== "true") {
    return { success: false, error: "You must consent to submit." }
  }

  const result = metadataSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, issues] of Object.entries(result.error.flatten().fieldErrors)) {
      fieldErrors[key] = issues ?? []
    }
    return { success: false, fieldErrors }
  }

  const { email, taskId, mount_type, camera_model, resolution, room_type, lighting, duration_seconds, additional_notes } = result.data

  const CONSENT_TEXT =
    "I confirm this video was recorded by me, that I am 18 or older, and that I consent to GroundTruth using this footage for AI training purposes."

  const metadata: SubmissionMetadata = {
    mount_type,
    camera_model,
    resolution,
    room_type,
    lighting,
    duration_seconds: duration_seconds ?? null,
    additional_notes: additional_notes ?? "",
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      contributor_email: email,
      task_id: taskId,
      storage_path: raw.storagePath as string,
      metadata,
      consent_text: CONSENT_TEXT,
      consent_timestamp: new Date().toISOString(),
      status: "pending",
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You already submitted for this task." }
    }
    return { success: false, error: "Submission failed. Please try again." }
  }

  return { success: true, submissionId: data.id }
}
