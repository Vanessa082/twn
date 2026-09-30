-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Homepage & Site Settings
-- Run this in Supabase SQL Editor after schema.sql.
-- Gives Vanessa editorial control over the hero, the Featured Note, the volume
-- (season) header, and the footer's contact details and social links.
-- Safe to re-run: every statement is idempotent.
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.homepage_settings (
    id              uuid default uuid_generate_v4() primary key,
    -- The article Vanessa has chosen as the featured lead piece.
    -- NULL = fall back to the most recently published article.
    featured_article_id uuid references public.articles(id) on delete set null,
    -- Volume / issue header above the featured note. Volumes are seasons of
    -- the notebook, not permanent branding.
    volume_label    varchar(255) not null default 'Vol. 01',
    volume_subtitle varchar(255) not null default '',
    volume_season   varchar(100) not null default 'September 2026',
    updated_at      timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hero identity
alter table public.homepage_settings
  add column if not exists hero_eyebrow varchar(120) not null default 'The Notebook of a Tech Woman',
  add column if not exists hero_title   varchar(160) not null default 'Notes from becoming.',
  add column if not exists hero_topics  text[] not null
    default '{"Technology","Work","Learning","Building","Life"}';

-- Site-wide contact details and social links (rendered in the footer).
-- social_links: [{ "label": "LinkedIn", "url": "https://..." }]
alter table public.homepage_settings
  add column if not exists contact_email varchar(255),
  add column if not exists location      varchar(120),
  add column if not exists social_links  jsonb not null default '[]'::jsonb;

-- Mirror the admin form and server-action validation at the database boundary.
do $$ begin
  alter table public.homepage_settings add constraint homepage_volume_label_length
    check (char_length(trim(volume_label)) between 1 and 60);
  alter table public.homepage_settings add constraint homepage_volume_subtitle_length
    check (char_length(volume_subtitle) <= 120);
  alter table public.homepage_settings add constraint homepage_volume_season_length
    check (char_length(volume_season) <= 60);
  alter table public.homepage_settings add constraint homepage_eyebrow_length
    check (char_length(hero_eyebrow) <= 120);
  alter table public.homepage_settings add constraint homepage_title_length
    check (char_length(trim(hero_title)) between 2 and 160);
  alter table public.homepage_settings add constraint homepage_topic_limit
    check (cardinality(hero_topics) <= 8);
  alter table public.homepage_settings add constraint homepage_contact_email
    check (contact_email is null or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
  alter table public.homepage_settings add constraint homepage_social_links_array
    check (jsonb_typeof(social_links) = 'array' and jsonb_array_length(social_links) <= 6);
exception when duplicate_object then null;
end $$;

-- Only one row ever exists (the current configuration).
-- Seeded with the details the footer already showed, so nothing disappears.
insert into public.homepage_settings (
  volume_label,
  volume_subtitle,
  volume_season,
  hero_eyebrow,
  hero_title,
  hero_topics,
  contact_email,
  location,
  social_links
)
select
  'Vol. 01',
  '',
  'September 2026',
  'The Notebook of a Tech Woman',
  'Notes from becoming.',
  '{"Technology","Work","Learning","Building","Life"}',
  'wahvanessa22@gmail.com',
  'Yaoundé, Cameroon',
  '[]'::jsonb
where not exists (select 1 from public.homepage_settings);

alter table public.homepage_settings enable row level security;

-- The application treats homepage_settings as one editorial document.
create unique index if not exists idx_homepage_settings_singleton
  on public.homepage_settings ((true));

-- Public can read the current settings.
do $$ begin
  create policy "Allow public read of homepage_settings"
  on public.homepage_settings for select
  using (true);
exception when duplicate_object then null;
end $$;

-- Auto-update updated_at on any change.
drop trigger if exists set_homepage_settings_updated_at on public.homepage_settings;
create trigger set_homepage_settings_updated_at
before update on public.homepage_settings
for each row execute procedure public.handle_update_timestamp();
