-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Article Revision History (Milestone 5 — CMS Reliability)
-- Copy and paste this into the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Article Revisions Table ────────────────────────────────────────────────
-- Stores a full snapshot of the article at each save point.
-- This is a simple append-only log; we never update rows here.

create table if not exists public.article_revisions (
    id uuid default uuid_generate_v4() primary key,
    article_id uuid not null references public.articles(id) on delete cascade,

    -- Snapshot fields (copied from the article at save time)
    title text not null,
    excerpt text not null,
    content text not null,
    cover_image text,
    category varchar(50) not null,
    status varchar(20) not null,

    -- Who saved it and when
    saved_by_clerk_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fetching recent revisions for a given article quickly
create index if not exists idx_article_revisions_article_id
    on public.article_revisions(article_id, created_at desc);

-- Revisions are admin-only: no public access
alter table public.article_revisions enable row level security;
-- (Service role key bypasses RLS, so no insert/select policies needed for admin ops)
