# Media Module

## Purpose
Manages all media uploads for TWN. In Phase 2, this means Cloudinary image uploads for article cover images. The module defines a clean upload interface so the Cloudinary provider can be replaced or supplemented without touching any editorial business logic.

## Owned Capabilities
- Image upload to Cloudinary
- Upload URL and asset ID management
- MIME type and file size validation
- Cloudinary URL optimization for display

## Owned Tables
None. Media assets are stored externally (Cloudinary) and referenced by URL in other modules' tables (e.g., `articles.cover_image`).

## Architecture
```text
Admin Upload UI
    ↓
uploadImageAction (thin Server Action)
    ↓
MediaUploadPort (interface)
    ↓
CloudinaryAdapter (infrastructure)
    ↓
Cloudinary API
```

## Public Commands
- `uploadImage(file)` → validates and uploads an image, returns the Cloudinary public URL

## Public Queries
None. Media references are stored and queried by the owning module (e.g., Editorial).

## Published Contracts
- `MediaUploadPort`: interface defining `upload(file): Promise<{ url: string; publicId: string }>`
- See `contracts/index.ts`

## Consumed Contracts
- `IdentityPort` (Identity): verifies uploader is an authorized administrator

## Routes
- `/api/upload` — server endpoint for image upload (admin only)

## Permissions
- All upload operations require admin authorization
- Public read of Cloudinary-hosted URLs requires no authentication (CDN-served)

## Events
- `media.uploaded` (logged to Platform/Audit on success)

## Forbidden Dependencies
- Must not import from `@/modules/editorial` or any content module
- Cloudinary SDK must only appear in `media/infrastructure/cloudinary-adapter.ts`
- Must not expose raw Cloudinary credentials to the application or presentation layer

## Known Limitations
- Only image uploads are supported — no video, PDF, or document uploads
- No automatic image deletion when an article is deleted (Cloudinary orphan accumulation)
- No media library management UI — images are uploaded per-article, not catalogued centrally
- Upload size limit is enforced at the Next.js Route Handler level, not in the domain layer
