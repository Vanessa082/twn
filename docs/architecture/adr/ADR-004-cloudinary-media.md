# ADR-004: Use Cloudinary for Media Storage

- **Status**: Accepted
- **Date**: 2026-07-24
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 7 — System Architecture

---

## Context

TWN articles require cover images. Images cannot be stored in the Supabase database (too large), and self-hosting a media server introduces infrastructure complexity.

A cloud media provider was needed that:
- Accepts image uploads via API
- Serves images via CDN
- Supports on-the-fly image transformation (resize, format conversion, quality optimization)
- Has a usable free tier for a solo project

---

## Decision

Use **Cloudinary** for all article cover image uploads and serving.

Cloudinary is wrapped behind the `Media` module's `MediaUploadPort` interface. No code outside `media/infrastructure/cloudinary-adapter.ts` imports the Cloudinary SDK.

Images are optimized at display time using Cloudinary's URL transformation parameters (`f_auto`, `q_auto:good`, `w_<n>`, `c_fill`), applied inside `ImageWithSkeleton.tsx`.

---

## Alternatives Considered

**Supabase Storage**: Native to the existing infrastructure stack. But lacks built-in image transformation and CDN optimization at the tier available. Would require a separate optimization layer.

**Vercel Blob**: Simple integration with Vercel deployments. No image transformation support. Limited to Vercel's platform.

**AWS S3 + CloudFront**: Maximum flexibility and industry standard. High operational complexity for a solo project. Requires managing IAM policies, bucket policies, CloudFront distributions, and signed URLs.

**Self-hosted (local filesystem)**: Not viable for a cloud-deployed Next.js application.

---

## Consequences

### Positive consequences
- Automatic CDN delivery with global edge caching
- On-the-fly transformation: WebP/AVIF format selection, quality control, responsive resizing
- `ImageWithSkeleton.tsx` uses Cloudinary transforms to eliminate layout shift (CLS)
- Free tier sufficient for Phase 2 content volume

### Negative consequences
- Vendor dependency: changing providers requires updating all stored image URLs
- No automatic cleanup: deleted articles leave orphan Cloudinary assets
- Upload credentials must be kept strictly server-side

---

## Security and Privacy Implications
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are server-only environment variables
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is safe to expose (identifies the cloud, not the secret)
- Upload Route Handler validates MIME type and file size before sending to Cloudinary
- All admin upload operations require `requireAdmin()` authorization

---

## Operational Implications
- Cloudinary asset management is done through the Cloudinary dashboard
- No automated asset cleanup on article deletion — periodic manual review recommended

---

## Migration Implications
Replacing Cloudinary requires:
1. Implementing a new adapter satisfying `MediaUploadPort` in `media/contracts/index.ts`
2. Updating `media/infrastructure/` only
3. Migrating existing image URLs in the `articles.cover_image` column to new provider URLs

---

## Review Conditions

This decision should be reconsidered when:
- Cloudinary pricing changes materially relative to TWN's image volume
- A media library management feature is required that Cloudinary cannot support
- An alternative provider offers superior image optimization with simpler migration

---

## Supersedes / Superseded By
None.
