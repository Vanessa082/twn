-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Field Notes
-- Run this in Supabase SQL Editor after schema.sql.
-- Field Notes are multi-paragraph editorial observations managed by Vanessa.
-- They are distinct from notebook_entries (hero animation single-line thoughts).
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.field_notes (
    id           uuid default uuid_generate_v4() primary key,
    -- Display number shown in the card, e.g. "021"
    note_number  varchar(10) not null,
    -- Editorial tag, e.g. "Education", "Craft", "Infrastructure"
    tag          varchar(100) not null,
    headline     text not null,
    body         text not null,
    -- Controls visibility on the public homepage
    is_published boolean not null default false,
    -- Lower = appears first
    display_order integer not null default 0,
    published_at timestamp with time zone,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at   timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mirror the browser and server-action limits at the database boundary.
do $$ begin
  alter table public.field_notes add constraint field_notes_number_length
    check (char_length(trim(note_number)) between 1 and 10);
  alter table public.field_notes add constraint field_notes_tag_length
    check (char_length(trim(tag)) between 2 and 60);
  alter table public.field_notes add constraint field_notes_headline_length
    check (char_length(trim(headline)) between 4 and 160);
  alter table public.field_notes add constraint field_notes_body_length
    check (char_length(trim(body)) between 20 and 2400);
  alter table public.field_notes add constraint field_notes_display_order_range
    check (display_order between 0 and 999);
  alter table public.field_notes add constraint field_notes_publication_date
    check (not is_published or published_at is not null);
exception when duplicate_object then null;
end $$;

-- Indexes
create index if not exists idx_field_notes_published on public.field_notes(is_published, display_order);
create unique index if not exists idx_field_notes_note_number on public.field_notes(note_number);

alter table public.field_notes enable row level security;

-- Public: read published field notes only
do $$ begin
  create policy "Allow public read of published field_notes"
  on public.field_notes for select
  using (is_published = true);
exception when duplicate_object then null;
end $$;

-- Admin writes via service role (bypasses RLS)

-- Auto-update updated_at
drop trigger if exists set_field_notes_updated_at on public.field_notes;
create trigger set_field_notes_updated_at
before update on public.field_notes
for each row execute procedure public.handle_update_timestamp();
