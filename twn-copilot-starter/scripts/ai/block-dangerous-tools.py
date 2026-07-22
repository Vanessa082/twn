#!/usr/bin/env python3
import json
import re
import sys

data = json.load(sys.stdin)
text = json.dumps(data.get("tool_input", {}), ensure_ascii=False)

patterns = [
    r"\brm\s+-rf\b",
    r"\bgit\s+reset\s+--hard\b",
    r"\bgit\s+clean\s+-[a-zA-Z]*f",
    r"\bgit\s+push\s+.*--force\b",
    r"\bDROP\s+(TABLE|DATABASE|SCHEMA)\b",
    r"\bTRUNCATE\s+TABLE\b",
    r"\bDELETE\s+FROM\b(?!.*\bWHERE\b)",
    r"\bsupabase\s+db\s+reset\b",
    r"\bvercel\s+--prod\b",
]

for pattern in patterns:
    if re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL):
        print(json.dumps({
            "continue": True,
            "systemMessage": "Blocked a high-risk command. Vanessa must approve destructive database, Git, deployment, or filesystem operations explicitly.",
            "hookSpecificOutput": {
                "permissionDecision": "deny",
                "permissionDecisionReason": f"Matched high-risk pattern: {pattern}"
            }
        }))
        sys.exit(0)

print(json.dumps({"continue": True}))
