# TWN Month 3 Daily Content & Learning Guide (Days 61–90)

**Theme**: Database Ownership, Aggregate Roots & Schema Integrity  
**Goal**: Master PostgreSQL database modeling, Row Level Security (RLS), Aggregate Roots, schema migrations, and article revision snapshot logs in Supabase.

---

## Day 61: Documenting Database Ownership in PostgreSQL

### Technical Concept to Master
- **Concept**: Single Database Table Ownership in Modular Monoliths.
- **Plain Language**: In a modular architecture, every database table must have ONE clear module owner. Other modules cannot query or mutate that table directly—they must request data via the owner's contracts.
- **TWN Code Reference**: `src/lib/db/schema.sql`.

### LinkedIn Post Template
```text
In a Modular Monolith, who owns the database tables?

A common mistake in Next.js apps with Supabase or Prisma is letting any file query any table. `Community` code queries `articles`, `Newsletter` queries `shared_pages`, and suddenly your database schema is impossible to refactor.

In TWN's `schema.sql`, every table explicitly documents its owner module:

┌──────────────────────┬──────────────┬──────────────────┐
│ Table                │ Module Owner │ Aggregate Root   │
├──────────────────────┼──────────────┼──────────────────┤
│ articles             │ Editorial    │ Article          │
│ shared_pages         │ Community    │ Shared Page      │
│ notebook_entries     │ Notebook     │ Notebook         │
│ subscribers          │ Newsletter   │ Subscriber       │
│ audit_logs           │ Platform     │ Audit Log        │
└──────────────────────┴──────────────┴──────────────────┘

If `Search` needs Article data, it calls `ArticleSearchProvider` in Editorial—it NEVER queries the `articles` table directly.

Document database ownership early, and your schema will scale smoothly!

#DatabaseDesign #PostgreSQL #Supabase #SoftwareArchitecture #TypeScript
```

### TikTok Video Script (45 Seconds)
- **Visual**: VS Code showing `schema.sql` comments with the table ownership matrix.
- **Hook**: "The database mistake ruining your Next.js project!"
- **Script**:
  - *"Are your Next.js features querying each other's database tables directly?"*
  - *"Stop! In TWN, every PostgreSQL table has ONE owner module."*
  - *"Editorial owns articles, Community owns shared_pages."*
  - *"If feature A needs feature B's data, it calls a contract interface—not the database table!"*

---

## Day 63: Row Level Security (RLS) vs Service Role

### Technical Concept to Master
- **Concept**: PostgreSQL Row Level Security (RLS) & Supabase Service Role Execution.
- **Plain Language**: RLS policies enforce security inside PostgreSQL itself. Public users using anon keys can only SELECT published content. Server Actions using service role keys bypass RLS for admin mutations.
- **TWN Code Reference**: `src/lib/db/schema.sql`.

### LinkedIn Post Template
```text
Why rely only on application-level security when your database can enforce security natively?

In TWN (hosted on Supabase / PostgreSQL), we combine application authorization policies with Row Level Security (RLS).

How RLS protects TWN:
1. Public Reads: `articles` policy allows `SELECT` ONLY if `status = 'published'` and `published_at <= now()`. Unpublished drafts are literally invisible at the DB level!
2. Public Submissions: `shared_pages` policy allows public `INSERT`, but `SELECT` is restricted to `status = 'approved'`.
3. Admin Access: Server Actions use the Supabase Service Role client, which bypasses RLS after passing `canManageArticles()` policy checks.

Defense-in-depth: If a bug ever bypasses application code, the database itself blocks unauthorized access!

#PostgreSQL #Supabase #DatabaseSecurity #CyberSecurity #WebDev
```

### TikTok Video Script
- **Visual**: Supabase SQL Editor showing `CREATE POLICY "Allow public read access to published articles" ON public.articles FOR SELECT USING (status = 'published');`.
- **Hook**: "How to lock down your database with PostgreSQL RLS!"
- **Script**:
  - *"Here is how I make sure unpublished drafts NEVER leak to public users."*
  - *"PostgreSQL Row Level Security!"*
  - *"This SQL policy restricts public reads strictly to status = 'published'."*
  - *"Even if a developer makes a front-end mistake, the database refuses to return draft rows!"*

---

## Day 69: Building an Append-Only Article Revision Log

### Technical Concept to Master
- **Concept**: Append-Only Snapshot History & Optimistic Concurrency.
- **Plain Language**: Storing a full snapshot of content every time an article is edited so past versions can be reviewed and restored with one click.
- **TWN Code Reference**: `src/lib/db/migration_revisions.sql` & `src/modules/editorial/`.

### LinkedIn Post Template
```text
How do you build "Version History / Restore Past Version" for an editorial CMS?

In TWN, we implemented an Append-Only Revision Log (`article_revisions`).

How it works:
1. On every article edit (`updateArticle`), the system saves the update to `articles`.
2. Simultaneously, a snapshot of the full title, excerpt, content, and cover image is written to `article_revisions` with a `revision_number`.
3. Revisions are immutable—they are NEVER updated or deleted.
4. If an admin clicks "Restore Revision", the system fetches the snapshot and updates the active article record.

Result:
- Full edit history audit trail.
- Zero fear of losing content during editing.
- Instant single-click revision restore!

#PostgreSQL #SystemDesign #CMS #TypeScript #WebDevelopment
```

### TikTok Video Script
- **Visual**: Admin article editor showing the revision history panel with "Restore this version" button.
- **Hook**: "How I built version control for my Next.js CMS!"
- **Script**:
  - *"Want to know how Notion and Medium handle edit history?"*
  - *"In TWN, every save creates an immutable snapshot in `article_revisions`."*
  - *"If I make a mistake, I click 'Restore Version' and it instantly restores the past title, content, and cover image!"*

---

*(Days 70–90 continue with detailed guides on schema constraints, foreign key cascades, indexing performance, and migration scripts...)*
