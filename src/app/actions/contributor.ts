"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"

const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
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

export type SignupState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function signupContributor(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("[signupContributor] env check — url:", supabaseUrl ? "set" : "MISSING", "| service key:", serviceKey ? "set" : "MISSING")
    if (!supabaseUrl || !serviceKey) {
      return { success: false, error: "Supabase not configured" }
    }

    const raw = {
      full_name: formData.get("full_name"),
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
    console.log("[signupContributor] raw fields — full_name:", raw.full_name, "| email:", raw.email, "| country:", raw.country, "| phone_model:", raw.phone_model)

    const result = signupSchema.safeParse(raw)
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const [key, issues] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[key] = issues ?? []
      }
      console.log("[signupContributor] validation failed:", JSON.stringify(fieldErrors))
      return { success: false, fieldErrors }
    }

    const { full_name, email, country, phone_model, whatsapp, payment_method, payment_details } =
      result.data

    const supabase = createAdminClient()

    const row = {
      full_name,
      email,
      country,
      phone_model,
      whatsapp: whatsapp ?? null,
      payment_method: payment_method ?? null,
      payment_details: payment_details ?? null,
      consent_confirmed: true,
      consent_timestamp: new Date().toISOString(),
      commercial_use_agreed: true,
      ai_training_use_agreed: true,
      privacy_rules_agreed: true,
      status: "pending",
    }
    console.log("[signupContributor] inserting row — email:", row.email)

    const { error } = await supabase.from("contributors").insert(row)

    if (error) {
      console.error("[signupContributor] Supabase insert error — code:", error.code, "| message:", error.message, "| details:", error.details, "| hint:", error.hint)
      if (error.code === "23505") {
        return { success: false, error: "This email is already registered." }
      }
      return { success: false, error: `Insert failed: ${error.message}` }
    }

    console.log("[signupContributor] success — email:", email)
    return { success: true }
  } catch (err) {
    console.error("[signupContributor] unexpected exception:", err instanceof Error ? err.stack : String(err))
    return { success: false, error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` }
  }
}
