-- Migration: Add likes_count and Advanced SEO columns to articles table
-- Paste this into your Supabase SQL Editor and click "Run"

alter table public.articles add column if not exists likes_count integer not null default 0;
alter table public.articles add column if not exists seo_title varchar(255);
alter table public.articles add column if not exists seo_description text;
alter table public.articles add column if not exists og_image text;
alter table public.articles add column if not exists canonical_url text;
