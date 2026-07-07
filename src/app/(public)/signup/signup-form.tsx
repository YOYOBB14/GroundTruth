"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { signupContributor, type SignupState } from "@/app/actions/contributor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Priority countries shown first, then alphabetical
const PRIORITY_COUNTRIES = [
  "Indonesia",
  "Philippines",
  "Vietnam",
  "Malaysia",
  "Thailand",
  "India",
  "Bangladesh",
  "Pakistan",
  "Nigeria",
  "Ghana",
  "Kenya",
  "Brazil",
  "Mexico",
  "Colombia",
]

const OTHER_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Belarus", "Belgium",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bulgaria", "Cambodia",
  "Cameroon", "Canada", "Chile", "China", "Costa Rica", "Croatia",
  "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Estonia", "Ethiopia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Guatemala", "Honduras", "Hong Kong", "Hungary",
  "Iceland", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Maldives", "Malta", "Mauritius", "Moldova",
  "Mongolia", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "North Macedonia", "Norway",
  "Oman", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia",
  "Senegal", "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Tunisia",
  "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela",
  "Yemen", "Zambia", "Zimbabwe",
].filter((c) => !PRIORITY_COUNTRIES.includes(c)).sort()

const PAYMENT_OPTIONS = [
  { value: "", label: "Select…", disabled: true },
  { value: "PayPal", label: "PayPal" },
  { value: "Wise", label: "Wise" },
  { value: "Local Bank Transfer", label: "Local Bank Transfer" },
  { value: "Not sure yet", label: "Not sure yet" },
  { value: "Other", label: "Other" },
]

export function SignupForm() {
  const router = useRouter()
  const [state, setState] = useState<SignupState>({ success: false })
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signupContributor(state, formData)
      if (result.success) {
        router.push("/signup/success")
      } else {
        setState(result)
      }
    })
  }

  const fe = (field: string) => state.fieldErrors?.[field]?.[0]

  const selectCls =
    "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Required fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" placeholder="Alex Rivera" autoComplete="name" />
          {fe("full_name") && <p className="text-xs text-destructive">{fe("full_name")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="alex@example.com" autoComplete="email" />
          {fe("email") && <p className="text-xs text-destructive">{fe("email")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <select id="country" name="country" className={selectCls} defaultValue="">
            <option value="" disabled>Select your country…</option>
            <optgroup label="— Recommended —">
              {PRIORITY_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
            <optgroup label="— All countries —">
              {OTHER_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          </select>
          {fe("country") && <p className="text-xs text-destructive">{fe("country")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone_model">Phone or camera model</Label>
          <Input
            id="phone_model"
            name="phone_model"
            placeholder="e.g. Samsung Galaxy A53, iPhone 12"
          />
          {fe("phone_model") && <p className="text-xs text-destructive">{fe("phone_model")}</p>}
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">
            WhatsApp number{" "}
            <span className="text-muted-foreground font-normal">— Optional</span>
          </Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="+1 234 567 8900"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment_method">
            Preferred payment method{" "}
            <span className="text-muted-foreground font-normal">— Optional</span>
          </Label>
          <select
            id="payment_method"
            name="payment_method"
            className={selectCls}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional: payment details */}
      {paymentMethod && paymentMethod !== "Not sure yet" && (
        <div className="space-y-1.5">
          <Label htmlFor="payment_details">
            Payment address or account details{" "}
            <span className="text-muted-foreground font-normal">— Optional</span>
          </Label>
          <Input
            id="payment_details"
            name="payment_details"
            placeholder="Your PayPal email, Wise email, or bank details"
          />
        </div>
      )}

      {/* Consent checkboxes */}
      <div className="rounded-xl border border-border bg-gray-50 p-5 space-y-4">
        <p className="text-sm font-semibold">Before you continue:</p>

        <ConsentRow
          name="consent_age"
          error={fe("consent_age")}
          label="I confirm I am 18 years of age or older."
        />
        <ConsentRow
          name="consent_commercial"
          error={fe("consent_commercial")}
          label="I agree that my approved videos may be used for AI and robotics training purposes."
        />
        <ConsentRow
          name="consent_privacy"
          error={fe("consent_privacy")}
          label="I understand I must not record children, other people, faces, personal documents, IDs, passwords, bills, or any sensitive personal information."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Continue
      </Button>
    </form>
  )
}

function ConsentRow({
  name,
  label,
  error,
}: {
  name: string
  label: string
  error?: string
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          name={name}
          value="true"
          className="mt-0.5 size-4 rounded border-gray-300 accent-indigo-600 flex-shrink-0"
          required
        />
        <span className="text-sm text-gray-700 leading-snug">{label}</span>
      </label>
      {error && <p className="mt-1 ml-7 text-xs text-destructive">{error}</p>}
    </div>
  )
}
