-- ============================================================
-- GroundTruth Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Contributors table
create table if not exists contributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  age integer not null check (age >= 18 and age <= 100),
  gender text not null,
  location text not null,
  consent_text text not null,
  consent_timestamp timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

-- Tasks table
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  instructions text not null,
  requirements jsonb not null default '[]',
  reward_usd numeric(10,2) not null check (reward_usd > 0),
  target_submission_count integer not null check (target_submission_count > 0),
  submission_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Submissions table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_email text not null references contributors(email),
  task_id uuid not null references tasks(id),
  storage_path text not null,
  metadata jsonb not null default '{}',
  consent_text text not null,
  consent_timestamp timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(contributor_email, task_id)
);

-- Indexes
create index if not exists contributors_email_idx on contributors(email);
create index if not exists contributors_status_idx on contributors(status);
create index if not exists submissions_task_id_idx on submissions(task_id);
create index if not exists submissions_contributor_email_idx on submissions(contributor_email);
create index if not exists submissions_status_idx on submissions(status);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

create trigger submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();

-- Counter trigger: increment submission_count when submission approved
create or replace function sync_task_submission_count()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' then
    if new.status = 'approved' and old.status != 'approved' then
      update tasks set submission_count = submission_count + 1 where id = new.task_id;
    end if;
    if old.status = 'approved' and new.status != 'approved' then
      update tasks set submission_count = greatest(submission_count - 1, 0) where id = new.task_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger submissions_sync_count
  after update on submissions
  for each row execute function sync_task_submission_count();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table contributors enable row level security;
alter table tasks enable row level security;
alter table submissions enable row level security;

-- Tasks: public read for active tasks; admin full access via service role
create policy "Public can view active tasks"
  on tasks for select
  using (status = 'active');

-- Contributors: insert only (signup), no public read
create policy "Public can insert contributors"
  on contributors for insert
  with check (true);

-- Submissions: insert only for contributors
create policy "Public can insert submissions"
  on submissions for insert
  with check (true);

-- Submissions: contributor can read their own
create policy "contributors can read own submissions"
  on submissions for select
  using (true);

-- ============================================================
-- Storage bucket (run separately or via dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', false);

-- ============================================================
-- Seed Data
-- ============================================================

insert into tasks (title, description, instructions, requirements, reward_usd, target_submission_count, status)
values
(
  'Kitchen Dishwashing',
  'Record yourself washing dishes in your kitchen using a head or chest mounted camera. We need natural, unscripted footage of the full washing process for humanoid robot training.',
  E'1. Mount your camera securely on your head or chest before starting.\n2. Start recording before touching the dishes.\n3. Wash at least 5 different dishes including plates, bowls, and utensils.\n4. Include rinsing and setting aside to dry.\n5. Keep recording until the last dish is rinsed.\n6. Do not narrate — work naturally as if the camera is not there.',
  '["Camera must be mounted (head or chest — no handheld)", "Minimum 3 minutes of footage", "Kitchen must be well-lit", "At least 5 different items washed", "Both hands visible during washing"]',
  12.00,
  200,
  'active'
),
(
  'Laundry Folding',
  'Record yourself folding a load of laundry from a basket or dryer. Natural egocentric footage for humanoid robotics training data.',
  E'1. Mount your camera securely on your head or chest.\n2. Start with a full laundry basket or load from the dryer.\n3. Fold at least 10 items including shirts, pants, and towels.\n4. Stack or put away items as you normally would.\n5. Work at your natural pace — do not rush or perform for the camera.',
  '["Camera must be mounted (head or chest — no handheld)", "Minimum 4 minutes of footage", "At least 10 items folded", "Good lighting required", "Variety of item types (shirts, pants, towels, etc.)"]',
  15.00,
  150,
  'active'
),
(
  'Shelf Organization',
  'Record yourself organizing a shelf, pantry, or cabinet. Move items around, group them, and tidy the space.',
  E'1. Mount your camera on your head or chest.\n2. Choose a shelf, pantry section, or cabinet that needs organizing.\n3. Remove items, wipe down if needed, and put items back in an organized way.\n4. The task should take at least 5 minutes.\n5. Narration is optional but keep it minimal.',
  '["Camera must be mounted (head or chest — no handheld)", "Minimum 5 minutes of footage", "At least 15 items handled", "Clear view of hands and items throughout"]',
  18.00,
  100,
  'active'
),
(
  'Cooking Prep',
  'Record yourself preparing ingredients for a meal — chopping, measuring, mixing. No cooking required, just prep work.',
  E'1. Mount your camera on your head or chest before starting.\n2. Prepare ingredients for any meal of your choice.\n3. Include at least 3 different prep actions (chopping, peeling, measuring, mixing, etc.).\n4. Work on a clean, well-lit countertop.\n5. Minimum 5 minutes of footage.',
  '["Camera must be mounted (head or chest)", "Minimum 5 minutes", "At least 3 different prep actions", "Well-lit countertop", "Hands clearly visible throughout"]',
  20.00,
  100,
  'draft'
)
on conflict do nothing;

-- Seed contributors
insert into contributors (name, email, phone, age, gender, location, consent_text, status)
values
(
  'Alex Rivera',
  'alex.rivera@example.com',
  '+1-555-0101',
  28,
  'Male',
  'Austin, TX',
  'I consent to GroundTruth collecting and using my video footage for AI training purposes.',
  'approved'
),
(
  'Jordan Kim',
  'jordan.kim@example.com',
  '+1-555-0102',
  34,
  'Female',
  'Seattle, WA',
  'I consent to GroundTruth collecting and using my video footage for AI training purposes.',
  'approved'
),
(
  'Sam Patel',
  'sam.patel@example.com',
  '+1-555-0103',
  22,
  'Non-binary',
  'Chicago, IL',
  'I consent to GroundTruth collecting and using my video footage for AI training purposes.',
  'pending'
)
on conflict (email) do nothing;
