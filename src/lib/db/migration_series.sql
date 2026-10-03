-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL Migration: Series (ordered collections) and entry labels
-- Copy and paste this into the Supabase SQL Editor. Safe to run more than once.
-- Requires migration_collections.sql.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. A collection is either a curated collection or an ordered series ──────

alter table public.collections
  add column if not exists kind text not null default 'collection';

do $$ begin
  alter table public.collections
    add constraint collections_kind_check check (kind in ('collection', 'series'));
exception when duplicate_object then null;
end $$;

-- Target for the composite foreign key below.
do $$ begin
  alter table public.collections
    add constraint collections_id_kind_key unique (id, kind);
exception when duplicate_object or duplicate_table then null;
end $$;

-- ── 2. Entries carry an optional label ("Part 1", "Day 42", "Prologue") ──────

alter table public.collection_articles
  add column if not exists label varchar(60);

do $$ begin
  alter table public.collection_articles
    add constraint collection_articles_label_check
    check (label is null or (label = btrim(label) and char_length(label) between 1 and 60));
exception when duplicate_object then null;
end $$;

-- ── 3. A note belongs to at most one series ──────────────────────────────────
-- Each entry mirrors its collection's kind. The composite foreign key keeps the
-- copy in sync (on update cascade), so the partial unique index can enforce
-- the rule without a trigger.

alter table public.collection_articles
  add column if not exists collection_kind text not null default 'collection';

update public.collection_articles ca
set collection_kind = c.kind
from public.collections c
where c.id = ca.collection_id and ca.collection_kind <> c.kind;

do $$ begin
  alter table public.collection_articles
    add constraint collection_articles_collection_kind_fkey
    foreign key (collection_id, collection_kind)
    references public.collections (id, kind)
    on update cascade on delete cascade;
exception when duplicate_object then null;
end $$;

create unique index if not exists collection_articles_one_series_per_note
  on public.collection_articles (article_id)
  where collection_kind = 'series';

-- ── 4. Positions are 1..n and unique within a collection ─────────────────────

with ordered as (
  select collection_id, article_id,
         row_number() over (partition by collection_id order by position, article_id) as rn
  from public.collection_articles
)
update public.collection_articles ca
set position = o.rn
from ordered o
where ca.collection_id = o.collection_id
  and ca.article_id = o.article_id
  and ca.position <> o.rn;

do $$ begin
  alter table public.collection_articles
    add constraint collection_articles_position_check check (position > 0);
exception when duplicate_object then null;
end $$;

create unique index if not exists collection_articles_collection_position_key
  on public.collection_articles (collection_id, position);

-- ── 5. Readers only see entries of published collections ─────────────────────

drop policy if exists "Allow public read access to collection_articles" on public.collection_articles;

do $$ begin
  create policy "Allow public read access to entries of published collections"
  on public.collection_articles for select
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_articles.collection_id and c.is_published = true
    )
  );
exception when duplicate_object then null;
end $$;

-- ── 6. Save a collection's kind and entries in one transaction ───────────────
-- p_entries: [{ "note_id": "<uuid>", "label": "Part 1" | null }, ...] in order.
-- If any entry is rejected (e.g. the note is already in another series),
-- nothing changes.

create or replace function public.save_collection_entries(
  p_collection_id uuid,
  p_kind text,
  p_entries jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_kind not in ('collection', 'series') then
    raise exception 'Invalid collection kind: %', p_kind using errcode = '22023';
  end if;

  if jsonb_typeof(p_entries) <> 'array' then
    raise exception 'Entries must be a JSON array' using errcode = '22023';
  end if;

  perform 1 from public.collections where id = p_collection_id for update;
  if not found then
    raise exception 'Collection not found' using errcode = 'P0002';
  end if;

  delete from public.collection_articles where collection_id = p_collection_id;

  update public.collections
  set kind = p_kind, updated_at = timezone('utc'::text, now())
  where id = p_collection_id;

  insert into public.collection_articles (collection_id, article_id, position, label, collection_kind)
  select p_collection_id,
         (entry ->> 'note_id')::uuid,
         ordinality::integer,
         nullif(btrim(entry ->> 'label'), ''),
         p_kind
  from jsonb_array_elements(p_entries) with ordinality as entries(entry, ordinality);
end;
$$;

revoke all on function public.save_collection_entries(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.save_collection_entries(uuid, text, jsonb) to service_role;
