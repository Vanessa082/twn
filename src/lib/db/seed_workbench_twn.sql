-- ═══════════════════════════════════════════════════════════════════════════════
-- Seed: TWN on the Workbench
-- Run this in Supabase SQL Editor after migration_projects.sql.
-- Safe to run more than once: it skips the insert when a project named
-- "The Notebook of a Tech Woman" already exists. Edit the copy afterwards in
-- /admin/content/workbench.
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.projects
  (name, category, status, overview, why_started, what_im_learning, stack, url, is_published, display_order)
select
  'The Notebook of a Tech Woman',
  'TWN',
  'Building',
  'An editorial notebook on technology, leadership, learning and the journey of becoming, with a notebook of long-form notes, field notes, a workbench of projects and a community wall where readers leave a page.',
  'I wanted one honest place to document my life around technology: the things I am learning, the things I am building, the ideas that fail, the ideas that survive, and the questions I am still trying to answer.',
  'Building it in public over 180 days: Next.js App Router and Server Components, a modular monolith, Supabase Row Level Security, server action authorization, moderation workflows, Playwright and Vitest testing, and structured logging.',
  array['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'TanStack', 'Tiptap', 'Clerk', 'Cloudinary', 'Resend', 'Zod', 'Playwright'],
  null,
  true,
  0
where not exists (
  select 1 from public.projects where name = 'The Notebook of a Tech Woman'
);
