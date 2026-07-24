# TWN Month 2 Daily Content & Learning Guide (Days 31–60)

**Theme**: Server Security, Authorization Policies & Transport Layers  
**Goal**: Master Next.js Server Action security, authorization policy predicates (`canManageArticles`), decoupling Clerk behind identity ports, and platform audit logging.

---

## Day 31: Next.js Server Actions Are NOT APIs: The Security Risk

### Technical Concept to Master
- **Concept**: Server Action Transport Security & Public Endpoints.
- **Plain Language**: Server Actions look like simple TypeScript functions, but Next.js exposes them as HTTP POST endpoints. Anyone can invoke them directly if they aren't protected by authorization checks inside the function body.
- **TWN Code Reference**: `src/app/actions/articles.ts`.

### LinkedIn Post Template
```text
⚠️ SECURITY WARNING for Next.js Developers:
Server Actions are NOT private functions. Next.js turns every Server Action into a publicly callable POST endpoint!

When building TWN, I realized that writing `"use server"` at the top of a file doesn't automatically protect it from unauthorized users.

If you don't call an explicit authorization policy inside your action, ANY authenticated (or unauthenticated) request can trigger your mutation logic.

In TWN, every action begins with:
`const { userId } = await canManageArticles();`

If that check fails, execution stops immediately before any database write happens.

Never treat Server Actions as safe by default—always authorize explicitly!

#NextJS #CyberSecurity #WebSecurity #TypeScript #AppRouter
```

### TikTok Video Script (45 Seconds)
- **Visual**: VS Code highlighting `"use server"` and showing a HTTP tool (Postman/curl) sending a POST request directly to a Server Action endpoint.
- **Hook**: "The biggest security myth about Next.js Server Actions!"
- **Script**:
  - *"Think Server Actions are private backend functions? Think again!"*
  - *"Next.js exposes every Server Action as an HTTP endpoint."*
  - *"If you don't add explicit authorization checks at the top of your action, attackers can call it directly!"*
  - *"Always call an authorization policy first!"*

---

## Day 32: Building Thin Transport Adapters

### Technical Concept to Master
- **Concept**: Thin Server Actions / Transport Adapters.
- **Plain Language**: Server Actions should only handle transport concerns: authorization checks, input validation, delegating to application commands, revalidating paths, and catching errors. They should not contain business logic.
- **TWN Code Reference**: `src/app/actions/collections.ts`.

### LinkedIn Post Template
```text
Should business logic live inside Server Actions in Next.js?

Answer: NO.

In TWN, Server Actions act strictly as THIN TRANSPORT ADAPTERS.

What a Server Action does:
1. Verify Authorization (`canManageArticles()`)
2. Validate Input DTOs (Zod schemas)
3. Delegate to Application Layer (`createCollectionAdmin()`)
4. Record Audit Log (`recordAuditLog()`)
5. Revalidate Cache (`revalidatePath()`)
6. Return a standardized Result DTO

By keeping Server Actions thin, your application commands can be tested in isolation without needing a Next.js HTTP server context!

#CleanArchitecture #NextJS #TypeScript #SoftwareDesign #Backend
```

### TikTok Video Script
- **Visual**: Side-by-side comparison of a 100-line messy Server Action vs a 15-line Thin Server Action calling `createCollectionAdmin()`.
- **Hook**: "Stop putting 100 lines of logic inside Next.js Server Actions!"
- **Script**:
  - *"Here is why your Server Actions are getting bloated."*
  - *"A Server Action is just a transport layer!"*
  - *"Check auth, validate input, call your core app command, revalidate path, and return."*
  - *"Keep them thin, and your app stays clean!"*

---

## Day 33: Authorization Policies in TypeScript (`canManageArticles`)

### Technical Concept to Master
- **Concept**: Centralized Authorization Policy Predicates.
- **Plain Language**: Centralizing permission logic into reusable functions so security rules aren't duplicated across 20 files.
- **TWN Code Reference**: `src/lib/auth/policies.ts`.

### LinkedIn Post Template
```text
Duplicating `if (!session || session.role !== 'admin')` across 15 different files is a recipe for security vulnerabilities.

In TWN, we centralize authorization rules into pure, unit-tested policy functions inside `src/lib/auth/policies.ts`:

- `canManageArticles()`
- `canModerateSharedPages()`
- `canManageNotebookEntries()`

Each policy function:
1. Resolves current actor identity via `requireAdmin()`
2. Verifies specific permission requirements
3. Throws a standardized `AdminAccessError` if unauthorized

Centralized policies mean that if security rules change tomorrow, we update ONE policy function, and the entire app updates safely.

#WebSecurity #TypeScript #SoftwareEngineering #CodeQuality
```

