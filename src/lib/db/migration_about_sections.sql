-- ── Migration: About Page Sections Table ──────────────────────────────────────
-- Allows dynamic customization and publishing of About Page sections from TWN Admin.

create table if not exists public.about_settings (
    id varchar(50) primary key default 'default',
    data jsonb not null
      check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 1048576),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_settings enable row level security;

-- Public can read about_settings
do $$ begin
  create policy "Allow public read access to about_settings"
  on public.about_settings for select
  using (true);
exception when duplicate_object then null;
end $$;

-- Service role has full access (bypasses RLS)
