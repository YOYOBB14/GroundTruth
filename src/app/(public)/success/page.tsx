import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Submission received — GroundTruth",
}

interface Props {
  searchParams: { id?: string }
}

export default function SuccessPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="size-12 text-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-3">Submission received!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you. Your video is under review. We typically review submissions within 3-5 business days.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        If your submission is approved, you may qualify for a reward. We will be in touch with details.
        {searchParams.id && (
          <span className="block mt-1 font-mono text-xs">Ref: {searchParams.id}</span>
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/tasks" className={cn(buttonVariants())}>
          Submit another task
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to home
        </Link>
      </div>
    </div>
  )
}
