"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createTask, updateTask } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Task } from "@/types"

interface Props {
  task?: Task
}

export function TaskForm({ task }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError("")
    const formData = new FormData(e.currentTarget)
    try {
      if (task) {
        await updateTask(task.id, formData)
      } else {
        await createTask(formData)
      }
      router.push("/admin/tasks")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save task")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={task?.title} required placeholder="Kitchen Dishwashing" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Short description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={task?.description}
          required
          placeholder="Brief description shown on the task list"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instructions">Instructions (shown to contributor)</Label>
        <Textarea
          id="instructions"
          name="instructions"
          defaultValue={task?.instructions}
          required
          rows={8}
          placeholder={"1. Mount camera on head or chest.\n2. Start recording before touching the dishes.\n..."}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="requirements">Requirements (one per line)</Label>
        <Textarea
          id="requirements"
          name="requirements"
          defaultValue={Array.isArray(task?.requirements) ? task.requirements.join("\n") : ""}
          rows={5}
          placeholder={"Camera must be mounted\nMinimum 3 minutes\n..."}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="reward_usd">Reward (USD)</Label>
          <Input
            id="reward_usd"
            name="reward_usd"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={task?.reward_usd}
            required
            placeholder="12.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_submission_count">Target video count</Label>
          <Input
            id="target_submission_count"
            name="target_submission_count"
            type="number"
            min="1"
            defaultValue={task?.target_submission_count}
            required
            placeholder="200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? "draft"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {task ? "Save changes" : "Create task"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
