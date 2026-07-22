# 19 — Open Questions

| ID | Question | Why it matters | How to answer |
|----|----------|----------------|---------------|
| Q-01 | Does production Vercel install `resend` correctly? | Local may be uniquely broken | Check Vercel build logs / `pnpm install` locally |
| Q-02 | Which Clerk users are intended admins? | AuthZ design | Vanessa decision + Clerk org/roles |
| Q-03 | Is Supabase keepalive GH secret configured? | Free-tier pause | GitHub Actions secrets UI |
| Q-04 | Should Shared Pages show full text in cards or truncate? | Product vs AGENTS | Product decision |
| Q-05 | Article body: HTML vs Markdown long-term? | XSS + editor UX | Architecture decision |
| Q-06 | Keep or drop `categories` table? | Schema cleanup | Align UI to FK or delete table |
| Q-07 | Canonical domain: `twnotebook.com` vs `twn-note.vercel.app`? | SEO/email links | DNS + env |
| Q-08 | When enable `NEWSLETTER_ENABLED`? | Domain verification | Resend domains |
| Q-09 | Are fallback articles acceptable in production outages? | Editorial trust | Policy |
| Q-10 | Is Cloudinary upload in scope for Phase 2 media library? | Env secrets today unused | Feature packet |
| Q-11 | Antigravity browser re-audit schedule? | Close UNVERIFIED UI | After install fix |
| Q-12 | Word count rule 10–300 vs 150–300? | Spec conflict | Align AGENTS / feature packets |
| Q-13 | Should Footer newsletter respect feature flag? | Consistency | Product |
| Q-14 | Multi-locale beyond `en`? | next-intl present | Roadmap |
