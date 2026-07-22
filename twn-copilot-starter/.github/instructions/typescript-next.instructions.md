---
description: TypeScript, React, and Next.js rules for TWN
applyTo: "**/*.{ts,tsx}"
---

- Preserve strict TypeScript. Do not add `any` to bypass errors.
- Prefer clear domain types and schema validation at trust boundaries.
- Respect the repository's existing Next.js routing and server/client split.
- Prefer Server Components unless interactivity requires a Client Component.
- Keep client bundles small and explain new client-side dependencies.
- Handle loading, empty, error, and unauthorized states explicitly.
- Use semantic HTML before ARIA.
- Ensure interactive controls are keyboard operable and visibly focused.
- Do not refactor unrelated modules while implementing a bounded feature.
- Add or update tests for material behavior.
