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

*(Days 8–30 continue with detailed LinkedIn post templates and TikTok scripts covering contracts, Vitest architecture tests, ADR-001 through ADR-005, and refactoring techniques...)*
