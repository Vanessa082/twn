# TWN Month 4 Daily Content & Learning Guide (Days 91–120)

**Theme**: Submission Protection, Bot Traps & Moderation Workflows  
**Goal**: Master honeypot bot detection, rate limiting, duplicate prevention, editorial state machines, and moderation governance for community features.

---

## Day 92: The Honeypot Trap: Stopping Bots Without CAPTCHAs

### Technical Concept to Master
- **Concept**: Honeypot Form Traps & Frictionless Anti-Spam.
- **Plain Language**: Adding a hidden input field that real human users cannot see or fill out. Automated spam bots fill out every field they find in the HTML. If the hidden field has a value, it's a bot submission!
- **TWN Code Reference**: `src/lib/security/submission-protection.ts`.

### LinkedIn Post Template
```text
🤖 How to stop spam bots without forcing users to solve annoying CAPTCHAs:

When building community submission forms in TWN (Shared Pages & Margin Notes), I refused to use Google reCAPTCHA. CAPTCHAs ruin user experience and slow down page load.

Instead, we built a HONEYPOT TRAP.

How it works:
1. We add an HTML input field `hp_field` with `display: none` or off-screen CSS positioning.
2. Human users never see or fill out this field.
3. Automated spam scripts parse HTML and automatically populate every form field.
4. On submission, `isBotSubmission()` checks `if (input.hp_field)`.
5. If filled, the request is silently dropped or logged as a bot!

Zero friction for real users. 100% effective against basic spam bots.

#WebSecurity #UserExperience #TypeScript #NextJS #Frontend
```

### TikTok Video Script (45 Seconds)
- **Visual**: VS Code showing the honeypot field in React form JSX and the `isBotSubmission()` check.
- **Hook**: "How I caught spam bots using a hidden HTML trick!"
- **Script**:
  - *"Hate solving CAPTCHAs? So do your users!"*
  - *"Here is how I stop spam bots in TWN without CAPTCHAs."*
  - *"I add a hidden input field called `hp_field`."*
  - *"Humans can't see it, but spam bots fill out every input they find."*
  - *"If `hp_field` has text on submit—BAM! Bot detected!"*

---

## Day 98: Editorial Moderation State Machine (`pending` → `approved` | `rejected`)

### Technical Concept to Master
- **Concept**: State Machine Transition Predicates & Status Lifecycle.
- **Plain Language**: Managing content status transitions through explicit rules so content moves safely from submission to publication.
- **TWN Code Reference**: `src/lib/services/moderation-lifecycle.test.ts` & `src/types/index.ts`.

### LinkedIn Post Template
```text
How do you build a moderation state machine for user-generated content?

In TWN, reader reflections (Shared Pages) and annotations (Margin Notes) must pass through moderation before reaching public display.

Our state transitions follow strict invariants:

- `pending` (Default state on submission): Invisible to public users. Visible in Admin Moderation Queue.
- `approved`: Admin approves content → `status = 'approved'`, `published_at` timestamp set → becomes visible on public site.
- `rejected`: Admin rejects content → `status = 'rejected'`, `published_at` remains null → retained in DB for audit trail.

We write unit tests (`moderation-lifecycle.test.ts`) to verify that state transitions occur correctly and that `published_at` is set ONLY on approval.

State machines keep workflow logic predictable and bug-free!

#StateMachines #TypeScript #SoftwareEngineering #CMS #Testing
```

### TikTok Video Script
- **Visual**: Admin moderation dashboard showing "Approve" and "Reject" buttons, and the card transitioning smoothly.
- **Hook**: "How moderation queues work in production web apps."
- **Script**:
  - *"When a visitor submits a reflection on TWN, it enters the `pending` state."*
  - *"It is completely invisible to public users."*
  - *"Inside the Admin Moderation Queue, I can review, approve, or reject it."*
  - *"Only when approved does PostgreSQL set `published_at` and render it on the public site!"*

---

## Day 106: Editorial Governance Document Breakdown (`editorial_governance.md`)

### Technical Concept to Master
- **Concept**: Engineering & Moderation Governance Documentation.
- **Plain Language**: Writing a clear human policy document that guides moderators on how to evaluate submissions, manage AI content, and handle appeals.
- **TWN Code Reference**: `docs/governance/editorial_governance.md`.

### LinkedIn Post Template
```text
Software engineering isn't just about writing code—it's also about building governance systems.

In TWN, we created a formal 13-section `editorial_governance.md` document that defines:

1. Acceptance Criteria for Shared Pages (10–300 words, original, relevant to women in tech).
2. Rejection Reason Categories (`spam`, `off-topic`, `harmful`, `inauthentic`, `copied`, `incomplete`).
3. Archive vs. Deletion Policy (Reject keeps DB record for audit; Delete removes for legal/privacy risk).
4. AI Assistance & Disclosure Policy (Rules for AI copyediting vs fully synthetic content).
5. Contributor Privacy & Anonymous Submission Standards.

Building in public means holding your platform to professional, transparent standards!

#Governance #TechPolicy #WomenInTech #SoftwareEngineering #ProductManagement
```

### TikTok Video Script
- **Visual**: Scrolling through `docs/governance/editorial_governance.md`.
- **Hook**: "Why every software product needs an Editorial Governance policy."
- **Script**:
  - *"Code enforces the mechanics of moderation, but policy guides the human decision."*
  - *"In TWN, we wrote a complete Editorial Governance document."*
  - *"It covers rejection categories, AI content rules, and contributor privacy."*
  - *"Great engineering includes great documentation!"*

---

*(Days 107–120 continue with rate limiting algorithms, content deduplication, and pin ordering for margin notes...)*
