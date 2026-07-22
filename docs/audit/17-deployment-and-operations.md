# 17 — Deployment and Operations

## Observed — VERIFIED / INFERRED

| Item | Status |
|------|--------|
| Likely host | Vercel (`twn-note.vercel.app` in email service) — INFERRED |
| `vercel.json` | Absent |
| Docker | Absent |
| CI build/lint/type-check | Absent |
| GitHub Action | Supabase keepalive cron every 3 days |
| Schema deploy | Manual SQL Editor / `scripts/apply-schema*.mjs` |
| Seed | `scripts/seed.js` |
| Health | `/api/health` works against live Supabase from this environment |
| Env | Required secrets via `.env.local` / host env |

## Operational risks

1. Free-tier Supabase pause mitigated only if GH secrets configured correctly — **UNVERIFIED** whether secrets exist on remote.  
2. No migration history → hard to reproduce DB across environments.  
3. Incomplete `node_modules` on this machine → local != deploy; production may work if Vercel install succeeded there — **UNVERIFIED**.  
4. Domain mismatch (`twnotebook.com` vs vercel.app).  
5. Newsletter intentionally off until custom domain verified (documented in feature flag).  
6. Keepalive hits REST root, not necessarily `/api/health` — comment in health route claims GH Actions use; workflow file pings Supabase REST directly.

## Docs

Root `README.md` is still default create-next-app text — insufficient runbook.
