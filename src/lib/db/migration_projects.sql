-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Projects (Workbench)
-- Run this in Supabase SQL Editor after schema.sql.
-- Powers the Workbench section on the homepage.
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.projects (
    id               uuid default uuid_generate_v4() primary key,
    name             varchar(255) not null,
    category         varchar(100) not null,           -- e.g. "SaaS", "Open Source", "TWN"
    status           varchar(50) not null default 'Building'
        check (status in ('Building', 'Active', 'Shipped', 'Continuous', 'Paused')),
    overview         text not null,
    why_started      text,
    what_im_learning text,
    -- Array of tech labels, e.g. '{"Next.js","Supabase","TypeScript"}'
    stack            text[] not null default '{}',
    url              text,
    is_published     boolean not null default false,
    -- Lower = appears first in the Workbench section
    display_order    integer not null default 0,
    created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at       timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Database validation is the final trust boundary. The same limits also exist
-- in the admin form and the Zod server-action schema.
do $$ begin
  alter table public.projects add constraint projects_name_length
    check (char_length(trim(name)) between 2 and 120);
  alter table public.projects add constraint projects_category_length
    check (char_length(trim(category)) between 2 and 60);
  alter table public.projects add constraint projects_overview_length
    check (char_length(trim(overview)) between 10 and 600);
  alter table public.projects add constraint projects_why_started_length
    check (why_started is null or char_length(trim(why_started)) between 1 and 800);
  alter table public.projects add constraint projects_learning_length
    check (what_im_learning is null or char_length(trim(what_im_learning)) between 1 and 800);
  alter table public.projects add constraint projects_stack_limit
    check (cardinality(stack) <= 12);
  alter table public.projects add constraint projects_url_safe
    check (url is null or (char_length(url) <= 2048 and url ~* '^https?://'));
  alter table public.projects add constraint projects_display_order_range
    check (display_order between 0 and 999);
exception when duplicate_object then null;
end $$;

-- Indexes
create index if not exists idx_projects_published on public.projects(is_published, display_order);

alter table public.projects enable row level security;

-- Public: read published projects only
do $$ begin
  create policy "Allow public read of published projects"
  on public.projects for select
  using (is_published = true);
exception when duplicate_object then null;
end $$;

-- Admin writes via service role (bypasses RLS)

-- Auto-update updated_at
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute procedure public.handle_update_timestamp();
