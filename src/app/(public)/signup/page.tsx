import { SignupForm } from "./signup-form"

export const metadata = {
  title: "Sign up — GroundTruth",
}

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Become a contributor</h1>
        <p className="text-muted-foreground mb-1">
          We will review your application within 48 hours.
        </p>
        <p className="text-sm text-indigo-600 font-medium">
          Join the early contributor program and get access to available recording tasks.
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
