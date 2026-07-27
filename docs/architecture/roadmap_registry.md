# TWN Blueprint Roadmap Registry

**Document Version**: 1.0
**Status**: Active
**Date**: 2026-07-24
**Authority**: TWN Product Governance (Vanessa)

---

## Purpose

This registry records the known and proposed volumes of the TWN Product Blueprint. It distinguishes between confirmed volumes (with documented titles and scope), volumes that exist in draft form, and volume numbers that have been reserved but not yet formally defined.

> **Important**: Only confirmed volumes should be used as implementation gates. Do not build features based on unconfirmed volume scope.

---

## Volume Status Definitions

| Status | Meaning |
|---|---|
| `Canonical` | Formally written, reviewed, and accepted as authoritative |
| `Draft` | Content exists but is not yet formally reviewed or accepted |
| `Proposed` | A placeholder volume number with an agreed subject but no written content |
| `Deferred` | Intentionally postponed — not relevant to the current phase |
| `Unconfirmed` | Volume number reserved but subject not yet agreed |

---

## Volume Registry

| Volume | Title | Status | Implementation Phase | Source of Authority |
|---|---|---|---|---|
| Volume 1 | Vision | Canonical | Foundational | `Blueprint.md` — confirmed |
| Volume 2 | Editorial Domain | Canonical | Phase 1/2 | `Blueprint.md` — confirmed |
| Volume 3 | Notebook Domain | Canonical | Phase 1/2 | `Blueprint.md` — confirmed |
| Volume 4 | Community Domain | Canonical | Phase 2 | `Blueprint.md` — confirmed |
| Volume 5 | Newsletter Domain | Canonical | Phase 2 | `Blueprint.md` — confirmed |
| Volume 6 | Search Domain | Canonical | Phase 2 | `Blueprint.md` — confirmed |
| Volume 7 | System Architecture | Canonical | Phase 2 | `Blueprint.md` — confirmed |
| Volume 8 | Database Architecture | Canonical | Phase 2 (Milestone 9.2) | `Blueprint.md` — confirmed |
| Volume 9 | API Architecture | Canonical | Phase 2 (Milestone 9.3) | `Blueprint.md` — confirmed |
| Volume 10 | Security Architecture | Canonical | Phase 2 (Milestone 9.4) | `Blueprint.md` — confirmed |
| Volume 11 | Editorial Governance | Canonical | Phase 2 (Milestone 9.5) | `Blueprint.md` — confirmed |
| Volume 12 | _Not yet confirmed_ | Unconfirmed | Unknown | No authoritative source found |
| Volume 13 | _Not yet confirmed_ | Unconfirmed | Unknown | No authoritative source found |
| Volume 14 | _Not yet confirmed_ | Unconfirmed | Unknown | No authoritative source found |
| Volume 15 | Observability and Analytics | Canonical | Phase 2 (Milestone 9.6) | `Blueprint.md` — confirmed |
| Volume 16 | _Not yet confirmed_ | Unconfirmed | Unknown | No authoritative source found |

---

## Notes on Unconfirmed Volumes

Volumes 12, 13, 14, and 16 appear in the blueprint numbering sequence but have not been found with confirmed titles or scope in the uploaded `Blueprint.md`. Their subjects must not be invented.

Reasonable subjects for future volumes may include (as proposals only, not confirmed):
- Deployment and Infrastructure
- Testing Strategy
- Privacy and Data Governance
- AI Integration
- Mentorship and Community Features
- Events and Content Distribution

These are speculative. No implementation work should reference them until they are formally written and accepted.

---

## Phase-to-Volume Mapping

| Phase | Governing Volumes |
|---|---|
| Phase 1 — Foundation | Volumes 1, 2, 3 |
| Phase 2 — Secure Editorial and Knowledge Foundation | Volumes 4, 5, 6, 7, 8, 9, 10, 11, 15 |
| Phase 3 and beyond | To be determined based on confirmed future volumes |

---

## Registry Maintenance

This document should be updated when:
- A new blueprint volume is formally written and accepted
- An unconfirmed volume's subject is agreed by TWN product governance
- A volume's status changes (e.g., from Draft to Canonical)
- An implementation phase is completed and its volumes are closed

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-24 | Vanessa | Initial registry — Phase 2 |
