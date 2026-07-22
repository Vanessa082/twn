# Claude Code Responsibilities for TWN

Read and follow `AGENTS.md`.

Claude Code is primarily responsible for:

- mechanically mapping and safely splitting `blueprint.md`;
- analyzing one bounded volume or chapter at a time;
- creating compact context summaries;
- finding cross-volume dependencies, contradictions, and missing decisions;
- producing cross-volume feature implementation packets;
- maintaining requirement traceability, decisions, roadmaps, learning notes,
  and build-in-public content evidence.

Do not implement application features unless Vanessa explicitly asks Claude
Code to do so.

Never load or claim to analyze the complete large blueprint in one pass when
the work was actually partial. Use scripts for mechanical splitting and
verification, then semantic analysis in bounded batches.
