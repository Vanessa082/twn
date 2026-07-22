# TWN GitHub Copilot Setup

## Install this folder

Copy the contents of this starter into the root of the TWN repository. Review
all files before committing them.

## Keep

- Root `AGENTS.md` as the main shared constitution.
- Root `CLAUDE.md` as a short Claude-specific responsibility file.
- `.github/copilot-instructions.md` as a concise Copilot pointer.
- Scoped instructions, agents, skills, prompts, and hooks under `.github/`.

Avoid copying the full constitution into several always-on files. VS Code
combines instruction files and does not guarantee an order, so duplicated or
conflicting rules waste context.

## Recommended active custom agents

1. TWN Blueprint Architect
2. TWN Feature Planner
3. TWN Implementation Mentor
4. TWN Quality Reviewer
5. TWN Session Historian
6. TWN Content Strategist

Use the built-in Explore agent for quick read-only repository discovery.

## Existing skills shown in the screenshot

Keep:
- `find-skills`
- `supabase-postgres-best-practices` if TWN actually uses Supabase/Postgres.

Extension-contributed Pylance skills are for Python and are not relevant to a
TypeScript/Next.js TWN workflow unless Python scripts become substantial.

## MCP recommendation

Use the smallest tool set:
- GitHub MCP: useful for issues and pull requests; VS Code/Copilot may already
  provide GitHub capabilities.
- Playwright MCP: add later for structured browser verification.
- Supabase MCP: use only when needed, restrict it to the development project,
  and prefer read-only mode during audits.

Disable the Pylance MCP server for this workspace if TWN is not a Python
project. GitKraken MCP is optional and duplicates some Git/GitHub abilities.

Never attach production database credentials to an unrestricted agent.

## Plugins

Install no broad plugin bundle initially. Plugins can add agents, skills,
hooks, and MCP servers together, which makes behavior harder to audit. Add a
plugin only after reviewing its manifest and every bundled customization.

## Hooks

The included security hook blocks a few destructive commands. Review it before
enabling it. Do not use automatic full-project formatting or testing after every
tool use.

## First commands in Copilot Chat

1. Run `/twn-start-session`.
2. Use the TWN Blueprint Architect for blueprint work.
3. Use `/twn-plan-feature feature=<name>` to prepare a cross-volume packet.
4. Use `/twn-implement-task task=<ID>` only after approval.
5. Use `/twn-review-change`.
6. Use `/twn-finish-session`.
7. Use `/twn-extract-content`.

## Diagnostics

Open Copilot Chat, right-click the Chat view, and select Diagnostics to verify
that agents, prompts, instructions, skills, and hooks loaded without errors.
