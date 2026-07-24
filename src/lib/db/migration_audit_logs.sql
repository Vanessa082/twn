-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Audit Logs Table (Milestone 2.5)
-- Copy and paste this into the Supabase SQL Editor to enable audit logging.
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id varchar(255) not null,
    action varchar(100) not null,
    target_type varchar(50) not null,
    target_id varchar(255),
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast ordering and filtering
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_target_type on public.audit_logs(target_type);

alter table public.audit_logs enable row level security;

-- Admin access: Service role client bypasses RLS automatically.
-- Public read access: Disabled (audit logs are strictly internal).
