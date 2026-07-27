# TWN Master 180-Day Build-in-Public Content & Learning Roadmap

**Author**: Vanessa (The Notebook of a Tech Woman)  
**Total Duration**: 6 Months (180 Days / 26 Weeks)  
**Target Platforms**: LinkedIn (Long-Form Technical Leadership) & TikTok (Short-Form Code & Build-in-Public Videos)  
**Technical Basis**: TWN Production Architecture (Next.js 15, TypeScript, PostgreSQL/Supabase, Modular Monolith, Playwright, Clean Architecture)  

---

## Daily Schedule Structure (7 Days/Week)

| Day of Week | Content Focus | Target Audience Outcome |
|---|---|---|
| **Monday** | **System Architecture & Design** | Understand high-level choices (Modular Monolith, RSCs, Hexagonal Architecture) |
| **Tuesday** | **Code Deep Dive & Implementation** | See clean TypeScript patterns, contracts, and folder structure in TWN |
| **Wednesday** | **Security & Reliability** | Learn server action authorization, honeypots, rate limiting, and audit trails |
| **Thursday** | **Bugs, Refactoring & Lessons** | Real stories of type errors, refactoring messy code, and fixing mistakes |
| **Friday** | **Testing & Observability** | Playwright E2E browser tests, Vitest unit tests, structured JSON logging |
| **Saturday** | **Tech Woman Journey & Mindset** | Personal essay & video on learning software engineering, discipline, career |
| **Sunday** | **Weekly Recap & Code Quiz/Tip** | Quick digest of the week's key lesson + actionable tip for tech learners |

## Technical Resources & System Design References

Every day's content is backed by official engineering documentation, system design principles, and direct cross-references to `Blueprint.md`:

