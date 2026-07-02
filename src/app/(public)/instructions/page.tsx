import Link from "next/link"
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Contributor Guide — GroundTruth",
}

const QUICK_STEPS = [
  "Sign up",
  "Pick a task",
  "Record for 5–10 minutes",
  "Upload your video",
  "Earn rewards if approved",
]

const PRIVACY_RULES = [
  "Children of any age",
  "Other people (not even in the background)",
  "Faces (including your own in mirrors)",
  "IDs, passports, or government documents",
  "Bills, bank statements, or financial information",
  "Passwords or sensitive personal information",
]

const REJECTION_REASONS = [
  "Video too short (under 5 minutes)",
  "Task not completed or stopped early",
  "Poor lighting — hands or objects not clearly visible",
  "Excessive camera shake",
  "Hands not visible during the task",
  "Personal information visible in the frame",
]

export default function InstructionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Page title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contributor Guide</h1>
        <p className="text-muted-foreground">
          Everything you need to complete your first submission.
        </p>
      </div>

      <div className="space-y-10">

        {/* 1. Quick Summary */}
        <section>
          <div className="rounded-lg border-l-4 border-indigo-500 bg-white shadow-sm p-6">
            <h2 className="font-semibold text-base mb-4">Quick Summary</h2>
            <ul className="space-y-2">
              {QUICK_STEPS.map((step) => (
                <li key={step} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500 italic">
              Most contributors complete their first submission in under 15 minutes.
            </p>
          </div>
        </section>

        {/* 2. Rewards */}
        <section>
          <p className="text-sm text-muted-foreground">
            Reward details are shown on each task page after your application is approved.
          </p>
        </section>

        {/* 3. Camera Setup */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Camera Setup</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For the best approval rate, mount your phone at eye level pointing slightly
            downward toward your hands.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Preferred
              </span>
              <span className="text-sm">Head mount</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Preferred
              </span>
              <span className="text-sm">Chest mount</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Accepted
              </span>
              <span className="text-sm text-muted-foreground">
                Carefully held smartphone — only if stable and hands remain fully visible
              </span>
            </div>
          </div>
        </section>

        {/* 4. Video Quality */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Video Quality</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Record at 1080p if your phone supports it",
              "Good lighting — natural daylight or room lights on",
              "One continuous unedited clip per task",
              "5–10 minutes per recording",
              "Landscape orientation preferred",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Privacy and Safety */}
        <section>
          <div className="rounded-lg bg-red-50 border border-red-100 p-6">
            <h2 className="font-semibold text-base mb-4 text-red-800">
              Do NOT record any of the following
            </h2>
            <ul className="space-y-2">
              {PRIVACY_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="flex-shrink-0 mt-0.5">❌</span>
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-red-700">
              If any of the above appear in your video, your submission will be rejected
              and may be permanently removed.
            </p>
          </div>
        </section>

        {/* 6. Common Rejection Reasons */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Common Rejection Reasons</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {REJECTION_REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {reason}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Review your video before uploading to avoid common rejections.
          </p>
        </section>

        {/* 7. Review and Payment */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Review and Payment</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Submissions are reviewed within 3–5 business days",
              "Approved submissions may qualify for rewards. Reward availability and timing may vary by task and program stage.",
              "Payment method must be set in your contributor profile",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 8. Audio */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Audio</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Normal household sounds are fine",
              "Avoid background music",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-indigo-600 hover:bg-indigo-700 text-white")}>
            Become a Contributor <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