### TikTok Video Script
- **Visual**: Opening `src/lib/auth/policies.ts` and showing `canManageArticles()`.
- **Hook**: "How to write clean authorization logic in TypeScript."
- **Script**:
  - *"Don't copy-paste auth checks in every file!"*
  - *"In TWN, we write centralized policy functions like `canManageArticles()`."*
  - *"It handles session checks, admin allowlists, and throws clean errors."*
  - *"One line of code per action keeps your security rock solid!"*

---

## Day 38: Abstracting Clerk Behind Identity Ports

### Technical Concept to Master
- **Concept**: Port/Adapter Decoupling for Third-Party Authentication.
- **Plain Language**: Defining an `IdentityPort` interface so domain logic doesn't import Clerk's `@clerk/nextjs` package directly.
- **TWN Code Reference**: `docs/architecture/adr/ADR-002-clerk-authentication.md` & `src/modules/identity/`.

### LinkedIn Post Template
```text
What happens to your codebase if your authentication provider (Clerk, Auth.js, Supabase Auth) deprecates an API or changes pricing?

If your domain code imports `@clerk/nextjs` directly everywhere, you're locked in.

In TWN, we enforce ADR-002:
Clerk is treated strictly as an INFRASTRUCTURE ADAPTER.

We define an interface in `src/modules/identity/contracts/`:
`export interface UserIdentity { userId: string; role: string | null; }`

And implement a `ClerkAdapter` in `identity/infrastructure/`.

No business module imports `@clerk/nextjs`. They only consume the `Identity` contract!

If we ever switch auth providers, we write ONE new adapter file. The rest of TWN doesn't change a single line of code.

#SoftwareArchitecture #NextJS #Clerk #TypeScript #Decoupling
```

### TikTok Video Script
- **Visual**: Diagram showing Clerk inside `identity/infrastructure/`, connected to core app via an `IdentityPort` shield.
- **Hook**: "Don't lock your Next.js app into Clerk!"
- **Script**:
  - *"Love Clerk? Great! But don't let Clerk SDK imports spread across your entire codebase."*
  - *"In TWN, Clerk lives exclusively inside `modules/identity/infrastructure/` behind a port."*
  - *"If we ever change auth providers, we swap one file—not fifty!"*

---

## Day 52: Platform Audit Logging (`src/platform/audit/`)

### Technical Concept to Master
- **Concept**: Cross-Cutting Capabilities & Append-Only Audit Logging.
- **Plain Language**: Audit logging records *who* performed *what* action on *which* resource for compliance and security auditing. It belongs in a shared platform layer because all modules use it.
- **TWN Code Reference**: `src/platform/audit/audit-log.ts` & `src/app/(admin)/admin/audit/page.tsx`.

### LinkedIn Post Template
```text
Where should Audit Logging live in a Modular Monolith?

Initially, audit logging was located inside `src/lib/services/audit-log.ts`. But as we refactored TWN into bounded modules, we noticed a problem: EVERY module needs audit logging!

If `Editorial` imports audit logging from `Community`, we create a bad cross-module dependency.

Solution:
We moved audit logging to a top-level PLATFORM capability: `src/platform/audit/audit-log.ts`.

Platform capabilities provide cross-cutting services (Audit, Observability, Security) that domain modules can consume without introducing domain-to-domain coupling.

Now every admin action records:
- `userId`
- `action` (e.g., `article.published`)
- `targetType` & `targetId`
- `details` (JSON payload)

Immutable security audit trails done right!

#SoftwareArchitecture #AuditLog #CyberSecurity #TypeScript #PostgreSQL
```

### TikTok Video Script
- **Visual**: Admin audit page showing a clean timeline table of logged actions (`collection.created`, `shared_page.approved`).
- **Hook**: "How to build an audit trail in Next.js!"
- **Script**:
  - *"Every serious admin CMS needs an immutable audit log."*
  - *"In TWN, every moderation and content action records who did it, what changed, and when."*
  - *"We store audit logs in PostgreSQL and display them in the admin dashboard!"*

---

*(Days 53–60 continue with detailed guides on audit verification, threat modeling, and error formatting...)*
