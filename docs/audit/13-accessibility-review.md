# 13 — Accessibility Review

**Browser a11y testing: UNVERIFIED** (no interactive browser; pages 500).

## Source observations — VERIFIED (code)

### Strengths
- Navbar: `aria-label="Primary navigation"`, mobile `aria-expanded`, search `aria-label`
- Hero typewriter: `aria-live="polite"`
- Decorative UI (`CustomCursor`, `ReadingLine`, `PageTransition`, ink lines): `aria-hidden`
- Shared pages modal: `role="dialog"`, `aria-modal`, close `aria-label`
- Many sections have `aria-label` (Today's Page, Featured, Newsletter, Browse by Topic)
- Images in cards use `alt={article.title}` in several places

### Gaps / risks — INFERRED
- Biome a11y rules largely **disabled** (`useButtonType`, `useKeyWithClickEvents`, `useSemanticElements`, etc. off in `biome.json`) — reduces automated catch
- Modal backdrop `onClick` without keyboard equivalent (rule disabled)
- Custom cursor may confuse users who rely on system pointer cues (decorative but visual noise)
- Footer subscribe still present while newsletter “Coming Soon” elsewhere — inconsistent affordances
- No skip-to-content link observed in root layout
- Focus management on modal open/close UNVERIFIED
- Color contrast UNVERIFIED (warm editorial palette in CSS)
- Article HTML content a11y depends on author markup quality

## Verdict

Cannot certify WCAG compliance. Code shows intentional ARIA in several places, but **no browser verification** and several a11y linters are turned off.
