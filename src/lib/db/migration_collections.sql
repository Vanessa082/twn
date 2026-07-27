-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Editorial Collections (Milestone 4 — Final Phase)
-- Copy and paste this into the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Collections Table ──────────────────────────────────────────────────────

create table if not exists public.collections (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    slug varchar(255) not null unique,
    description text,
    cover_image text,
    is_published boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_collections_slug on public.collections(slug);
create index if not exists idx_collections_published on public.collections(is_published);

alter table public.collections enable row level security;

-- Public read for published collections
do $$ begin
  create policy "Allow public read access to published collections"
  on public.collections for select
  using (is_published = true);
exception when duplicate_object then null;
end $$;

-- ── 2. Collection Articles Join Table ─────────────────────────────────────────

create table if not exists public.collection_articles (
    collection_id uuid not null references public.collections(id) on delete cascade,
    article_id uuid not null references public.articles(id) on delete cascade,
    position integer not null default 0,
    primary key (collection_id, article_id)
);

create index if not exists idx_collection_articles_cid_pos on public.collection_articles(collection_id, position);

alter table public.collection_articles enable row level security;

-- Public read for collection items
do $$ begin
  create policy "Allow public read access to collection_articles"
  on public.collection_articles for select
  using (true);
exception when duplicate_object then null;
end $$;
