"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"

// Converts any empty / whitespace-only form value to null so nullable DB
// columns never receive an empty string.
function nullableStr(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string" || v.trim() === "") return null
  return v.trim()
}

const PAYMENT_METHODS = ["paypal", "wise", "local_bank", "other"] as const

const signupSchema = z.object({
  // Required
  full_name:        z.string().min(2, "Name must be at least 2 characters"),
  email:            z.string().email("Enter a valid email address"),
  country:          z.string().min(1, "Select your country"),
  phone_model:      z.string().min(2, "Enter your phone or camera model"),
  can_record_1080p: z.enum(["yes", "no", "not_sure"], { error: "Please select an option" }),
  // Optional nullable — always string | null after nullableStr()
  whatsapp:         z.string().nullable(),
  payment_method:   z.enum(PAYMENT_METHODS).nullable(),
  payment_details:  z.string().nullable(),
  // Consent checkboxes
  consent_age:        z.literal("true", { error: "You must confirm you are 18 or older" }),
  consent_commercial: z.literal("true", { error: "You must agree to commercial use" }),
  consent_privacy:    z.literal("true", { error: "You must agree to privacy rules" }),
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
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("[signupContributor] env — url:", supabaseUrl ? "set" : "MISSING", "| key:", serviceKey ? "set" : "MISSING")
    if (!supabaseUrl || !serviceKey) {
      return { success: false, error: "Supabase not configured" }
    }

    const raw = {
      // Required
      full_name:        formData.get("full_name"),
      email:            formData.get("email"),
      country:          formData.get("country"),
      phone_model:      formData.get("phone_model"),
      can_record_1080p: formData.get("can_record_1080p"),
      // Optional — empty string → null
      whatsapp:         nullableStr(formData.get("whatsapp")),
      payment_method:   nullableStr(formData.get("payment_method")),
      payment_details:  nullableStr(formData.get("payment_details")),
      // Consent
      consent_age:        formData.get("consent_age"),
      consent_commercial: formData.get("consent_commercial"),
      consent_privacy:    formData.get("consent_privacy"),
    }

    console.log("[signupContributor] raw —", {
      full_name: raw.full_name,
      email: raw.email,
      country: raw.country,
      phone_model: raw.phone_model,
      can_record_1080p: raw.can_record_1080p,
      payment_method: raw.payment_method,
    })

    const result = signupSchema.safeParse(raw)
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const [key, issues] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[key] = issues ?? []
      }
      console.log("[signupContributor] validation failed:", JSON.stringify(fieldErrors))
      return { success: false, fieldErrors }
    }

    const {
      full_name, email, country, phone_model, can_record_1080p,
      whatsapp, payment_method, payment_details,
    } = result.data

    const supabase = createAdminClient()

    const { error } = await supabase.from("contributors").insert({
      // Required columns
      full_name,
      email,
      country,
      phone_model,
      can_record_1080p,
      status: "pending",
      // Consent columns
      consent_confirmed:    true,
      consent_timestamp:    new Date().toISOString(),
      commercial_use_agreed: true,
      ai_training_use_agreed: true,
      privacy_rules_agreed:  true,
      // Optional nullable columns — already null if empty
      whatsapp,
      payment_method,
      payment_details,
    })

    if (error) {
      console.error("[signupContributor] Supabase error — code:", error.code, "| message:", error.message, "| details:", error.details, "| hint:", error.hint)
      if (error.code === "23505") {
        return { success: false, error: "This email is already registered." }
      }
      return { success: false, error: `Insert failed: ${error.message}` }
    }

    console.log("[signupContributor] success —", email)
    return { success: true }
  } catch (err) {
    console.error("[signupContributor] exception:", err instanceof Error ? err.stack : String(err))
    return { success: false, error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` }
  }
}
