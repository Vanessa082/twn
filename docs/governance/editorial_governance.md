# TWN Editorial and Moderation Governance

**Document Version**: 1.0
**Status**: Canonical — Phase 2
**Date**: 2026-07-24
**Authority**: TWN Editorial Team (Vanessa)

---

## Purpose

This document defines the editorial and moderation standards governing all user-generated content published on The Notebook of a Tech Woman. It exists to ensure consistent, fair, and transparent moderation decisions, and to make those standards available to contributors.

Moderation tools implement the mechanics. This document defines the human rules that guide their use.

---

## 1. Shared Page Acceptance Criteria

Shared Pages are short visitor-submitted reflections (10–300 words) that appear in the Community section of TWN.

### Approve if all of the following are true

- The submission is written in good faith
- The content is relevant to technology, learning, career, reflection, or the experience of being a woman in tech
- The writing is original (not copied from another source)
- The length is between 10 and 300 words
- The content does not violate any rejection criteria listed below
- The contributor name is not offensive or impersonating

### Reject if any of the following are true

- The content is spam, promotional, or contains affiliate links
- The content is abusive, hateful, or discriminatory
- The content contains sexual or violent content
- The content is completely unrelated to TWN's subject matter
- The content is clearly AI-generated without any human editing or reflection
- The content copies another published work without attribution
- The content contains false claims presented as fact
- The submission appears to be a test submission with no real content

---

## 2. Margin Note Acceptance Criteria

Margin Notes are short reader annotations (up to 120 characters) displayed alongside specific articles.

### Approve if

- The note is related to the article it was submitted on
- The note adds a genuine reflection, question, or response
- The note is respectful in tone
- The note is within 120 characters

### Reject if

- The note is a general comment with no relationship to the article
- The note is abusive, dismissive, or harmful
- The note is promotional or spam
- The note contains personally identifying information that should not be public

---

## 3. Rejection Reason Categories

When rejecting content, admins should internally note one of these categories for the audit record:

| Category | Description |
|---|---|
| `spam` | Promotional content, repeated submissions, bot-like behaviour |
| `off-topic` | No connection to TWN's subject matter |
| `harmful` | Abusive, hateful, or dangerous content |
| `inauthentic` | Fully AI-generated without human reflection |
| `copied` | Copied from another source without attribution |
| `incomplete` | Too short or clearly a test submission |
| `other` | Explain in the audit detail field |

---

## 4. Archive Versus Deletion

**Reject**: The content is retained in the database with `status = 'rejected'`. It is not publicly visible. The record is kept for moderation audit purposes.

**Delete**: The content record is permanently removed from the database. This should be used for:
- Content that poses a legal risk
- Content containing private personal data that should not be retained
- Clearly abusive content that should not appear in any audit reports

Preference is to reject rather than delete, so that moderation history is preserved.

---

## 5. Correction Policy

If an approved Shared Page contains a factual error brought to TWN's attention:

1. The admin reviews the concern
2. If the error is material and verifiable, the Shared Page status may be reset to `rejected`
3. A note is added to the audit log referencing the correction reason
4. If the contributor can be contacted, they may resubmit a corrected version

TWN does not edit submitted content on behalf of contributors.

---

## 6. Article Revision Policy

Articles are written by TWN's editorial team. Corrections to published articles follow this process:

1. Create a revision snapshot before making any changes
2. Apply the correction
3. Note the nature of the correction in the revision description
4. If the correction is significant (factual error, not just a typo), add a correction notice at the top or bottom of the article

Revisions are stored automatically by the CMS on every article save. Up to 20 revision snapshots are retained per article.

---

## 7. AI Assistance and Disclosure Policy

TWN's editorial team may use AI tools for drafting, research assistance, or copyediting. The following rules apply:

- Any article substantially drafted by AI must include an AI disclosure at the end
- Community submissions that are clearly fully AI-generated (lacking a personal perspective or reflection) should be rejected under the `inauthentic` category
- Light AI editing assistance (grammar, clarity) does not require disclosure

For community submissions, there is currently no automated AI detection. Moderation is based on editorial judgement about whether a submission contains genuine personal reflection.

---

## 8. Plagiarism and Copied Content

- Community submissions that are word-for-word copies of publicly available content are rejected under the `copied` category
- Brief quotations with attribution to the original source are acceptable within Shared Pages
- Articles produced by TWN's editorial team must not reproduce substantial portions of other published works without permission and attribution

---

## 9. Anonymous Submission Policy

Both Shared Pages and Margin Notes can be submitted with any contributor name, including "Anonymous". TWN does not require identity verification for community contributions.

This means:
- Moderation is content-based, not identity-based
- Anonymous submissions are held to the same acceptance standards as named submissions
- TWN does not publish IP addresses or other identifying information alongside community content

---

## 10. Appeal and Escalation

In Phase 2, there is no self-service appeal mechanism. Contributors who believe their content was incorrectly rejected may contact TWN through the contact form.

The editorial team will review appeals within a reasonable time. The original moderator's decision stands unless there is clear evidence of an error in applying these guidelines.

---

## 11. Contributor Privacy

- Community content is published with the contributor-provided name only
- No other personal information is displayed publicly
- Submitted content is stored in the TWN database and is not shared with third parties
- Rejected content is retained for audit purposes but is not published

---

## 12. Moderation Audit Requirements

Every moderation action (approve, reject, delete) must be recorded in the system audit log with:

- The moderator's admin user ID
- The action taken
- The target content type and ID
- A timestamp

The audit log is append-only. Moderators cannot edit past audit records.

Policy changes that affect moderation standards should reference the governance document version in use at the time of the decision.

---

## 13. Policy Versioning

This document is versioned. The version active at the time of a moderation decision is the governing standard.

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-07-24 | Vanessa | Initial policy — Phase 2 |
