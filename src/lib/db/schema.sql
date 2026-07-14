-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL DDL Schema for The Notebook of a Tech Woman (TWN)
-- Copy and paste this ENTIRE file into the Supabase SQL Editor to initialize
-- your database. Safe to re-run — uses IF NOT EXISTS and ON CONFLICT.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- ── 0. Custom ENUM Types ─────────────────────────────────────────────────────

-- Moderation status used by shared_pages and margin_notes
do $$ begin
  create type moderation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;


-- ── 1. Categories Table ──────────────────────────────────────────────────────

create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    slug varchar(255) not null unique
);

alter table public.categories enable row level security;

-- Anyone can read categories
do $$ begin
  create policy "Allow public read access to categories"
  on public.categories for select
  using (true);
exception when duplicate_object then null;
end $$;

-- Seed categories
insert into public.categories (name, slug) values
('Technology', 'technology'),
('Leadership', 'leadership'),
('Learning', 'learning'),
('Community', 'community'),
('Personal Reflections', 'reflections')
on conflict (slug) do nothing;


-- ── 2. Articles Table ────────────────────────────────────────────────────────

create table if not exists public.articles (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    slug varchar(255) not null unique,
    excerpt text not null,
    content text not null,
    cover_image text,
    category varchar(50) not null default 'technology'
        check (category in ('technology', 'leadership', 'learning', 'community', 'reflections')),

    status varchar(20) not null default 'draft'
        check (status in ('draft', 'published', 'scheduled')),
    published_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add category column if table already exists but column is missing
do $$ begin
  alter table public.articles add column if not exists category varchar(50) not null default 'technology'
    check (category in ('technology', 'leadership', 'learning', 'community', 'reflections'));
exception when others then null;
end $$;

-- Indexes
create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_category on public.articles(category);

alter table public.articles enable row level security;

-- Public: read published articles
do $$ begin
  create policy "Allow public read access to published articles"
  on public.articles for select
  using (status = 'published' and (published_at is null or published_at <= now()));
exception when duplicate_object then null;
end $$;

-- Admin: full access via service role (RLS bypassed by service role key automatically)

-- Trigger: auto-update updated_at
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Drop and recreate to avoid errors on re-run
drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute procedure public.handle_update_timestamp();


-- ── 3. Subscribers Table ─────────────────────────────────────────────────────

create table if not exists public.subscribers (
    id uuid default uuid_generate_v4() primary key,
    email varchar(255) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscribers enable row level security;

-- Public: anyone can insert (subscribe)
do $$ begin
  create policy "Allow public insert to subscribers"
  on public.subscribers for insert
  with check (true);
exception when duplicate_object then null;
end $$;

-- Admin reads via service role (bypasses RLS)


-- ── 4. Notebooks Table ──────────────────────────────────────────────────────
-- A named collection of entries. Initially one default notebook exists.

create table if not exists public.notebooks (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    slug varchar(255) not null unique,
    description text,
    is_default boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notebooks enable row level security;

-- Public: anyone can read notebooks
do $$ begin
  create policy "Allow public read access to notebooks"
  on public.notebooks for select
  using (true);
exception when duplicate_object then null;
end $$;

-- Seed the default notebook
insert into public.notebooks (name, slug, description, is_default) values
('The Notebook', 'the-notebook', 'The default notebook for TWN — thoughts, reflections, and lessons.', true)
on conflict (slug) do nothing;

-- Trigger: auto-update updated_at
drop trigger if exists set_notebooks_updated_at on public.notebooks;
create trigger set_notebooks_updated_at
before update on public.notebooks
for each row execute procedure public.handle_update_timestamp();


-- ── 5. Notebook Entries Table ────────────────────────────────────────────────
-- Admin-authored sentences/paragraphs that power the hero animation and Today's Page.

create table if not exists public.notebook_entries (
    id uuid default uuid_generate_v4() primary key,
    notebook_id uuid not null references public.notebooks(id) on delete cascade,
    title varchar(255),
    thought text not null,
    slug varchar(255),
    source_article_id uuid references public.articles(id) on delete set null,
    is_active boolean not null default true,
    priority integer not null default 0,
    display_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_notebook_entries_active on public.notebook_entries(is_active);
create index if not exists idx_notebook_entries_display_date on public.notebook_entries(display_date);
create index if not exists idx_notebook_entries_notebook_id on public.notebook_entries(notebook_id);

alter table public.notebook_entries enable row level security;

-- Public: read active entries
do $$ begin
  create policy "Allow public read access to active notebook entries"
  on public.notebook_entries for select
  using (is_active = true);
exception when duplicate_object then null;
end $$;

-- Trigger: auto-update updated_at
drop trigger if exists set_notebook_entries_updated_at on public.notebook_entries;
create trigger set_notebook_entries_updated_at
before update on public.notebook_entries
for each row execute procedure public.handle_update_timestamp();


-- ── 6. Shared Pages Table ────────────────────────────────────────────────────
-- Visitor-submitted reflections (10–300 words). Require moderation.

create table if not exists public.shared_pages (
    id uuid default uuid_generate_v4() primary key,
    author_name varchar(255) not null default 'Anonymous',
    title varchar(255),
    content text not null,
    word_count integer not null default 0,
    status varchar(20) not null default 'pending'
        check (status in ('pending', 'approved', 'rejected')),
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    published_at timestamp with time zone,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_shared_pages_status on public.shared_pages(status);

alter table public.shared_pages enable row level security;

-- Public: read approved shared pages
do $$ begin
  create policy "Allow public read access to approved shared pages"
  on public.shared_pages for select
  using (status = 'approved');
exception when duplicate_object then null;
end $$;

-- Public: anyone can submit (insert) a shared page
do $$ begin
  create policy "Allow public insert to shared pages"
  on public.shared_pages for insert
  with check (true);
exception when duplicate_object then null;
end $$;

-- Trigger: auto-update updated_at
drop trigger if exists set_shared_pages_updated_at on public.shared_pages;
create trigger set_shared_pages_updated_at
before update on public.shared_pages
for each row execute procedure public.handle_update_timestamp();


-- ── 7. Margin Notes Table ────────────────────────────────────────────────────
-- Short reader reflections (max 120 chars) in article margins/footers.

create table if not exists public.margin_notes (
    id uuid default uuid_generate_v4() primary key,
    article_id uuid not null references public.articles(id) on delete cascade,
    author_name varchar(255) not null default 'Anonymous',
    content varchar(120) not null,
    status varchar(20) not null default 'pending'
        check (status in ('pending', 'approved', 'rejected')),
    display_order integer not null default 999,
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    published_at timestamp with time zone,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_margin_notes_article_status on public.margin_notes(article_id, status);
create index if not exists idx_margin_notes_display_order on public.margin_notes(display_order);

alter table public.margin_notes enable row level security;

-- Public: read approved margin notes
do $$ begin
  create policy "Allow public read access to approved margin notes"
  on public.margin_notes for select
  using (status = 'approved');
exception when duplicate_object then null;
end $$;

-- Public: anyone can submit (insert) a margin note
do $$ begin
  create policy "Allow public insert to margin notes"
  on public.margin_notes for insert
  with check (true);
exception when duplicate_object then null;
end $$;

-- Trigger: auto-update updated_at
drop trigger if exists set_margin_notes_updated_at on public.margin_notes;
create trigger set_margin_notes_updated_at
before update on public.margin_notes
for each row execute procedure public.handle_update_timestamp();


-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE. All 7 tables created with RLS policies, indexes, and triggers.
--
-- Tables:
--   1. categories        — editorial categories (seeded)
--   2. articles           — blog posts with category, status, cover image
--   3. subscribers        — newsletter email signups
--   4. notebooks          — named collections of entries (seeded with default)
--   5. notebook_entries   — hero animation thoughts, Today's Page entries
--   6. shared_pages       — visitor-submitted community reflections
--   7. margin_notes       — short reader comments on articles
--
-- Next steps:
--   1. Paste this SQL into Supabase SQL Editor and click "Run"
--   2. Update .env.local with the real SUPABASE_SERVICE_ROLE_KEY
--      (found in Supabase Dashboard → Settings → API → service_role secret)
-- ═══════════════════════════════════════════════════════════════════════════════
