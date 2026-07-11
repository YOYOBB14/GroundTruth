"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AdminSession } from "@/types"

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

export async function adminLogin(_prev: { error?: string }, formData: FormData) {
  const password = formData.get("password") as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password" }
  }

  const session: AdminSession = {
    authenticated: true,
    expires_at: Date.now() + SESSION_DURATION,
  }

  cookies().set("admin_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  redirect("/admin")
}

export async function adminLogout() {
  cookies().delete("admin_session")
  redirect("/admin/login")
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: string,
  notes?: string
): Promise<{ error: string } | undefined> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("submissions")
    .update({ status, notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", submissionId)
  if (error) {
    console.error("[updateSubmissionStatus]", error.message)
    return { error: error.message }
  }
  revalidatePath("/admin/submissions")
  revalidatePath("/admin")
}

export async function updateContributorStatus(
  contributorId: string,
  status: string,
): Promise<{ error: string } | undefined> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("contributors")
    .update({ status })
    .eq("id", contributorId)
  if (error) {
    console.error("[updateContributorStatus]", error.message)
    return { error: error.message }
  }
  revalidatePath("/admin/contributors")
  revalidatePath("/admin")
}

export async function createTask(formData: FormData) {
  const supabase = createAdminClient()
  const requirements = (formData.get("requirements") as string)
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)

  const { error } = await supabase.from("tasks").insert({
    title: formData.get("title"),
    description: formData.get("description"),
    instructions: formData.get("instructions"),
    requirements,
    reward_usd: parseFloat(formData.get("reward_usd") as string),
    target_submission_count: parseInt(formData.get("target_submission_count") as string),
    status: formData.get("status") ?? "draft",
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/tasks")
  revalidatePath("/admin")
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = createAdminClient()
  const requirements = (formData.get("requirements") as string)
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from("tasks")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      instructions: formData.get("instructions"),
      requirements,
      reward_usd: parseFloat(formData.get("reward_usd") as string),
      target_submission_count: parseInt(formData.get("target_submission_count") as string),
      status: formData.get("status"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/tasks")
  revalidatePath("/admin")
}
