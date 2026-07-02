export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { TaskForm } from "../../task-form"
import type { Task } from "@/types"

interface Props {
  params: { id: string }
}

export const metadata = { title: "Edit Task — GroundTruth Admin" }

export default async function EditTaskPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !task) notFound()

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-8">Edit task</h1>
      <TaskForm task={task as Task} />
    </div>
  )
}
