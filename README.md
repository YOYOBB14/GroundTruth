# GroundTruth

A platform for collecting egocentric video footage of household tasks (washing dishes, folding laundry, organizing shelves) for humanoid robotics AI training.

Contributors film themselves from a head or chest mount camera and get paid per approved submission. Every video is reviewed manually by the founder. Every payment is sent manually.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres, Row Level Security, Storage)
- **Tailwind CSS + shadcn/ui**
- **Vercel** (recommended deployment)

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo>
cd GroundTruth
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`. This creates all three tables, indexes, RLS policies, triggers, and seed data.
3. In the Storage section, create a new bucket named `videos` — set it to **private** (not public).
4. In Project Settings → API, copy your Project URL, anon key, and service role key.

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
```

> **Security**: `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` must never be exposed to the browser. They are server-only.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Application structure

### Public contributor flow

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/instructions` | How-to guide for contributors |
| `/signup` | Contributor sign-up form |
| `/signup/success` | Post-signup confirmation |
| `/tasks` | List of active tasks |
| `/tasks/[id]` | Task detail + video upload |
| `/success` | Post-submission confirmation |

### Admin panel (`/admin/*`)

Protected by cookie-based session set at login.

| Route | Description |
|-------|-------------|
| `/admin/login` | Password login |
| `/admin` | Dashboard with stats |
| `/admin/submissions` | Review queue with video playback |
| `/admin/contributors` | Contributor profiles |
| `/admin/tasks` | Task management |
| `/admin/tasks/new` | Create a task |
| `/admin/tasks/[id]/edit` | Edit a task |
| `/api/export` | CSV download (admin only) |

---

## Database schema

Three tables managed by Supabase Postgres:

**`contributors`** — People who sign up to record videos.
- `id`, `name`, `email` (unique), `phone`, `age`, `gender`, `location`
- `consent_text`, `consent_timestamp`
- `status` (`pending` | `approved` | `rejected`), `notes`

**`tasks`** — Recording tasks posted by the founder.
- `id`, `title`, `description`, `instructions`, `requirements` (JSONB array)
- `reward_usd`, `video_count_target`, `video_count_current` (auto-incremented on approval)
- `status` (`draft` | `active` | `paused` | `completed`)

**`submissions`** — Videos submitted by contributors.
- `id`, `contributor_email` (FK -> contributors.email), `task_id` (FK -> tasks.id)
- `storage_path` (Supabase Storage path)
- `metadata` (JSONB: mount_type, camera_model, resolution, room_type, lighting, duration_seconds, notes)
- `consent_text`, `consent_timestamp`
- `status` (`pending` | `approved` | `rejected` | `paid`), `notes`
- Unique constraint on `(contributor_email, task_id)` — one submission per contributor per task

---

## Vercel deployment

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all four environment variables from `.env.local` in the Vercel project settings.
4. Deploy. Vercel automatically handles the Next.js build.

The `videos` storage bucket is private — Supabase generates signed URLs for admin video playback.

---

## What this MVP does not include

- Contributor accounts or authentication
- Automatic payments or payment integrations
- Email notifications
- Annotation or labeling tools
- Buyer-facing marketplace features
- AI pipeline or data processing
- Mobile app
- Advanced fraud detection

All review and payment is manual by the founder.
