# TWN hooks

`security.json` blocks a small set of obviously destructive commands before a
tool runs. Hooks are guardrails, not a complete security system.

Do not add a hook that runs the entire test suite after every edit. That wastes
time and AI credits. Use the finish-session prompt or a bounded agent-scoped
validation workflow instead.

Review the Python script before enabling the hook. The hook format is still a
preview feature in VS Code.
