# 02 — Repository Inventory

## Git state — VERIFIED

| Item                    | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| Branch                  | `main`                                                           |
| Tracking                | up-to-date with `origin/main`                                    |
| HEAD                    | `58ab2796b4697abfe3a563b12fd55dfc6565a54b` (`done with writing`) |
| Uncommitted app changes | None at audit start                                              |
| Untracked               | `docs/` (this audit pack)                                        |

Commands: `git status`, `git branch --show-current`, `git log -5 --oneline`.

**Policy followed:** no overwrite, revert, commit, push, or deploy.

## Package manager — VERIFIED

| Signal         | Evidence                                     |
| -------------- | -------------------------------------------- |
| Lockfile       | `pnpm-lock.yaml`                             |
| Workspace file | `pnpm-workspace.yaml` (build allowlist only) |
| pnpm version   | 10.8.0                                       |
| Node           | v22.22.0 (shell); Cursor helper also present |

Not npm/yarn/bun as primary (no `package-lock.json` / `yarn.lock` / `bun.lockb`).

## Package scripts — VERIFIED (`package.json`)

| Script       | Command                  |
| ------------ | ------------------------ |
| `dev`        | `next dev --turbopack`   |
| `build`      | `next build`             |
| `start`      | `next start`             |
| `lint`       | `biome check .`          |
| `lint:fix`   | `biome check --write .`  |
| `format`     | `biome format --write .` |
| `type-check` | `tsc --noEmit`           |

**Absent:** `test`, `test:e2e`, `db:migrate`, `db:seed` npm scripts (seed exists as `scripts/seed.js` only).

## Environment files — VERIFIED (names only)

| File                 | Role                                          |
| -------------------- | --------------------------------------------- |
| `.env.local`         | Present; local secrets (values not disclosed) |
| `.env.local.example` | Template                                      |

Keys present in both (names only):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NODE_ENV`

Validated at build via `src/lib/env.ts` (`@t3-oss/env-nextjs` + Zod).

## Size and principal directories — VERIFIED

| Path                            | Approx size         | Role                                                   |
| ------------------------------- | ------------------- | ------------------------------------------------------ |
| `.` (with deps)                 | ~947M               | Full checkout                                          |
| `.` excl. `node_modules`/`.git` | ~218M               | Includes `.next`                                       |
| `node_modules`                  | ~724M               | Dependencies present but incomplete (`resend` missing) |
| `.next`                         | ~214M               | Prior / failed build artifacts                         |
| `src`                           | ~748K / 84 files    | Application source                                     |
| `public`                        | ~260K               | Static assets                                          |
| `docs`                          | audit output        | Documentation                                          |
| `scripts/`                      | schema apply + seed | Ops helpers                                            |
| `.github/workflows/`            | keepalive only      | CI                                                     |
| `Blueprint.md`                  | ~3MB                | Master product blueprint (not modified)                |
| `AGENTS.md`                     | vision / phases     | Product intent                                         |

## Deployment configuration — VERIFIED / INFERRED

| Artifact                                   | Status                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `vercel.json`                              | Absent                                                                                                 |
| Docker                                     | Absent                                                                                                 |
| `.github/workflows/supabase-keepalive.yml` | Present — cron ping                                                                                    |
| Deploy host                                | INFERRED Vercel from hard-coded `https://twn-note.vercel.app` in `email.ts` and create-next-app README |

## Lint / type / build / test commands identified

- Type: `pnpm type-check`
- Lint: `pnpm lint` (Biome; `eslint.config.mjs` exists but Next build ignores ESLint)
- Build: `pnpm build`
- Test: **none configured**
