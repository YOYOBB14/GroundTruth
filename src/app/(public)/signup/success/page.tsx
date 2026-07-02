import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Welcome to GroundTruth",
}

export default function SignupSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="size-12 text-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-3">You are signed up!</h1>
      <p className="text-muted-foreground mb-8">
        Your contributor profile has been created. Browse the active tasks, pick one that works for
        you, set up your camera, and start recording.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/tasks" className={cn(buttonVariants({ size: "lg" }))}>
          Browse tasks <ArrowRight className="ml-1 size-4" />
        </Link>
        <Link href="/instructions" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Read instructions
        </Link>
      </div>
    </div>
  )
}
