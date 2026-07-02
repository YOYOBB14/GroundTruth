export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ExportRow } from "@/types"

function isAdminAuthenticated(): boolean {
  try {
    const session = cookies().get("admin_session")?.value
    if (!session) return false
    const parsed = JSON.parse(session)
    return parsed.authenticated === true && parsed.expires_at > Date.now()
  } catch {
    return false
  }
}

function toCSV(rows: ExportRow[]): string {
  if (rows.length === 0) return "No data"
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[]
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n")
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = req.nextUrl.searchParams.get("status") ?? "all"
  const supabase = createAdminClient()

  let query = supabase
    .from("submissions")
    .select("id, contributor_email, task_id, storage_path, metadata, status, created_at, task:tasks(title)")
    .order("created_at", { ascending: false })

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows: ExportRow[] = (data ?? []).map((s: Record<string, unknown>) => ({
    submission_id: s.id as string,
    contributor_email: s.contributor_email as string,
    task_title: (s.task as Record<string, unknown> | null)?.title as string ?? "",
    status: s.status as ExportRow["status"],
    mount_type: ((s.metadata as Record<string, unknown>)?.mount_type as string) ?? "",
    camera_model: ((s.metadata as Record<string, unknown>)?.camera_model as string) ?? "",
    resolution: ((s.metadata as Record<string, unknown>)?.resolution as string) ?? "",
    room_type: ((s.metadata as Record<string, unknown>)?.room_type as string) ?? "",
    lighting: ((s.metadata as Record<string, unknown>)?.lighting as string) ?? "",
    duration_seconds: ((s.metadata as Record<string, unknown>)?.duration_seconds as number) ?? null,
    additional_notes: ((s.metadata as Record<string, unknown>)?.additional_notes as string) ?? "",
    submitted_at: s.created_at as string,
    storage_path: s.storage_path as string,
  }))

  const csv = toCSV(rows)
  const filename = `groundtruth-submissions-${status}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
