import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function TaskNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">Task not found</h1>
      <p className="text-muted-foreground mb-8">
        This task does not exist or is no longer active.
      </p>
      <Link href="/tasks" className={buttonVariants()}>Browse active tasks</Link>
    </div>
  )
}
