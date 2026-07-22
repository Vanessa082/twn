# 11 — Bug Register

Severities: CRITICAL · HIGH · MEDIUM · LOW  
Only list items with evidence. Theoretical risks without reproduction are marked confidence accordingly and not claimed as reproduced UI bugs.

---

### BUG-001 — Missing `resend` package breaks app
- **Severity:** CRITICAL  
- **Confidence:** HIGH  
- **Subsystem:** Email / global layout  
- **Repro:** Ensure `node_modules/resend` absent; run `pnpm type-check` or `pnpm build` or `pnpm dev` then GET `/`  
- **Expected:** App compiles; pages return 200  
- **Actual:** TS2307 / webpack module not found; HTML routes HTTP 500  
- **Evidence:** Command outputs Stage 6; curl Stage 7  
- **Cause:** Declared dependency not linked in install tree  
- **Files:** `package.json`, `src/lib/services/email.ts`, lockfile  
- **Reproduced:** YES  
- **Next:** Approve `pnpm install`; verify `node_modules/resend`; re-run type-check/build/dev  

### BUG-002 — Footer newsletter import takes down all pages
- **Severity:** CRITICAL  
- **Confidence:** HIGH  
- **Subsystem:** Layout / newsletter  
- **Repro:** With BUG-001 present, request `/about` (no direct email usage)  
- **Expected:** About renders even if newsletter backend broken  
- **Actual:** 500 with same `resend` error  
- **Evidence:** curl `/about` 500; `Footer.tsx` imports `subscribeAction`  
- **Cause:** Hard import of Server Action that transitively loads `email.ts` from root layout Footer  
- **Files:** `src/components/layout/Footer.tsx`, `actions/newsletter.ts`, `services/subscribers.ts`, `services/email.ts`  
- **Reproduced:** YES  
- **Next:** Decouple Footer from email module when flag off; lazy/dynamic import; or ensure dep always installed  

### BUG-003 — Newsletter feature flag does not protect import graph
- **Severity:** HIGH  
- **Confidence:** HIGH  
- **Subsystem:** Feature flags  
- **Repro:** Read `NewsletterSection.tsx` / `Footer.tsx` — both import `subscribeAction` at top level regardless of `NEWSLETTER_ENABLED`  
- **Expected:** Disabled feature does not load Resend client module  
- **Actual:** Flag only swaps UI in NewsletterSection; Footer still shows subscribe + always imports action  
- **Evidence:** source  
- **Cause:** Static imports + Footer not gated  
- **Reproduced:** YES (code + runtime)  
- **Next:** Conditional import / split components  

### BUG-004 — Admin routes lack role authorization
- **Severity:** HIGH  
- **Confidence:** MEDIUM (code-verified; not exploit-tested)  
- **Subsystem:** AuthZ  
- **Repro (code):** Any Clerk-signed-in user passes `auth.protect()`; actions call `createAdminClient()` without `auth()`  
- **Expected:** Only allowlisted admin identities can mutate  
- **Actual:** Sign-in sufficient for UI; actions appear unprotected at function level  
- **Evidence:** `middleware.ts`, `actions/articles.ts`, etc.  
- **Reproduced:** Code inspection only (no second Clerk user tested) — mark **not fully exploit-reproduced**  
- **Next:** Org/role claim check in middleware + every admin action  

### BUG-005 — Today's Page never empty when DB healthy but undated
- **Severity:** MEDIUM  
- **Confidence:** HIGH  
- **Subsystem:** Notebook  
- **Repro (code):** `getTodaysEntry` returns FALLBACK `fe7` when `data` is null  
- **Expected:** Hide section or show intentional empty state when no entry for today  
- **Actual:** Always populate with fallback text  
- **Evidence:** `notebook-entries.ts` L211–215  
- **Reproduced:** Code path YES; browser NO  
- **Next:** Distinguish error fallback vs empty  

### BUG-006 — Shared pages lack dedicated reading route
- **Severity:** MEDIUM (product defect vs AGENTS.md)  
- **Confidence:** HIGH  
- **Subsystem:** Community  
- **Expected:** Preview → `/pages/...` full page  
- **Actual:** Full text in carousel cards; no detail route  
- **Evidence:** route inventory; `SharedPagesSection.tsx`  
- **Reproduced:** Source YES  
- **Next:** Implement detail route + preview truncation  

### BUG-007 — Unsanitized HTML article content
- **Severity:** HIGH  
- **Confidence:** MEDIUM  
- **Subsystem:** Articles XSS  
- **Evidence:** `dangerouslySetInnerHTML` on `article.content` in `articles/[slug]/page.tsx`  
- **Expected:** Sanitized HTML or Markdown pipeline  
- **Actual:** Raw HTML from DB (admin-controlled today)  
- **Reproduced:** Source YES; XSS not actively exploited  
- **Next:** Sanitize (e.g. DOMPurify server-side) or restrict editor  

### BUG-008 — Privacy/Terms links are placeholders
- **Severity:** LOW  
- **Confidence:** HIGH  
- **Evidence:** `Footer.tsx` infoLinks Privacy → `/about`  
- **Reproduced:** Source YES  

### BUG-009 — Lint fails on clean tree
- **Severity:** LOW  
- **Confidence:** HIGH  
- **Evidence:** `pnpm lint` exit 1 — format errors + warnings  
- **Reproduced:** YES  

### BUG-010 — Site URL / brand domain inconsistency
- **Severity:** LOW  
- **Confidence:** HIGH  
- **Evidence:** `layout.tsx` metadataBase `twnotebook.com`; `email.ts` `twn-note.vercel.app`; env default `twnotebook.com`  
- **Reproduced:** Source YES  

---

Theoretical concerns (not separate reproduced bugs): open INSERT RLS spam, rate limiting absence, Cloudinary secrets required but unused — see security/debt registers.
