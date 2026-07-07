export type ContributorStatus = "pending" | "approved" | "rejected"
export type TaskStatus = "draft" | "active" | "paused" | "completed"
export type SubmissionStatus = "pending" | "approved" | "rejected" | "paid"

export interface Contributor {
  id: string
  full_name: string
  email: string
  country: string
  phone_model: string
  can_record_1080p: "yes" | "no" | "not_sure"
  whatsapp: string | null
  payment_method: string | null
  payment_details: string | null
  consent_confirmed: boolean
  consent_timestamp: string
  commercial_use_agreed: boolean
  ai_training_use_agreed: boolean
  privacy_rules_agreed: boolean
  status: ContributorStatus
  created_at: string
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
