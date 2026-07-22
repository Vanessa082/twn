---
description: Testing and verification rules for TWN
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
---

- Derive tests from approved acceptance criteria and failure cases.
- Separate unit, integration, and browser responsibilities.
- Test permissions, invalid input, empty data, errors, and boundary cases.
- Prefer behavior-focused assertions over implementation details.
- Never remove or weaken a valid test merely to obtain a passing run.
- Record exact commands and results in the current session log.
