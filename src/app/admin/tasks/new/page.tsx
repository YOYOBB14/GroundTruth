import { TaskForm } from "../task-form"

export const metadata = { title: "New Task — GroundTruth Admin" }

export default function NewTaskPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-8">Create task</h1>
      <TaskForm />
    </div>
  )
}
