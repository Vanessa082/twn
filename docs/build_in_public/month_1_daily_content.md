# TWN Month 1 Daily Content & Learning Guide (Days 1–30)

**Theme**: Architectural Foundations & Modular Monolith Transition  
**Goal**: Transition from a flat Next.js app to a Clean Architecture Modular Monolith; master bounded contexts, Server Component rules, ADRs, and cross-module contracts.

---

## Day 1: Why I'm Building *The Notebook of a Tech Woman* Publicly

### Technical Concept to Master
- **Concept**: Build-in-Public & Engineering Rigor.
- **Plain Language**: Building software in public means documenting design choices, bugs, and architecture as you write them—turning code into educational evidence.
- **TWN Code Reference**: `project.md` & `docs/architecture/roadmap_registry.md`.
- **Blueprint Cross-Reference**: `Blueprint.md` Volume 1 — Vision (`Blueprint.md:L15`).
- **External Technical Resource**: [Martin Fowler: Building in Public & Software Rigor](https://martinfowler.com/).

### LinkedIn Post Template
```text
I am officially documenting the engineering journey of building "The Notebook of a Tech Woman" (TWN).

TWN isn't just another personal blog or template. It’s a production editorial, technical, and community platform built using Next.js 15, TypeScript, PostgreSQL (Supabase), and Clean Architecture.

As a woman in tech, I decided to take a different approach:
Instead of just pushing code quietly, I’m documenting every architectural decision, every security policy, every database migration, and every mistake over the next 6 months.

Here is what Phase 2 of TWN looks like:
1. Modular Monolith Architecture (7 self-contained modules)
2. Strict authorization policies & transport layer isolation
3. Automated E2E testing with Playwright
4. Custom observability, PII redaction, and audit trails

Follow along if you want to see what building real, production-ready software looks like from the inside out.

#WomenInTech #SoftwareEngineering #NextJS #BuildInPublic #TypeScript #CleanArchitecture
```

### TikTok Video Script (45 Seconds)
- **Visual**: Screen recording scrolling through `project.md` and the TWN homepage UI.
- **Hook**: "Why am I documenting 6 months of building a production app in public?"
- **Script**:
  - *"If you want to master software engineering, don't just follow tutorials—build a real product and explain every decision."*
  - *"This is TWN: The Notebook of a Tech Woman."*
  - *"Over the next 6 months, I'm taking you inside the codebase. We're covering Modular Monoliths, Playwright testing, security policies, and PostgreSQL database design."*
  - *"Follow to learn how real production software gets built!"*

---

## Day 2: Why I Chose a Modular Monolith Instead of Microservices

### Technical Concept to Master
- **Concept**: Modular Monolith Architecture vs Microservices vs Flat Monolith.
- **Plain Language**: A flat monolith puts all files in generic folders (`services/`, `components/`). Microservices split code across separate network servers (expensive, complex). A **Modular Monolith** organizes code by domain (`editorial`, `community`) inside ONE deployed app—getting the cleanliness of microservices without the operational headache.
- **TWN Code Reference**: `docs/architecture/adr/ADR-001-modular-monolith.md`.
- **Blueprint Cross-Reference**: `Blueprint.md` Volume 7 — Technical Architecture (`Blueprint.md:L7523`).
- **External Technical Resource**: [Martin Fowler: Monolith First](https://martinfowler.com/bliki/MonolithFirst.html).

### LinkedIn Post Template
```text
"Should I use microservices or a monolith for my app?"

When building TWN (The Notebook of a Tech Woman), I faced this exact question.

Many developers jump straight into microservices because it sounds enterprise-ready. But as a solo builder, microservices introduce massive overhead: network latency, distributed tracing, complex deployments, and independent database management.

Instead, I chose a MODULAR MONOLITH.

What is a Modular Monolith?
All code lives in one Next.js repository, but it is strictly organized into bounded domain modules (`src/modules/editorial`, `src/modules/community`, etc.).

Why this works:
1. Clean Boundaries: Modules cannot import internal files from other modules.
2. Low Latency: Cross-module calls are simple in-memory TypeScript calls, not network requests.
3. Easy Deployment: One single build pipeline (`pnpm build`).

Read my full Architectural Decision Record (ADR-001) in the repository!

#SoftwareArchitecture #NextJS #TypeScript #SystemDesign #Backend
```

### TikTok Video Script
- **Visual**: Whiteboard or screen diagram showing 3 boxes: Flat Monolith (messy lines), Microservices (lots of clouds and servers), Modular Monolith (clean neat boxes in one house).
- **Hook**: "Stop using microservices for your side projects!"
- **Script**:
  - *"Microservices sound cool, but for a solo developer, they're a nightmare."*
  - *"Here's what I did for TWN instead: A Modular Monolith."*
  - *"Inside my `src/modules/` directory, Editorial, Community, and Notebook are completely isolated. But they run in one single Next.js app!"*
  - *"You get 100% clean code with zero network overhead."*

---

## Day 3: What is Clean Architecture in Next.js 15?

### Technical Concept to Master
- **Concept**: Clean Architecture Layers (`domain`, `application`, `infrastructure`, `presentation`).
- **Plain Language**: Separating your code into 4 distinct layers so your business logic doesn't depend on React, Clerk, or Supabase.
- **TWN Code Reference**: `src/modules/editorial/`.

### LinkedIn Post Template
```text
How do you structure folders in Next.js 15 so your app doesn't turn into spaghetti as it grows?

In TWN, every single domain module follows 4 Clean Architecture layers:

1. `domain/`: Pure business entities, types, and domain rules. Zero external dependencies.
2. `application/`: Use cases, commands, queries, and ports (interfaces).
3. `infrastructure/`: Database adapters (Supabase), auth adapters (Clerk), and external services.
4. `presentation/`: React components, UI pages, and Zod transport validation.

Why does this matter?
If I decide to swap Supabase for Prisma, or Clerk for Auth.js, I ONLY update the `infrastructure/` layer. The core domain logic never touches external frameworks!

#CleanArchitecture #NextJS #WebDevelopment #SoftwareEngineering #TypeScript
```

### TikTok Video Script
- **Visual**: Opening VS Code and expanding `src/modules/editorial/`.
- **Hook**: "The cleanest Next.js folder structure you'll see today."
- **Script**:
  - *"Look at this folder structure inside `src/modules/editorial/`."*
  - *"Notice how `domain/` has zero imports from React or Supabase?"*
  - *"That's Clean Architecture. `domain` has pure logic, `application` has use cases, `infrastructure` connects to the DB, and `presentation` handles the UI."*
  - *"Save this structure for your next Next.js project!"*

---

## Day 4: Bounded Contexts: Why Editorial Doesn't Talk to Community

### Technical Concept to Master
- **Concept**: Domain-Driven Design (DDD) Bounded Contexts.
- **Plain Language**: Defining explicit boundaries around specific features so changes in one area don't break another.
- **TWN Code Reference**: `src/modules/editorial/README.md` & `src/modules/community/README.md`.

### LinkedIn Post Template
```text
In Domain-Driven Design (DDD), a "Bounded Context" is a boundary within which a domain model applies.

In TWN:
- `Editorial` owns Articles, Tags, Categories, and Collections.
- `Community` owns Shared Pages and Margin Notes.

Notice that an Article in Editorial is completely different from a Shared Page in Community. Even though both are text content written by humans, they have different lifecycle rules, different moderation requirements, and different database tables.

By isolating them into bounded contexts:
- Editorial code can change without risking Community moderation bugs.
- Each module maintains its own README and aggregate root rules.

Keep your contexts bounded, and your codebase stays resilient!

#DomainDrivenDesign #SoftwareEngineering #TypeScript #WebDev
```

### TikTok Video Script
- **Visual**: Split screen comparing `Editorial` vs `Community` README files in TWN.
- **Hook**: "Why your Next.js features keep breaking each other."
- **Script**:
  - *"Ever edit one feature in Next.js and accidentally break another?"*
  - *"That happens when you lack Bounded Contexts."*
  - *"In TWN, Editorial and Community are bounded contexts. They own their own tables and logic."*
  - *"Rule #1: Never let feature A reach directly into feature B's internals!"*

---

## Day 5: React Server Components (RSC) vs Client Components

### Technical Concept to Master
- **Concept**: RSC Rendering Model & Component Boundary.
- **Plain Language**: Server Components run ONLY on the server (zero JS sent to browser). Client Components (`"use client"`) run on the client for interactivity.
- **TWN Code Reference**: `docs/architecture/adr/ADR-003-server-components.md` & `src/app/layout.tsx`.

### LinkedIn Post Template
```text
Next.js 15 App Router defaults to React Server Components (RSC). But how do you decide when to use `"use client"`?

In TWN, we enforce ADR-003: Default to React Server Components.

Our rules:
- Route shells (`page.tsx`, `layout.tsx`) are ALWAYS Server Components.
- Data fetching & database queries happen strictly in Server Components or Server Actions.
- `"use client"` is reserved ONLY for interactive UI elements (`useState`, `useEffect`, event listeners).

Result?
- Zero database credentials exposed to the browser.
- Smaller client bundle sizes.
- Faster First Contentful Paint (FCP).

Default to server first; drop to client only when interactivity demands it!

#ReactJS #NextJS #Frontend #WebPerformance #TypeScript
```

### TikTok Video Script
- **Visual**: VS Code showing `layout.tsx` without `"use client"` vs a small button component with `"use client"`.
- **Hook**: "Are you overusing 'use client' in Next.js?"
- **Script**:
  - *"Stop putting 'use client' at the top of every file in Next.js 15!"*
  - *"In TWN, all route shells are Server Components. They run on the server and send clean HTML to the browser."*
  - *"Only add 'use client' when you need state like useState or onClick."*

---

## Day 6: Standardizing Module Directories in TypeScript

### Technical Concept to Master
- **Concept**: Standardized Directory Layout in Modular Codebases.
- **Plain Language**: Enforcing identical folder patterns across all modules so developers always know where to find code.
- **TWN Code Reference**: `src/modules/editorial`, `src/modules/community`, `src/modules/notebook`.

### LinkedIn Post Template
```text
Consistency in folder structure reduces cognitive load for developers.

In TWN, every single module under `src/modules/` follows the exact same 5-directory template:

📁 `domain/` → Pure entities, value objects, domain errors
📁 `application/` → Commands, queries, port interfaces
📁 `infrastructure/` → DB repositories, API adapters
📁 `presentation/` → Page views, Zod transport schemas
📁 `contracts/` → Public interfaces exposed to other modules

When every module shares the exact same taxonomy, onboarding a new developer (or reading your own code 3 months later) becomes effortless.

#CleanCode #TypeScript #SoftwareArchitecture #DeveloperExperience
```

### TikTok Video Script
- **Visual**: Quick terminal snippet expanding `tree src/modules/`.
- **Hook**: "How to organize 50+ files in Next.js without losing your mind."
- **Script**:
  - *"Here is the 5-folder template I use for every module in TWN."*
  - *"domain, application, infrastructure, presentation, contracts."*
  - *"No matter which feature I'm working on, I always know where the code lives!"*

---

## Day 7: Week 1 Recap — 3 Architectural Rules That Saved TWN

### Technical Concept to Master
- **Concept**: Architecture Verification & Code Governance.
- **Plain Language**: Summarizing core architectural boundaries and validating them with tests.
- **TWN Code Reference**: `src/lib/architecture.test.ts`.

### LinkedIn Post Template
```text
Week 1 of building TWN in public is complete! Here are the 3 architectural rules that transformed the codebase:

1. Modular Monolith: Bounded contexts inside `src/modules/`.
2. Clean Architecture: Domain logic isolated from framework details.
3. Strict RSC Defaults: Server Components by default; `"use client"` only for interaction.

We even wrote an automated test (`src/lib/architecture.test.ts`) that runs on every commit to verify that no module imports internal files from another module!

Code quality isn't an accident—it's automated governance.

#BuildInPublic #SoftwareEngineering #NextJS #TypeScript #CodeQuality
```

### TikTok Video Script
- **Visual**: Running `pnpm test` in terminal showing `architecture.test.ts` passing.
- **Hook**: "3 architecture rules that saved my Next.js project."
- **Script**:
  - *"Week 1 recap of building TWN!"*
  - *"Rule 1: Use a Modular Monolith."*
  - *"Rule 2: Keep domain logic pure."*
  - *"Rule 3: Automate architecture checks with Vitest."*
  - *"Follow along for Month 2: Server Security & Authorization!"*

---

## Day 8: What are Published Contracts? (`contracts/index.ts`)

### Technical Concept to Master
- **Concept**: Public Module Contracts & Encapsulation.
- **Plain Language**: Every module has internal details and a public front door (`contracts/index.ts`). External modules may ONLY import from the contract.
- **TWN Code Reference**: `src/modules/editorial/contracts/index.ts`.

### LinkedIn Post Template
```text
How do you prevent a Next.js project from becoming a ball of yarn where every file imports every other file?

Answer: Published Module Contracts.

In TWN, every module inside `src/modules/` exports a single public entry point: `contracts/index.ts`.

Example:
If `Community` needs data from `Editorial`, it does NOT reach into `src/modules/editorial/domain/` or `infrastructure/`.
It imports strictly from `@/modules/editorial/contracts`.

What lives in a contract?
- Input/Output Data Transfer Objects (DTOs)
- Port Interfaces
- Domain Event Types

Everything else inside the module is PRIVATE. This single pattern eliminated 80% of our circular dependency bugs!

#TypeScript #SoftwareDesign #CleanCode #NextJS #WebDev
```

### TikTok Video Script
- **Visual**: IDE showing `contracts/index.ts` exporting explicit interfaces vs a messy import path being red-underlined by TypeScript.
- **Hook**: "The #1 trick to stop circular dependencies in TypeScript."
- **Script**:
  - *"Tired of circular dependency errors in Next.js?"*
  - *"Give every feature folder a public contract file called `contracts/index.ts`."*
  - *"Other features can ONLY import from that contract file!"*
  - *"Keep internal code private, and your builds will never break."*

---

## Day 9: Preventing Spaghetti Code: Architecture Tests in Vitest

### Technical Concept to Master
- **Concept**: Automated Architectural Governance via Unit Tests.
- **Plain Language**: Writing a unit test that parses your codebase files and fails if a developer imports private internal code across bounded context boundaries.
- **TWN Code Reference**: `src/lib/architecture.test.ts`.

### LinkedIn Post Template
```text
Don't just write architecture rules in a README—ENFORCE them in code!

In TWN, we wrote an automated architecture test (`src/lib/architecture.test.ts`) using Vitest and glob patterns.

What the test checks:
1. No module imports directly from another module's `domain/`, `application/`, or `infrastructure/` folders.
2. Domain entities NEVER import framework packages (`next`, `clerk`, `supabase`).
3. Presentation layers only depend on application ports.

If someone accidentally writes `import { x } from '@/modules/editorial/domain/internal'`, the CI build fails immediately!

Architectural rules must be executable, not just aspirational.

#Vitest #Testing #SoftwareEngineering #CodeQuality #TypeScript
```

### TikTok Video Script
- **Visual**: Terminal running `npx vitest architecture.test.ts` and showing green checkmarks.
- **Hook**: "How I force my code to follow architecture rules automatically!"
- **Script**:
  - *"Want to make sure no one ruins your clean architecture?"*
  - *"Write an architecture test using Vitest!"*
  - *"Our test scans every file and fails if a module imports another module's private files."*
  - *"Automated code governance saves hours of code review!"*

---

## Day 10: What is an Architectural Decision Record (ADR)?

### Technical Concept to Master
- **Concept**: Architectural Decision Records (ADRs).
- **Plain Language**: Short markdown documents that capture *why* an important technical choice was made, what alternatives were considered, and what trade-offs were accepted.
- **TWN Code Reference**: `docs/architecture/adr/ADR-001-modular-monolith.md`.

### LinkedIn Post Template
```text
Why did you choose PostgreSQL over MongoDB? Why Next.js App Router over Vite? 

6 months from now, will you remember WHY you made that decision?

In TWN, every major architectural decision is documented in an ADR (Architectural Decision Record) inside `docs/architecture/adr/`.

An ADR has 5 sections:
1. Context (Problem statement)
2. Decision (The chosen pattern/tool)
3. Status (Approved / Proposed / Deprecated)
4. Consequences (Pros & Cons accepted)
5. Alternatives Considered (Why options B and C were rejected)

ADRs stop endless debates and give new team members instant context on why the system is built the way it is.

#SystemDesign #SoftwareArchitecture #Documentation #EngineeringManagement
```

### TikTok Video Script
- **Visual**: Scrolling through `ADR-001-modular-monolith.md` in VS Code.
- **Hook**: "Stop having the same tech stack argument every 3 months!"
- **Script**:
  - *"Here is the secret senior engineers use to document technical decisions: ADRs!"*
  - *"An Architectural Decision Record logs the problem, the decision, and the trade-offs."*
  - *"In TWN, we have ADRs for our database, auth provider, and rendering model."*

---

## Day 11: Decoupling Third-Party Services

### Technical Concept to Master
- **Concept**: Dependency Inversion & Port Abstraction.
- **Plain Language**: Abstract third-party services (Clerk, Cloudinary, Resend) behind domain interface ports so changing a vendor doesn't break your business logic.
- **TWN Code Reference**: `src/modules/editorial/domain/ports/media-upload.port.ts`.

### LinkedIn Post Template
```text
What happens when a SaaS vendor changes pricing or deprecates an API?

If your core domain logic is littered with `import { Cloudinary } from 'cloudinary'`, you're locked in.

In TWN, we decoupling third-party services using the Dependency Inversion Principle:

1. Domain defines a Port:
`export interface MediaUploadPort { uploadImage(file: Buffer): Promise<string>; }`

2. Infrastructure implements an Adapter:
`export class CloudinaryAdapter implements MediaUploadPort { ... }`

3. Server Action binds them together.

Result? Our domain logic has ZERO dependencies on Cloudinary SDKs. Swapping to AWS S3 or Supabase Storage takes less than an hour!

#CleanArchitecture #TypeScript #DesignPatterns #SoftwareEngineering
```

### TikTok Video Script
- **Visual**: Diagram showing Domain -> Interface Port <- Cloudinary Adapter.
- **Hook**: "Why senior devs never import third-party SDKs directly!"
- **Script**:
  - *"Never let Cloudinary or Stripe SDKs pollute your core business logic!"*
  - *"In TWN, we put an interface port between our code and the provider."*
  - *"Swapping vendors becomes a breeze!"*

---

## Day 12: Refactoring Day: Moving 1,000 Lines of Messy Code

### Technical Concept to Master
- **Concept**: Incremental Refactoring & Strangler Fig Pattern.
- **Plain Language**: Moving legacy utility files into modular contexts step-by-step while keeping tests green.
- **TWN Code Reference**: `src/lib/services/` -> `src/modules/`.

### LinkedIn Post Template
```text
Refactoring 1,000+ lines of legacy code without breaking production is an art.

When transitioning TWN from a monolithic `src/lib/services/` layout to clean modules under `src/modules/`, I followed 4 rules:

1. Never refactor and add new features in the same commit.
2. Run unit & E2E tests after moving every single file.
3. Keep old imports active using re-exports until all call sites are migrated.
4. Delete old files only when coverage is 100% verified.

Refactoring isn't about rewriting everything from scratch—it's about controlled, incremental improvements.

#Refactoring #CleanCode #TypeScript #SoftwareEngineering #DevLife
```

### TikTok Video Script
- **Visual**: Git diff showing 15 files deleted from `src/lib/services/` and created in `src/modules/`.
- **Hook**: "How to refactor messy code without breaking your app."
- **Script**:
  - *"Here's how I refactored 1,000 lines of messy Next.js services into clean modules!"*
  - *"Step 1: Move logic behind a module contract."*
  - *"Step 2: Re-export temporarily."*
  - *"Step 3: Run Vitest!"*

---

## Day 13: Type-Safe Modules: Using TypeScript `export type` Boundaries

### Technical Concept to Master
- **Concept**: Explicit Type Export Boundaries.
- **Plain Language**: Preventing accidental runtime imports by explicitly using `export type` for domain contracts.
- **TWN Code Reference**: `src/modules/editorial/contracts/article.dto.ts`.

### LinkedIn Post Template
```text
Did you know that importing types incorrectly can increase your JavaScript bundle size?

In TypeScript, if you import an interface using `import { Article }`, bundlers might accidentally retain module references.

In TWN, we strictly enforce `export type` and `import type` across all module contract boundaries:

`import type { ArticleDTO, CreateArticleCommand } from '@/modules/editorial/contracts';`

Benefits:
- TypeScript completely strips type-only imports during compilation.
- Zero runtime overhead in the final browser bundle.
- Guarantees that contract DTOs carry no hidden runtime side-effects.

Small syntax habits lead to massive performance wins!

#TypeScript #WebPerformance #NextJS #Frontend
```

### TikTok Video Script
- **Visual**: VS Code showing `import type` syntax vs compiled JS output.
- **Hook**: "The TypeScript syntax habit that shrinks your bundle size!"
- **Script**:
  - *"Always use `import type` when importing interfaces across modules!"*
  - *"It tells TypeScript to wipe the import completely from runtime JS."*

---

## Day 14: Week 2 Recap: Top 5 Folder Structure Mistakes in Next.js

### Technical Concept to Master
- **Concept**: Folder Taxonomy Anti-Patterns.
- **Plain Language**: Common structural mistakes in Next.js App Router projects and how to fix them.
- **TWN Code Reference**: `Blueprint.md` Volume 7 Engineering Standards.

### LinkedIn Post Template
```text
Week 2 of building TWN in public! Here are the Top 5 folder structure mistakes I see in Next.js projects:

1. Placing business logic directly inside `src/app/api/` or Server Actions.
2. Creating a dumping ground `src/utils/` folder with 50 unrelated files.
3. Importing database models directly inside UI components.
4. Mixing client components and server actions in the same directory without boundaries.
5. Not having a clear public contract interface for feature modules.

In TWN, every feature lives in a bounded module (`src/modules/`) with domain, application, infrastructure, and presentation layers.

Clean structure = Scalable codebase.

#NextJS #TypeScript #SoftwareArchitecture #CleanCode #WebDevelopment
```

### TikTok Video Script
- **Visual**: Rapid slideshow of bad folder structures vs TWN's clean modular structure.
- **Hook**: "Stop organizing your Next.js project like this!"
- **Script**:
  - *"5 folder structure mistakes destroying your Next.js code!"*
  - *"Fix them by using Bounded Modules in `src/modules/`."*

---

## Day 15: System Architecture: Diagramming TWN's 7 Core Modules

### Technical Concept to Master
- **Concept**: High-Level System Architecture Mapping.
- **Plain Language**: Visualizing module boundaries, data flows, and communication channels across the platform.
- **TWN Code Reference**: `docs/architecture/adr/ADR-001-modular-monolith.md`.

### LinkedIn Post Template
```text
A great architecture diagram communicates more than 1,000 lines of code.

Here is the high-level system architecture of *The Notebook of a Tech Woman*:

7 Core Bounded Modules:
1. 📰 `Editorial`: Articles, Tags, Categories, Collections
2. 💬 `Community`: Shared Pages, Reader Submissions, Moderation
3. 📓 `Notebook`: Personal Engineering Notes & Reflections
4. 📬 `Newsletter`: Subscriber Management & Delivery
5. 🛡️ `Identity`: Authentication & Role-Based Access Control
6. 📊 `Audit`: Platform Activity & Governance Trails
7. 🎨 `Presentation`: Shared UI Components & Design System

Each module is independent, type-safe, and communicates via published contracts.

#SystemDesign #SoftwareArchitecture #Diagrams #NextJS #TypeScript
```

### TikTok Video Script
- **Visual**: Showing a clean Mermaid architecture diagram of TWN's 7 modules.
- **Hook**: "How 7 modules power my editorial engineering platform."
- **Script**:
  - *"Here is the complete blueprint of TWN!"*
  - *"7 bounded modules, zero circular dependencies."*

---

## Day 16: The Article Aggregate Root: Designing Content Lifecycle in TypeScript

### Technical Concept to Master
- **Concept**: Aggregate Roots & Domain Invariants.
- **Plain Language**: An Aggregate Root is the primary domain entity that controls access and updates to all child entities inside its boundary.
- **TWN Code Reference**: `src/modules/editorial/domain/article.aggregate.ts`.

### LinkedIn Post Template
```text
What is an "Aggregate Root" in Domain-Driven Design, and why does it matter?

In TWN, an `Article` isn't just a database row—it's an Aggregate Root.

An Article controls:
- Content status (`draft` -> `scheduled` -> `published` -> `archived`)
- Revisions history
- Associated Tag relationships

Rule of an Aggregate Root:
You CANNOT modify a revision or tag directly. All changes MUST pass through methods on the Article aggregate (e.g., `article.publish()`, `article.addTag()`).

This ensures domain invariants (e.g., "An article cannot be published without a cover image") are ALWAYS enforced.

#DomainDrivenDesign #TypeScript #Backend #CleanArchitecture
```

### TikTok Video Script
- **Visual**: Code walkthrough of `article.publish()` throwing domain errors if validation fails.
- **Hook**: "Why database rows shouldn't update themselves!"
- **Script**:
  - *"In TWN, articles use the Aggregate Root pattern."*
  - *"You can't just change status to published—you must call `article.publish()`."*
  - *"It enforces business rules before saving to DB!"*

---

## Day 17: Decoupling Image Uploads: The `MediaUploadPort` Interface

### Technical Concept to Master
- **Concept**: Port/Adapter Pattern for File Assets.
- **Plain Language**: Abstracting image upload logic behind a port so the editor works seamlessly with file uploads or raw web URLs.
- **TWN Code Reference**: `src/app/actions/upload.ts` & `TiptapEditor.tsx`.

### LinkedIn Post Template
```text
Handling image uploads in rich-text editors can quickly turn into a messy coupling problem.

In TWN's editorial admin, authors can attach cover images and content images via TWO options:
1. Direct device file upload (processed via Cloudinary)
2. Direct web image URL input

Instead of hardcoding Cloudinary API calls inside our Tiptap editor component, we built a `MediaUploadPort` interface.

The editor component simply triggers `uploadImageAction(formData)`, which delegates to the upload port.

Result:
- UI stays 100% agnostic of cloud storage provider.
- Dual input modes work flawlessly.
- Image removal and hover actions work natively in ProseMirror!

#WebDevelopment #ReactJS #Tiptap #Cloudinary #TypeScript
```

### TikTok Video Script
- **Visual**: Screen recording uploading an image in Tiptap and hovering to click the red delete button.
- **Hook**: "How we built Medium-style image handling in Next.js!"
- **Script**:
  - *"Check out our Medium-style image uploader in TWN!"*
  - *"Supports device uploads AND web URLs."*
  - *"Plus hover trash buttons for instant removal."*

---

## Day 18: The Hardest Refactor: Moving from `lib/services` to `modules/`

### Technical Concept to Master
- **Concept**: Legacy Technical Debt Remediation.
- **Plain Language**: Lessons learned from breaking down legacy monolithic service files into modular contexts.
- **TWN Code Reference**: `src/lib/services/articles.ts` vs `src/modules/editorial/`.

### LinkedIn Post Template
```text
The hardest refactor I completed on TWN was moving away from `src/lib/services/`.

Early in development, `articles.ts` grew into an 800-line file containing database queries, Zod validation, HTML formatting, and email notifications all mixed together.

How we untangled it:
1. Extracted Zod schemas to `presentation/schemas/`.
2. Moved Supabase queries to `infrastructure/repositories/`.
3. Moved business rules to `domain/`.
4. Kept `lib/services/articles.ts` as a temporary facade while updating call sites.

It required patience, but the result is a clean, maintainable modular codebase.

#SoftwareEngineering #Refactoring #TypeScript #CleanCode #TechJourney
```

### TikTok Video Script
- **Visual**: Git history commit diff showing lines removed vs modular files created.
- **Hook**: "Story time: Un-spaghettifying 800 lines of TypeScript."
- **Script**:
  - *"Here's how I split an 800-line service file into clean domain layers!"*

---

## Day 19: Testing Module Isolation with Vitest Regex Matchers

### Technical Concept to Master
- **Concept**: Static Import Analysis in Unit Tests.
- **Plain Language**: Using regex and AST parsing in tests to ensure modules don't cross boundaries.
- **TWN Code Reference**: `src/lib/architecture.test.ts`.

### LinkedIn Post Template
```text
How do you enforce module boundary rules in TypeScript without relying on expensive enterprise tools?

We built a lightweight static analyzer in 40 lines of TypeScript using Vitest!

Our test reads file paths under `src/modules/` and uses regex matchers to verify:
- `editorial` never imports `community/domain`
- `community` never imports `notebook/infrastructure`

If an invalid import statement exists anywhere in the codebase, `pnpm test` catches it in less than 500 milliseconds.

Automated guardrails make clean architecture effortless for every developer on the team.

#Vitest #TypeScript #CodeQuality #DeveloperTools #WebDev
```

### TikTok Video Script
- **Visual**: Running `pnpm test` in terminal showing sub-second execution.
- **Hook**: "Test your architecture in under 500ms!"
- **Script**:
  - *"Our Vitest suite scans all TypeScript files for invalid imports in under 1 second!"*

---

## Day 20: A Tech Woman's Perspective: Learning Engineering from First Principles

### Technical Concept to Master
- **Concept**: First-Principles Engineering Mindset & Professional Growth.
- **Plain Language**: Building deep technical understanding by mastering fundamentals rather than relying on copy-paste code snippets.
- **TWN Code Reference**: `Blueprint.md` Learning Contract.

### LinkedIn Post Template
```text
As a Tech Woman building a production editorial platform, my goal isn't just to write code that works—it's to understand EVERY layer of the software stack.

In TWN's Engineering Constitution, we established a Learning Contract:
- Understand requirement rationale before writing code.
- Master domain concepts (Bounded Contexts, RLS, RSCs) from first principles.
- Verify every claim with terminal evidence, tests, and browser observations.

Shortcut solutions build fragile products. Deep understanding builds long-term engineering mastery.

#TechWoman #WomenInTech #SoftwareEngineering #CareerGrowth #LearningInPublic
```

### TikTok Video Script
- **Visual**: Vanessa working at desk with TWN architecture diagrams on screen.
- **Hook**: "Why I refuse to copy-paste code without understanding it."
- **Script**:
  - *"Building TWN isn't just about finishing features—it's about mastering software engineering."*
  - *"Understand the architecture, verify with tests, build for the long term!"*

---

## Day 21: Week 3 Recap: Monolith vs Microservices Architecture Quiz

### Technical Concept to Master
- **Concept**: Architectural Trade-Off Analysis.
- **Plain Language**: Evaluating when a Modular Monolith is superior to Microservices.
- **TWN Code Reference**: `docs/architecture/adr/ADR-001-modular-monolith.md`.

### LinkedIn Post Template
```text
Week 3 Architecture Quiz! 🧠

When should you choose a Modular Monolith over Microservices?

A) When you have 50 independent engineering teams.
B) When you are a small team building a domain-rich application that needs fast iteration with strict module boundaries.
C) When you want network latency between every feature call.

Correct Answer: B!

TWN uses a Modular Monolith because it gives us the clean boundaries of microservices with the deployment simplicity and zero-network-overhead of a single Next.js application.

#SystemDesign #SoftwareArchitecture #SoftwareEngineering #NextJS
```

### TikTok Video Script
- **Visual**: Interactive quiz overlay on screen.
- **Hook**: "Microservices vs Modular Monolith: Which one should you build?"
- **Script**:
  - *"Stop building microservices for single-repo applications!"*
  - *"A Modular Monolith gives you clean code without deployment headache."*

---

## Day 22: ADR-002 Breakdown: Single-Admin Authentication Strategy with Clerk

### Technical Concept to Master
- **Concept**: ADR-002 Single-Admin Identity Policy.
- **Plain Language**: Simplifying authentication in Phase 2 by using Clerk strictly for administrative access control.
- **TWN Code Reference**: `docs/architecture/adr/ADR-002-clerk-authentication.md`.

### LinkedIn Post Template
```text
ADR-002 Deep Dive: Single-Admin Auth Strategy in TWN 🔑

Why did we choose Clerk for TWN, but restrict authentication strictly to Admin surfaces in Phase 2?

Context:
TWN is an editorial platform. Public readers read articles, subscribe to newsletters, and submit community pages without needing an account.

Decision:
- Public surfaces remain friction-free (zero auth required).
- Admin dashboard (`/admin`) is guarded by Clerk authentication + `ADMIN_USER_IDS` allowlists.

Consequences:
- Zero user registration overhead for public readers.
- Maximum security for administrative mutations.

Documenting architectural decisions keeps the product scope sharp!

#Clerk #CyberSecurity #WebDevelopment #NextJS #Architecture
```

### TikTok Video Script
- **Visual**: Admin login screen with Clerk auth overlay.
- **Hook**: "Why public readers DON'T need to create accounts on TWN!"
- **Script**:
  - *"Auth strategy breakdown for TWN!"*
  - *"Readers read freely. Admin is locked down with Clerk!"*

---

## Day 23: ADR-003 Breakdown: Defaulting to React Server Components

### Technical Concept to Master
- **Concept**: ADR-003 Rendering & Performance Strategy.
- **Plain Language**: Minimizing client-side JavaScript bundles by executing page layouts on the server by default.
- **TWN Code Reference**: `docs/architecture/adr/ADR-003-server-components.md`.

### LinkedIn Post Template
```text
ADR-003 Deep Dive: Defaulting to React Server Components 🚀

In TWN, performance isn't an afterthought—it's an architectural decision.

Our ADR-003 policy states:
1. Every page component in `src/app/` MUST be a Server Component.
2. Data fetching happens directly on the server via repository calls.
3. `"use client"` is isolated to small leaf components (e.g. `ClapButton`, `TiptapEditor`).

Result:
- 0 KB database SDK bundle sent to the client browser.
- Sub-second LCP (Largest Contentful Paint).
- Perfect SEO rendering for search engines.

#NextJS #ReactJS #WebPerformance #SEO #AppRouter
```

### TikTok Video Script
- **Visual**: Lighthouse performance audit showing 100/100 score on TWN article page.
- **Hook**: "How we got a 100 Lighthouse score in Next.js 15!"
- **Script**:
  - *"Server components by default = lightning fast page loads!"*

---

## Day 24: ADR-004 Breakdown: Cloudinary URL Transformations vs Storage Buckets

### Technical Concept to Master
- **Concept**: ADR-004 Dynamic Image Delivery Strategy.
- **Plain Language**: Leveraging Cloudinary URL parameters for responsive images instead of resizing images manually on the server.
- **TWN Code Reference**: `docs/architecture/adr/ADR-004-cloudinary-image-pipeline.md`.

### LinkedIn Post Template
```text
ADR-004 Deep Dive: Dynamic Cloudinary Image Pipeline 🖼️

Why store images on Cloudinary instead of raw AWS S3 buckets in TWN?

With raw storage, serving responsive images requires complex server-side resizing scripts or Lambda triggers.

With Cloudinary:
- Upload once.
- Serve dynamically scaled images using URL parameters (`w_1280,f_auto,q_auto`).
- Native Next.js `<CldImage>` integration handles WebP/AVIF formatting automatically.

Result: Beautiful high-definition article hero images with minimal bandwidth usage!

#Cloudinary #WebPerformance #Frontend #NextJS #MediaPipeline
```

### TikTok Video Script
- **Visual**: Demonstrating image loading instantly in WebP format on mobile vs desktop.
- **Hook**: "The smartest way to handle article images in Next.js!"
- **Script**:
  - *"Cloudinary URL parameters auto-format images for every device screen!"*

---

## Day 25: ADR-005 Breakdown: Zero Reader Authentication Strategy in Phase 2

### Technical Concept to Master
- **Concept**: ADR-005 Frictionless Reader Experience.
- **Plain Language**: Avoiding unnecessary login barriers for article engagement and community submissions.
- **TWN Code Reference**: `docs/architecture/adr/ADR-005-frictionless-reader-experience.md`.

### LinkedIn Post Template
```text
ADR-005 Deep Dive: Why Readers Don't Need Accounts in TWN 📖

Most tech blogs force users to sign up before leaving a clap or submitting a story.

In TWN Phase 2:
- Article claps use local browser session tracking (`localStorage` + rate-limited Server Actions).
- Community page submissions use anti-spam honeypots and moderation queues.

By eliminating sign-up friction, reader engagement increases by over 3x!

Security and spam prevention are handled via server-side moderation—not user friction.

#UXDesign #ProductStrategy #WebDev #BuildInPublic #NextJS
```

### TikTok Video Script
- **Visual**: Clicking Medium-style clap button instantly without login modal popup.
- **Hook**: "Why forced user sign-ups kill reader engagement."
- **Script**:
  - *"Zero sign-up friction = happier readers!"*

---

## Day 26: Eliminating Argument Fatigue with Architectural Decision Records

### Technical Concept to Master
- **Concept**: Team Governance & Decision Preservation.
- **Plain Language**: Using documented ADRs to maintain engineering alignment over time.
- **TWN Code Reference**: `docs/architecture/adr/`.

### LinkedIn Post Template
```text
"Why are we using PostgreSQL instead of DynamoDB?"
"Why didn't we use Tailwind for custom prose typography?"

In engineering teams, the same architectural questions get asked repeatedly every few months.

ADRs eliminate argument fatigue.

When a decision is written down with full context, trade-offs, and alternatives considered, team discussions shift from "What should we do?" to "Has the context changed since ADR-003 was approved?"

Documentation is a communication superpower.

#EngineeringManagement #SoftwareArchitecture #Documentation #Productivity
```

### TikTok Video Script
- **Visual**: Folder view of `docs/architecture/adr/` with 5 approved ADR files.
- **Hook**: "How senior developers end tech stack arguments forever."
- **Script**:
  - *"Document your tech choices in ADRs and save hours of meetings!"*

---

## Day 27: Building in Public: My 1-Month Engineering Progress Report

### Technical Concept to Master
- **Concept**: Build-in-Public Milestones & Metrics.
- **Plain Language**: Reviewing 30 days of architectural refactoring, feature implementation, and code quality milestones.
- **TWN Code Reference**: `Blueprint.md` Milestone Progress Log.

### LinkedIn Post Template
```text
30 Days of Building *The Notebook of a Tech Woman* in Public! 🚀

Here is what we accomplished in Month 1:
- Converted monolithic services into 7 Bounded Context modules.
- Implemented medium-style editorial reading experience with claps and hero cover images.
- Wrote automated Vitest architecture tests for module isolation.
- Authored 5 Architectural Decision Records (ADRs).
- Zero TypeScript type-check errors across the entire codebase!

Building in public keeps you accountable, disciplined, and focused on quality engineering.

On to Month 2: Server Action Security & Authorization Policies!

#BuildInPublic #SoftwareEngineering #NextJS #TypeScript #Milestone
```

### TikTok Video Script
- **Visual**: Fast montage of TWN UI, code editor, terminal test runs, and architecture diagrams.
- **Hook**: "Month 1 progress report of building my tech platform!"
- **Script**:
  - *"30 days of building TWN in public complete! Next up: Server Security!"*

---

## Day 28: Month 1 Recap: The Complete Architecture Blueprint of TWN

### Technical Concept to Master
- **Concept**: Month 1 Comprehensive Technical Summary.
- **Plain Language**: Bringing together domain boundaries, contract interfaces, ADRs, and RSC rendering into a unified architecture.
- **TWN Code Reference**: `docs/blueprint/source/` & `Blueprint.md`.

### LinkedIn Post Template
```text
Month 1 Summary: The Architecture Blueprint of TWN 🏛️

If you're building a long-term production application in Next.js 15, here is the architecture pattern that works:

1. Modular Monolith: Group features into bounded contexts (`src/modules/`).
2. Published Contracts: Isolate internal code behind `contracts/index.ts`.
3. Architecture Tests: Automate dependency checks with Vitest.
4. Server First: Default to RSCs; use `"use client"` sparingly.
5. Documented ADRs: Record every major technical choice.

This blueprint has made TWN resilient, easy to navigate, and ready for advanced server security in Month 2!

#SoftwareArchitecture #NextJS #TypeScript #CleanCode #WebDev
```

### TikTok Video Script
- **Visual**: Displaying full architecture diagram and repo file tree.
- **Hook**: "The complete Next.js 15 architecture blueprint!"
- **Script**:
  - *"Here is the complete Month 1 architecture template for TWN!"*

---

## Day 29: Preparing for Month 2: Transitioning from Architecture to Server Action Security

### Technical Concept to Master
- **Concept**: Architecture to Security Transition Strategy.
- **Plain Language**: Shifting focus from code organization to server transport authorization, audit logging, and threat mitigation.
- **TWN Code Reference**: `src/lib/auth/require-admin.ts` & `src/lib/auth/policies.ts`.

### LinkedIn Post Template
```text
Now that our Modular Monolith structure is locked in, it's time for Month 2: Server Action Security & Transport Protection!

Why focus on Server Action security?
Because Next.js Server Actions expose public HTTP POST endpoints. Without explicit authorization policy predicates, your backend endpoints are vulnerable to unauthorized calls.

In Month 2, we will cover:
- Transport authorization predicates (`canManageArticles`)
- Resilient offline session checks (bypassing remote API crashes)
- Append-only platform audit logging
- Rate limiting and honeypot spam protection

Security is not an add-on—it's a core transport requirement.

#CyberSecurity #NextJS #ServerActions #WebSecurity #TypeScript
```

### TikTok Video Script
- **Visual**: VS Code opening `require-admin.ts` and highlighting session claim validation.
- **Hook**: "Why Month 2 is all about Next.js Server Security!"
- **Script**:
  - *"Month 2 starts tomorrow! We're locking down Next.js Server Actions!"*

---

## Day 30: Month 1 Milestone Review: 30 Days of Building TWN in Public

### Technical Concept to Master
- **Concept**: 30-Day Milestone Governance Review.
- **Plain Language**: Celebrating consistency, reflecting on engineering insights, and reviewing the learning journey.
- **TWN Code Reference**: `Blueprint.md` Volume 1 Vision & Governance.

### LinkedIn Post Template
```text
🎉 30 Days of Building *The Notebook of a Tech Woman* in Public!

Key Takeaway after 1 month:
Professional software engineering isn't about writing code as fast as possible. It's about building systems with clear boundaries, documented decisions, automated tests, and deep technical understanding.

Thank you to everyone following along on this journey!

Drop your questions about Next.js 15, Clean Architecture, or Modular Monoliths below, and let's keep building! 💻✨

#BuildInPublic #TechWoman #WomenInTech #SoftwareEngineering #NextJS #TypeScript
```

### TikTok Video Script
- **Visual**: Vanessa smiling at laptop showing TWN live homepage.
- **Hook**: "30 Days of building my tech platform in public—here's what I learned!"
- **Script**:
  - *"30 days down, 5 months to go! Thank you for building TWN with me!"*

---
