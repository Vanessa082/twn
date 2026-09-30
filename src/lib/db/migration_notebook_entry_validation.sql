-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Notebook Entry Validation
-- Run after schema.sql. Mirrors the browser and Zod limits at the database layer
-- and ensures Today's Page can resolve at most one active entry for a date.
-- ═══════════════════════════════════════════════════════════════════════════════

do $$ begin
  alter table public.notebook_entries add constraint notebook_entry_thought_length
    check (char_length(trim(thought)) between 5 and 500);
  alter table public.notebook_entries add constraint notebook_entry_title_length
    check (title is null or char_length(trim(title)) between 1 and 120);
  alter table public.notebook_entries add constraint notebook_entry_slug_format
    check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  alter table public.notebook_entries add constraint notebook_entry_priority_range
    check (priority between 0 and 100);
exception when duplicate_object then null;
end $$;

create unique index if not exists idx_notebook_entries_one_active_per_date
  on public.notebook_entries(display_date)
  where display_date is not null and is_active = true;
