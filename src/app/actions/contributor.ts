"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  country: z.string().min(1, "Select your country"),
  phone_model: z.string().min(2, "Enter your phone or camera model"),
  whatsapp: z.string().optional(),
  payment_method: z.string().optional(),
  payment_details: z.string().optional(),
  consent_age: z.literal("true", { error: "You must confirm you are 18 or older" }),
  consent_commercial: z.literal("true", { error: "You must agree to commercial use" }),
  consent_privacy: z.literal("true", { error: "You must agree to privacy rules" }),
})

function buildConsentText(): string {
  return [
    "Age confirmed: I confirm I am 18 years of age or older.",
    "Commercial & AI use agreed: I agree that my approved videos may be used for AI and robotics training purposes.",
    "Privacy rules agreed: I understand I must not record children, other people, faces, personal documents, IDs, passwords, bills, or any sensitive personal information.",
  ].join(" | ")
}

function buildNotes(phone_model: string, payment_method?: string, payment_details?: string): string {
  const lines = [`Phone model: ${phone_model}`]
  if (payment_method) lines.push(`Payment method: ${payment_method}`)
  if (payment_details) lines.push(`Payment details: ${payment_details}`)
  return lines.join("\n")
}

export type SignupState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function signupContributor(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    country: formData.get("country"),
    phone_model: formData.get("phone_model"),
    whatsapp: formData.get("whatsapp") || undefined,
    payment_method: formData.get("payment_method") || undefined,
    payment_details: formData.get("payment_details") || undefined,
    consent_age: formData.get("consent_age"),
    consent_commercial: formData.get("consent_commercial"),
    consent_privacy: formData.get("consent_privacy"),
  }

  const result = signupSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, issues] of Object.entries(result.error.flatten().fieldErrors)) {
      fieldErrors[key] = issues ?? []
    }
    return { success: false, fieldErrors }
  }

  const { name, email, country, phone_model, whatsapp, payment_method, payment_details } =
    result.data

  const supabase = createAdminClient()

  const { error } = await supabase.from("contributors").insert({
    name,
    email,
    location: country,
    phone: whatsapp ?? "",
    consent_text: buildConsentText(),
    consent_timestamp: new Date().toISOString(),
    notes: buildNotes(phone_model, payment_method, payment_details),
    status: "pending",
  })

  if (error) {
    console.error("[signupContributor] Supabase error:", error.code, error.message, error.details, error.hint)
    if (error.code === "23505") {
      return { success: false, error: "This email is already registered." }
    }
    return { success: false, error: "Something went wrong. Please try again." }
  }

  return { success: true }
}
