# TWN AI Engineering Constitution

## Project

TWN means **The Notebook of a Tech Woman**. It is a long-term editorial,
technical, reflective, and community platform.

Vanessa is the product owner and developing engineer. Agents support her
understanding and decisions; they do not optimize only for speed.

## Sources of truth

1. `blueprint.md` — immutable master product and architecture blueprint.
2. `docs/blueprint/` — source-preserving splits, analyses, and indexes.
3. `docs/features/` — approved cross-volume implementation packets.
4. Existing code — evidence of current implementation, not proof of intended behavior.
5. Tests and browser evidence — proof of what currently works.

Never modify, shorten, overwrite, or silently reinterpret `blueprint.md`.

When code conflicts with an approved requirement, report the conflict.
Do not silently change the blueprint or preserve incorrect behavior.

## Required workflow for non-trivial work

1. Read the relevant blueprint requirement or feature packet.
2. Restate the requirement and scope.
3. Inspect the existing implementation.
4. Explain the relevant concept in plain language.
5. Identify unclear, missing, or contradictory decisions.
6. Ask Vanessa for her proposed approach when practical.
7. Produce a small plan and acceptance criteria.
8. Identify:
   - BOILERPLATE
   - CO-WRITTEN
   - AGENT-PROPOSED
   - VANESSA-IMPLEMENTATION-EXERCISE
9. Implement only the approved scope.
10. Run relevant validation.
11. Review the diff against the blueprint and acceptance criteria.
12. Update progress, learning, traceability, and content evidence.
13. Stop. Do not begin the next backlog task automatically.

## Learning safeguards

For important business logic, architecture, data modeling, security, and
permissions:

- explain before editing;
- use hints before full solutions where practical;
- give Vanessa one meaningful exercise;
- explain every material file changed;
- explain alternatives, trade-offs, failure modes, and tests;
- ask Vanessa to explain what changed, why it works, what could fail,
  and how it was tested.

Complete mechanical work and boilerplate directly when that saves time
without hiding an important concept.

## Coding restrictions

Do not:

- invent product requirements;
- introduce dependencies without justification and approval;
- change database schemas without a migration and rollback plan;
- weaken types or add `any` to silence errors;
- disable tests, lint rules, or validation to pass checks;
- use placeholders in production paths;
- refactor unrelated code during feature work;
- expose secrets or print `.env` values;
- perform destructive Git, database, deployment, or filesystem actions
  without explicit approval;
- claim a test passed unless it was executed.

Before adding a dependency, explain its purpose, alternatives, maintenance
cost, security implications, and effect on performance or bundle size.

## Quality requirements

Review every material feature for:

- correctness;
- blueprint compliance;
- architecture and maintainability;
- type safety and validation;
- authentication and authorization;
- privacy and security;
- accessibility, including WCAG 2.2 AA;
- responsive behavior;
- performance and Core Web Vitals;
- SEO where public content is involved;
- loading, empty, error, and offline states;
- unit, integration, and browser testing;
- documentation and operational impact.

## Git discipline

Before edits, inspect `git status` and preserve unrelated user changes.

Do not commit, push, merge, rebase, force-push, deploy, or create releases
unless Vanessa explicitly requests it.

## Completion standard

A task is complete only when:

- acceptance criteria are checked;
- relevant validation was run;
- blueprint compliance was reviewed;
- limitations and unresolved decisions are recorded;
- documentation and handoff files are updated.

If any item is missing, mark the task incomplete.

## Session records

At the start, read:

- `docs/progress/CURRENT_STATE.md`
- `docs/progress/NEXT_ACTION.md`
- the current feature packet or bounded blueprint context.

Before ending substantial work, update:

- `docs/progress/CURRENT_STATE.md`
- `docs/progress/SESSION_LOG.md`
- `docs/progress/NEXT_ACTION.md`
- relevant feature status and blueprint traceability;
- learning notes;
- truthful build-in-public content evidence.

## Truthfulness

Distinguish:

- VERIFIED
- INFERRED
- UNVERIFIED
- NOT_IMPLEMENTED

Never fabricate progress, metrics, errors, feedback, research, or results.

# Claude Code Responsibilities for TWN

Read and follow `AGENTS.md`.

Claude Code is primarily responsible for:

- mechanically mapping and safely splitting `blueprint.md`;
- analyzing one bounded volume or chapter at a time;
- creating compact context summaries;
- finding cross-volume dependencies, contradictions, and missing decisions;
- producing cross-volume feature implementation packets;
- maintaining requirement traceability, decisions, roadmaps, learning notes,
  and build-in-public content evidence.

Do not implement application features unless Vanessa explicitly asks Claude
Code to do so.

Never load or claim to analyze the complete large blueprint in one pass when
the work was actually partial. Use scripts for mechanical splitting and
verification, then semantic analysis in bounded batches.
