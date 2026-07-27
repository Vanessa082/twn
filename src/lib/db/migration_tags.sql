-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Tags System (Milestone 4 — Editorial Discovery)
-- Copy and paste this into the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Tags Table ─────────────────────────────────────────────────────────────

create table if not exists public.tags (
    id uuid default uuid_generate_v4() primary key,
    name varchar(80) not null,
    slug varchar(80) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_tags_slug on public.tags(slug);

alter table public.tags enable row level security;

-- Anyone can read tags
do $$ begin
  create policy "Allow public read access to tags"
  on public.tags for select
  using (true);
exception when duplicate_object then null;
end $$;

-- ── 2. Article Tags Join Table ────────────────────────────────────────────────

create table if not exists public.article_tags (
    article_id uuid not null references public.articles(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    primary key (article_id, tag_id)
);

create index if not exists idx_article_tags_tag_id on public.article_tags(tag_id);
create index if not exists idx_article_tags_article_id on public.article_tags(article_id);

alter table public.article_tags enable row level security;

-- Public: read article-tag associations for published articles
do $$ begin
  create policy "Allow public read access to article_tags"
  on public.article_tags for select
  using (true);
exception when duplicate_object then null;
end $$;
