# TWN Month 5 Daily Content & Learning Guide (Days 121–150)

**Theme**: Operational Observability, Logging, Tracing & Error Classification  
**Goal**: Master production structured JSON logging, correlation IDs via `AsyncLocalStorage`, automatic PII/secret redaction, custom error taxonomy, and multi-content search.

---

## Day 122: Structured JSON Logging: Why `console.log` Fails in Production

### Technical Concept to Master
- **Concept**: Structured Logging vs Unstructured Console Output.
- **Plain Language**: Unstructured strings like `console.log("Error uploading image")` are impossible for log monitoring tools (Datadog, CloudWatch) to search or index. Structured JSON logs format log entries as machine-readable JSON objects with metadata.
- **TWN Code Reference**: `src/lib/observability/logger.ts`.

### LinkedIn Post Template
```text
Stop using plain `console.log("Something failed")` in production Next.js apps!

When an error happens in production, a plain string doesn't tell you:
- Which request triggered it?
- Which user/actor was involved?
- Which module failed?
- What was the classified error type?

In TWN, we built a custom structured logger (`src/lib/observability/logger.ts`):

`logger.error("cloudinary.upload.failed", err, { articleId });`

Outputs machine-readable JSON:
```json
{
  "level": "error",
  "event": "cloudinary.upload.failed",
  "correlationId": "req_8f9a2b1c",
  "timestamp": "2026-07-24T14:00:00Z",
  "meta": { "articleId": "art_101" },
  "error": { "type": "INFRASTRUCTURE", "message": "API timeout" }
}
```

Machine-readable logs make production debugging 10x faster!

#Observability #Logging #NodeJS #NextJS #TypeScript #DevOps
```

### TikTok Video Script (45 Seconds)
- **Visual**: Comparing messy `console.log` lines vs structured JSON output in terminal.
- **Hook**: "Why professional developers don't use plain console.log!"
- **Script**:
  - *"Still using `console.log` in production?"*
  - *"In TWN, we use a structured JSON logger."*
  - *"Every log entry automatically includes the timestamp, event name, correlation ID, and classified error type."*
  - *"Log monitoring tools can parse JSON instantly!"*

---

## Day 123: Request Correlation IDs with `AsyncLocalStorage`

### Technical Concept to Master
- **Concept**: Distributed Tracing & Request Context Propagation.
- **Plain Language**: Assigning a unique ID (`correlationId`) to an incoming request and passing it through every function call in Node.js without manually forwarding it as an argument everywhere.
- **TWN Code Reference**: `src/lib/observability/correlation.ts`.

### LinkedIn Post Template
```text
How do you trace a single user request across 10 nested function calls in Node.js / Next.js without passing `correlationId` as a function parameter everywhere?

Answer: Node.js `AsyncLocalStorage`!

In TWN (`src/lib/observability/correlation.ts`), we create an async context store:

```typescript
import { AsyncLocalStorage } from "node:async_hooks";
export const contextStorage = new AsyncLocalStorage<OperationContext>();
```

When a request enters the server, `runWithContext()` generates a unique `randomUUID()`.

Inside any nested service or logger call, `getCorrelationId()` retrieves the exact correlation ID for the active request!

Now, searching one correlation ID in our logs shows the complete request execution story from entry to exit.

#NodeJS #Backend #NextJS #TypeScript #SoftwareEngineering
```

### TikTok Video Script
- **Visual**: Diagram showing a request entering Next.js, getting a UUID, and `AsyncLocalStorage` passing it to 3 background functions automatically.
- **Hook**: "The coolest Node.js feature you're not using yet!"
- **Script**:
  - *"How do you trace a bug through 10 nested functions in Next.js?"*
  - *"Node.js `AsyncLocalStorage`!"*
  - *"It attaches a correlation ID to the execution context automatically."*
  - *"No need to pass `correlationId` into every function call!"*

---

## Day 128: Automatic PII & Secret Redaction (`redact.ts`)

### Technical Concept to Master
- **Concept**: Log Data Sanitization & PII/Credential Protection.
- **Plain Language**: Automatically scanning logged objects to mask sensitive fields like passwords, tokens, emails, and draft content before emitting logs.
- **TWN Code Reference**: `src/lib/observability/redact.ts`.

### LinkedIn Post Template
```text
🔒 Logging sensitive data (passwords, tokens, subscriber emails) to log files is a major security and compliance violation.

In TWN, our logger NEVER logs raw sensitive payloads.

We built an automatic recursive redaction filter (`src/lib/observability/redact.ts`):

Sensitive key patterns: `secret`, `token`, `password`, `email`, `draft`, `authorization`.

If a meta payload contains `{ email: "user@example.com", token: "secret_123" }`, `redactObject()` automatically transforms it to:

`{ email: "[REDACTED]", token: "[REDACTED]" }`

Security by default means building safeguards directly into your core infrastructure!

#CyberSecurity #DataPrivacy #GDPR #TypeScript #Observability
```

### TikTok Video Script
- **Visual**: VS Code showing `redact.ts` converting sensitive keys to `"[REDACTED]"`.
- **Hook**: "Never log passwords or emails in Next.js!"
- **Script**:
  - *"Logging user emails or tokens by accident is a huge security risk."*
  - *"In TWN, `redact.ts` scans every logged object recursively."*
  - *"If a key contains 'password', 'token', or 'email', it automatically replaces it with REDACTED."*
  - *"Keep your production logs secure!"*

---

*(Days 129–150 continue with error taxonomy (`BusinessRuleError` vs `InfrastructureError`), health checks, and multi-content search aggregation...)*
