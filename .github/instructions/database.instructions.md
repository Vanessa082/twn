---
description: Database and Supabase rules for TWN
applyTo: "**/*.{sql,prisma}"
---

- Treat schema, migrations, RLS, permissions, and destructive SQL as high risk.
- Do not execute migrations or modify remote data without explicit approval.
- Every schema change needs purpose, migration, rollback, affected code,
  validation, indexes, ownership, authorization, and data-migration analysis.
- Apply least privilege and verify Row Level Security where Supabase is used.
- Never expose service-role keys, tokens, connection strings, or `.env` values.
- Prefer read-only inspection when auditing.
