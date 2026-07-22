# 14 — Performance Review

**Runtime performance profiling: largely UNVERIFIED** (pages 500). Health latency ~1.1s to Supabase from this network — VERIFIED once.

## Source / config observations — VERIFIED

| Topic | Observation |
|-------|-------------|
| ISR | `revalidate = 60` on home/articles — reduces origin load |
| Fonts | `next/font` self-host Inter/Playfair/Cormorant |
| Images | `next/image` + Cloudinary URL transforms in `ImageWithSkeleton` |
| Search | Loads up to 100 articles then filters client-side — scales poorly |
| Ambient JS | Custom cursor, reading line, page wipe, timeline — extra client JS on all pages |
| Fallbacks | Soften DB outages but may hide perf/DB issues |
| Bundle risk | Footer → newsletter → subscribers → email pulls email stack into client-related action graph |

## Risks — INFERRED

1. Global ambient effects on every route may hurt low-end mobile Main Thread.
2. Unbounded shared_pages select (no pagination) as community grows.
3. Admin lists — pagination unknown / UNVERIFIED.
4. No CDN/image strategy beyond Cloudinary URLs + Next optimizer.
5. No React cache/`unstable_cache` patterns observed beyond ISR.

## Not measured

- LCP/CLS/INP, bundle sizes, Lighthouse — blocked by 500s.
