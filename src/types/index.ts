export type ContributorStatus = "pending" | "approved" | "rejected"
export type TaskStatus = "draft" | "active" | "paused" | "completed"
export type SubmissionStatus = "pending" | "approved" | "rejected" | "paid"

export interface Contributor {
  id: string
  name: string
  email: string
  /** Stores country (e.g. "Indonesia") */
  location: string
  /** Stores WhatsApp number, may be empty string if not provided */
  phone: string
  consent_text: string
  consent_timestamp: string
  status: ContributorStatus
  /** Structured text: phone_model, payment_method, payment_details */
  notes: string | null
  created_at: string
  // Optional logical fields parsed from notes
  whatsapp?: string
  payment_method?: string
  payment_details?: string
  phone_model?: string
}

export interface Task {
  id: string
  title: string
  description: string
  instructions: string
  requirements: string[]
  reward_usd: number
  target_submission_count: number
  submission_count: number
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  contributor_email: string
  task_id: string
  storage_path: string
  metadata: SubmissionMetadata
  consent_text: string
  consent_timestamp: string
  status: SubmissionStatus
  notes: string | null
  created_at: string
  updated_at: string
  task?: Task
}

export interface SubmissionMetadata {
  mount_type: "head" | "chest" | "other"
  camera_model: string
  resolution: string
  room_type: string
  lighting: "natural" | "artificial" | "mixed"
  duration_seconds: number | null
  additional_notes: string
}

export interface AdminSession {
  authenticated: boolean
  expires_at: number
}

export interface ExportRow {
  submission_id: string
  contributor_email: string
  task_title: string
  status: SubmissionStatus
  mount_type: string
  camera_model: string
  resolution: string
  room_type: string
  lighting: string
  duration_seconds: number | null
  additional_notes: string
  submitted_at: string
  storage_path: string
}
