-- SQL DDL Schema for The Notebook of a Tech Woman (TWN)
-- Copy and paste this into the Supabase SQL Editor to initialize your database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. Categories Table ──────────────────────────────────────────────────────
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    slug varchar(255) not null unique
);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;

-- Read policies: anyone can read
create policy "Allow public read access to categories" 
on public.categories for select 
using (true);

-- Insert seed categories
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
    category varchar(50) not null,
    status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
    published_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_articles_slug on public.articles(slug);

-- Enable RLS
alter table public.articles enable row level security;

-- Read policies: anyone can read published articles
create policy "Allow public read access to published articles" 
on public.articles for select 
using (status = 'published' and (published_at is null or published_at <= now()));

-- Trigger to automatically update updated_at timestamp
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger set_articles_updated_at
before update on public.articles
for each row execute procedure public.handle_update_timestamp();


-- ── 3. Subscribers Table ─────────────────────────────────────────────────────
create table if not exists public.subscribers (
    id uuid default uuid_generate_v4() primary key,
    email varchar(255) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscribers enable row level security;

-- Read policies: restrict SELECT to service role / admin only (no public read)
-- Insert policies: allow anyone to subscribe (public insert)
create policy "Allow public insert to subscribers" 
on public.subscribers for insert 
with check (true);
