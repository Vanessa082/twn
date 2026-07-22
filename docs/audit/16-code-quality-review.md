# 16 — Code Quality Review

## Strengths — VERIFIED

- Clear service layer under `src/lib/services`
- Shared types in `src/types/index.ts`
- Env fail-fast with Zod
- Educational comments in several files (learning contract alignment)
- Biome configured; TypeScript `strict: true`

## Issues — VERIFIED / INFERRED

| Issue | Evidence |
|-------|----------|
| Files >300 lines | `NotebookEntriesManager.tsx` 452, `NotebookSketch.tsx` 396, `ArticleForm.tsx` 318 |
| `any` usage | Biome warnings in margin-notes, shared-pages, notebook-entries-admin |
| Non-null assertions | Admin UI + health route |
| Format drift | Lint errors on formatting |
| Dead code | `CategoryCards.tsx`, `db/client.ts` |
| Duplication | Hardcoded categories in multiple files; email templates large inline HTML |
| Domain Zod missing | Ad-hoc validation |
| Server/client separation leak | Footer client imports server action that pulls heavy email stack |
| `components.json` without shadcn components | Misleading scaffolding |
| README still create-next-app boilerplate | Docs quality weak for ops |
| Inter as primary sans | Conflicts with some design guidance preferring non-default stacks (product choice, not a functional bug) |

## Maintainability verdict

Architecture is directionally good for Phase 1–2 size, but **install fragility**, **authZ gaps**, **no tests**, and **a few oversized components** are the main quality risks.