### 📚 Official Technical Documentation Links
- **Next.js 15 App Router & RSC**: [Next.js Documentation](https://nextjs.org/docs)
- **Modular Monolith & DDD**: [Martin Fowler on Modular Monoliths](https://martinfowler.com/bliki/MonolithFirst.html) & [Domain-Driven Design Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
- **PostgreSQL & Supabase RLS**: [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- **Node.js AsyncLocalStorage**: [Node.js Async Hooks Documentation](https://nodejs.org/api/async_hooks.html#class-asynclocalstorage)
- **Playwright Browser E2E**: [Playwright Testing Framework Docs](https://playwright.dev/docs/intro)
- **OWASP Application Security**: [OWASP Top 10 Web Application Security Risks](https://owasp.org/Top10/)

### 📐 TWN System Architecture & Blueprint References
- **`Blueprint.md` Volume 1 — Vision**: Product philosophy & long-term editorial journal goals (`Blueprint.md:L15`)
- **`Blueprint.md` Volume 6 — Product Domains**: Editorial, Community & Notebook domain specs (`Blueprint.md:L4926`)
- **`Blueprint.md` Volume 7 — Engineering Handbook & Architecture**: Modular monolith boundaries, SOLID principles, Clean Architecture (`Blueprint.md:L7523`, `Blueprint.md:L24075`)
- **TWN System Architecture Diagrams**: `docs/architecture/adr/ADR-001-modular-monolith.md`
- **TWN Editorial Governance Standard**: `docs/governance/editorial_governance.md`

---

## 6-Month Master Overview

```
MONTH 1 (Days 1–30)   : Architectural Foundations & Modular Monolith Transition
MONTH 2 (Days 31–60)  : Server Security, Authorization Policies & Transport Layers
MONTH 3 (Days 61–90)  : Database Ownership, Aggregate Roots & Schema Integrity
MONTH 4 (Days 91–120) : Submission Protection, Bot Traps & Moderation Workflows
MONTH 5 (Days 121–150): Operational Observability, Logging, Tracing & Error Classification
MONTH 6 (Days 151–180): Automated E2E Testing, Release Governance & Phase 2 Freeze
```

---

## Detailed 180-Day Index

### Month 1: Architectural Foundations (Days 1–30)
- **Day 1**: Why I'm building *The Notebook of a Tech Woman* publicly
- **Day 2**: Why I chose a Modular Monolith instead of Microservices as a solo dev
- **Day 3**: What is Clean Architecture in Next.js 15? (`src/modules/`)
- **Day 4**: Understanding Bounded Contexts: Why Editorial doesn't talk directly to Community
- **Day 5**: React Server Components (RSC) vs Client Components: Setting strict rules
- **Day 6**: How I organize folders in Next.js: `domain/`, `application/`, `infrastructure/`, `presentation/`
- **Day 7**: Week 1 Recap: 3 architectural rules that saved my project
- **Day 8**: What are Published Contracts? (`contracts/index.ts`)
- **Day 9**: Preventing Spaghetti Code: How I write architecture tests in Vitest
- **Day 10**: What is an Architectural Decision Record (ADR)? (Introducing ADR-001)
- **Day 11**: Decoupling Third-Party Services: Why domain code should never import Clerk or Resend
- **Day 12**: Refactoring Day: How I moved 1,000 lines of messy code into modules
- **Day 13**: Type-Safe Modules: Using TypeScript `export type` boundaries
- **Day 14**: Week 2 Recap: Top 5 mistakes developers make with Next.js folder structure
- **Day 15**: System Architecture: Diagramming TWN's 7 Core Modules
- **Day 16**: The Article Aggregate Root: Designing content lifecycle in TypeScript
- **Day 17**: Decoupling Image Uploads: The `MediaUploadPort` interface
- **Day 18**: The hardest refactor I did this month: Moving from `lib/services` to `modules/`
- **Day 19**: Testing module isolation: Ensuring no forbidden cross-module imports
- **Day 20**: A Tech Woman's perspective on learning software engineering from first principles
- **Day 21**: Week 3 Recap: Monolith vs Microservices quiz and summary
- **Day 22**: ADR-002 Breakdown: Why I chose Clerk for single-admin authentication
- **Day 23**: ADR-003 Breakdown: Defaulting to React Server Components for zero client JS
- **Day 24**: ADR-004 Breakdown: Why Cloudinary + URL transformations beat raw file uploads
- **Day 25**: ADR-005 Breakdown: Why TWN has NO reader authentication in Phase 2
- **Day 26**: How ADRs prevent argument fatigue in software teams
- **Day 27**: Building in Public: My 1-Month engineering progress report
- **Day 28**: Month 1 Recap: The complete architecture blueprint of TWN

---

### Month 2: Server Security & Transport Layers (Days 31–60)
- **Day 31**: Next.js Server Actions are NOT APIs: The security risk developers miss
- **Day 32**: Building Thin Transport Adapters: Server Action → Application Command
- **Day 33**: Authorization Policies in TypeScript: The `canManageArticles()` policy
- **Day 34**: Fixing a security vulnerability: How I stopped unauthorized admin actions
- **Day 35**: Testing Authorization with Vitest: `admin-access.test.ts`
- **Day 36**: How to stay disciplined while learning advanced backend security
- **Day 37**: Week 5 Recap: 3 security rules every Next.js developer must follow
- **Day 38**: Abstracting Clerk Behind Ports: The `UserIdentity` & `AuthorizationPort` interfaces
- **Day 39**: Deep dive into `src/modules/identity/`: Resolving authenticated actors
- **Day 40**: Why environment variables like `ADMIN_USER_IDS` need strict validation
- **Day 41**: The nightmare of missing auth checks and how policy functions fix it
- **Day 42**: Unit testing admin action error handling with `toAdminActionError()`
- **Day 43**: imposter syndrome vs engineering evidence: How data beats doubt
- **Day 44**: Week 6 Recap: How to decouple third-party auth from your core app
- **Day 45**: High-level Security Architecture: Threat modeling a digital magazine
- **Day 46**: Input Validation with Zod: Keeping validation strictly in the presentation layer
- **Day 47**: Preventing Server Action body size attacks: Configuring Next.js limits
- **Day 48**: A bug I fixed in Server Action error handling
- **Day 49**: Verifying authorization checks across all 12 Server Actions
- **Day 50**: What it really feels like to refactor security as a woman in tech
- **Day 51**: Week 7 Recap: Zod validation + Authorization policy checklist
- **Day 52**: The Platform Layer: Why Audit Logging belongs in `src/platform/audit/`
- **Day 53**: Implementing `recordAuditLog()` in TypeScript
- **Day 54**: Ensuring audit log immutability at the database level
- **Day 55**: Refactoring 6 Server Action files to use the platform audit service
- **Day 56**: Verifying audit logs in the admin UI (`/admin/audit`)
- **Day 57**: Why documentation is your secret weapon as a software engineer
- **Day 58**: Month 2 Recap: Security, transport layers, and audit logging summary

---

### Month 3: Database Ownership & Schema Integrity (Days 61–90)
- **Day 61**: Who owns the table? Documenting database ownership in PostgreSQL
- **Day 62**: Schema walkthrough: `articles`, `categories`, `tags`, and join tables
- **Day 63**: Row Level Security (RLS) vs Service Role: Protecting Supabase tables
- **Day 64**: Fixing a database migration bug in foreign key constraints
- **Day 65**: Testing DB queries without polluting your live database
- **Day 66**: How to think like a database architect when designing content tables
- **Day 67**: Week 9 Recap: Database ownership rules in modular monoliths
- **Day 68**: What is an Aggregate Root in relational databases?
- **Day 69**: Article Revisions: Building an append-only snapshot log in PostgreSQL
- **Day 70**: One-click restore: How `restoreRevision()` works under the hood
- **Day 71**: The danger of cascading deletes and how `ON DELETE CASCADE` works
- **Day 72**: Testing content revision restoration with unit tests
- **Day 73**: The mindset shift: From writing SQL scripts to designing data models
- **Day 74**: Week 10 Recap: Revision history design pattern
- **Day 75**: Multi-table relationships: Collections and ordered `collection_articles`
- **Day 76**: Notebook Entries: Designing Today's Page and Hero thought scheduling
- **Day 77**: Database indexes: Why `slug` and `status` columns need B-Tree indexes
- **Day 78**: How I fixed a database performance bottleneck in tag filtering
- **Day 79**: Database migration verification: Re-running clean DDL scripts safely
- **Day 80**: Why precision matters in software engineering
- **Day 81**: Week 11 Recap: PostgreSQL indexing and migration best practices
- **Day 82**: Documenting schema intent: Adding SQL comments for module owners
- **Day 83**: RLS Policy Deep Dive: Public SELECT vs Admin ALL policies
- **Day 84**: Newsletter Subscribers Table: Enforcing email uniqueness at the DB layer
- **Day 85**: Debugging an SQL enum constraint failure
- **Day 86**: Verifying database constraints with TypeScript types
- **Day 87**: Building public authority through technical rigor
- **Day 88**: Month 3 Recap: Database ownership, schema design, and RLS policies

---

### Month 4: Submission Protection & Moderation (Days 91–120)
- **Day 91**: Designing an anonymous contribution system without annoying CAPTCHAs
- **Day 92**: The Honeypot Trap: Using hidden form fields to stop spam bots
- **Day 93**: Sliding Window Rate Limiting in TypeScript
- **Day 94**: How I tested my bot detector by writing a script to attack my own form
- **Day 95**: Unit testing submission protection (`submission-protection.test.ts`)
- **Day 96**: Why user experience must be preserved even when securing forms
- **Day 97**: Week 13 Recap: 3 ways to stop bots without CAPTCHA
- **Day 98**: Editorial Moderation State Machine: `pending` → `approved` | `rejected`
- **Day 99**: Shared Pages: Visitor-submitted reflections (10–300 words)
- **Day 100**: Margin Notes: Reader article annotations (max 120 chars)
- **Day 101**: A bug in moderation status transitions and how unit tests caught it
- **Day 102**: Building the Admin Moderation Queue UI (`/admin/community`)
- **Day 103**: Why moderation queues are critical for brand safety
- **Day 104**: Week 14 Recap: State machine pattern for content approval
- **Day 105**: Reject vs Delete: The subtle difference in editorial governance
- **Day 106**: Editorial Governance Document Breakdown (`editorial_governance.md`)
- **Day 107**: AI Disclosure Policy: Rules for AI-assisted technical writing
- **Day 108**: Handling factual corrections in published community content
- **Day 109**: Auditing moderation decisions: Moderator ID + Timestamp
- **Day 110**: Tech Woman Build-in-Public: Why ethical governance matters
- **Day 111**: Week 15 Recap: Editorial policy checklist for digital publications
- **Day 112**: Content Deduplication: Stopping repeated submission spam
- **Day 113**: Margin Note Pinning: How `display_order` pins top reflections
- **Day 114**: Public Visibility Isolation: Why pending content must never render on public routes
- **Day 115**: Debugging a cache invalidation bug in `revalidatePath()` after moderation
- **Day 116**: Testing moderation UI components with React Testing concepts
- **Day 117**: Reflections on building community tools as a woman in tech
- **Day 118**: Month 4 Recap: Submission protection, moderation queues, and governance

---

### Month 5: Operational Observability & Tracing (Days 121–150)
- **Day 121**: Why `console.log` is not enough for production applications
- **Day 122**: Structured JSON Logging: Building `logger.ts`
- **Day 123**: Request Correlation IDs: Tracing requests across Next.js using `AsyncLocalStorage`
- **Day 124**: A logging bug that leaked unredacted data and how I fixed it
- **Day 125**: Testing correlation ID propagation across server actions
- **Day 126**: Why observability gives you confidence to ship to production
- **Day 127**: Week 17 Recap: Correlation IDs and structured logging
- **Day 128**: Automatic PII & Secret Redaction: Building `redact.ts`
- **Day 129**: Redacting sensitive keys: `password`, `token`, `secret`, `email`, `draft`
- **Day 130**: Operation Context propagation: `getActorId()` and `getModuleContext()`
- **Day 131**: Fixing recursive object redaction in TypeScript
- **Day 132**: Verifying log outputs in production builds
- **Day 133**: How technical discipline sets you apart as a developer
- **Day 134**: Week 18 Recap: PII redaction rules for compliance
- **Day 135**: Error Classification: `BUSINESS`, `INFRASTRUCTURE`, `SYSTEM`, `UNKNOWN`
- **Day 136**: Custom Error Classes: `BusinessRuleError` vs `InfrastructureError`
- **Day 137**: Safe Error Messages: Preventing internal stack traces from reaching public users
- **Day 138**: How I caught an unhandled promise rejection using custom error classes
- **Day 139**: Unit testing error classifiers (`errors.ts`)
- **Day 140**: The psychological difference between guessing and observing system state
- **Day 141**: Week 19 Recap: Error taxonomy and exception handling
- **Day 142**: Health Checks: Building `/api/health` route handler
- **Day 143**: Multi-Content Search Aggregation: Server-side provider pattern
- **Day 144**: Search module isolation: Consuming `SearchableContentProvider` contracts
- **Day 145**: Fixing a search query normalization bug in unit tests
- **Day 146**: Testing multi-content search with Vitest mocks
- **Day 147**: 5 Months in: Reflections on building a complete software engine
- **Day 148**: Month 5 Recap: Observability, tracing, and multi-content search

---

### Month 6: Automated Testing & Release Governance (Days 151–180)
- **Day 151**: Why I automated browser testing with Playwright before launching TWN
- **Day 152**: Playwright Configuration: `playwright.config.ts` for Next.js
- **Day 153**: Writing my first E2E test: `workflow.spec.ts`
- **Day 154**: Multi-Context Testing: Isolated browser contexts for Admin vs Visitor
- **Day 155**: Debugging an E2E test locator timeout in headless Chromium
- **Day 156**: Why automated browser tests give you superpowers as a solo builder
- **Day 157**: Week 21 Recap: Playwright E2E testing guide for Next.js
- **Day 158**: Testing public route rendering: `/articles`, `/topics`, `/notebook`, `/community`
- **Day 159**: Testing search form submission in Playwright
- **Day 160**: Moderation Boundary E2E: Verifying unapproved content is invisible to visitors
- **Day 161**: Fixing an intermittent test flake in Playwright network idle states
- **Day 162**: Running headless Playwright tests in CI pipelines
- **Day 163**: How learning E2E testing changed the way I write frontend code
- **Day 164**: Week 22 Recap: Multi-context browser testing best practices
- **Day 165**: The 4 Release Verification Gates: `type-check`, `vitest`, `playwright`, `build`
- **Day 166**: Zero Type Errors: How `tsc --noEmit` protects production code
- **Day 167**: Vitest Unit Suite: Running 42 unit tests in 700ms
- **Day 168**: Next.js Production Build Verification: Debugging static generation warnings
- **Day 169**: Roadmap Registry: Mapping confirmed vs unconfirmed blueprint volumes
- **Day 170**: Phase 2 Architecture Freeze: Tagging the release and locking domain boundaries
- **Day 171**: Week 23 Recap: Release readiness checklist for software projects
- **Day 172**: Known Technical Debt: Documenting limitations honestly
- **Day 173**: The Rollback Guide: What to do if production breaks
- **Day 174**: The full stack of TWN: Next.js 15, TypeScript, Supabase, Clerk, Cloudinary, Playwright
- **Day 175**: How building TWN changed my technical confidence as a Tech Woman
- **Day 176**: What I learned from writing 180 days of technical documentation
- **Day 177**: The vision for Phase 3: What's coming next for TWN
- **Day 178**: Message to aspiring women in tech: You can build serious software
- **Day 179**: Master Build-in-Public Summary: From line 1 to production freeze
- **Day 180**: TWN Phase 2 Release Day: Celebrating 6 months of engineering excellence!
