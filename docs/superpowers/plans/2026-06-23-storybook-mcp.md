# Storybook MCP + Auto-Story Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the Storybook MCP server and a PostToolUse hook that automatically generates a `.stories.tsx` file in a subprocess whenever a new component is written in `packages/ui/src/components/`.

**Architecture:** A `PostToolUse` hook on the `Write` tool detects new component files and spawns a `claude --print` subprocess to create the sibling story, keeping the main conversation context clean. The Storybook MCP is registered in `.mcp.json` so the subprocess can query existing stories for reference.

**Tech Stack:** Claude Code hooks (shell), Storybook MCP (`@storybook/mcp`), bash, Python 3 (JSON parsing)

## Global Constraints

- Monorepo root: `/Users/marco/Projects/mfranceschit/developer`
- Component pattern: `packages/ui/src/components/**/*.tsx` (excludes `*.stories.tsx`, `index.ts`, `index.tsx`)
- Storybook runs on `http://localhost:6006`
- No new npm packages — uses `npx` for MCP server
- Hook script must be idempotent: skip silently if story already exists

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `.mcp.json` | Registers Storybook MCP server for the project |
| Create | `.claude/settings.json` | Wires PostToolUse hook to the Write tool |
| Create | `.claude/hooks/create-story.sh` | Detection logic + subprocess spawn |

---

### Task 1: Add Storybook MCP to `.mcp.json`

**Files:**
- Create: `.mcp.json` (monorepo root)

**Interfaces:**
- Produces: `storybook` MCP server available to all Claude Code sessions in this project

- [ ] **Step 1: Create `.mcp.json`**

Create `/Users/marco/Projects/mfranceschit/developer/.mcp.json`:

```json
{
  "mcpServers": {
    "storybook": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@storybook/mcp", "--url", "http://localhost:6006"]
    }
  }
}
```

- [ ] **Step 2: Verify MCP is recognized by Claude Code**

With Storybook running (`pnpm storybook` inside `packages/ui`), open a new Claude Code session in the monorepo root and run:

```
/mcp
```

Expected: `storybook` appears in the list of connected MCP servers with status `connected`.

If Storybook is not running, the server will show as `error` — that's expected and handled by the hook script.

- [ ] **Step 3: Commit**

```bash
git add .mcp.json
git commit -m "chore(ui): add Storybook MCP server config"
```

---

### Task 2: Create the hook script

**Files:**
- Create: `.claude/hooks/create-story.sh`

**Interfaces:**
- Consumes: JSON payload on stdin from Claude Code's PostToolUse event — structure:
  ```json
  {
    "hook_event_name": "PostToolUse",
    "tool_name": "Write",
    "tool_input": {
      "file_path": "/absolute/path/to/Component.tsx",
      "content": "..."
    }
  }
  ```
- Produces: Sibling `.stories.tsx` file written to disk; one-line stdout message

- [ ] **Step 1: Create the hooks directory and script**

```bash
mkdir -p /Users/marco/Projects/mfranceschit/developer/.claude/hooks
```

Create `/Users/marco/Projects/mfranceschit/developer/.claude/hooks/create-story.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(python3 -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data.get('tool_input', {}).get('file_path', ''))
" <<< "$INPUT" 2>/dev/null || echo "")

[ -z "$FILE_PATH" ] && exit 0

# Must be inside packages/ui/src/components/
[[ "$FILE_PATH" != */packages/ui/src/components/* ]] && exit 0

# Must be a .tsx file
[[ "$FILE_PATH" != *.tsx ]] && exit 0

# Must not be a story, index, or test file
BASENAME=$(basename "$FILE_PATH")
[[ "$BASENAME" == *.stories.tsx ]] && exit 0
[[ "$BASENAME" == *.test.tsx ]] && exit 0
[[ "$BASENAME" == index.ts ]] && exit 0
[[ "$BASENAME" == index.tsx ]] && exit 0

STORY_PATH="${FILE_PATH%.tsx}.stories.tsx"

# Idempotent: bail if story already exists
[ -f "$STORY_PATH" ] && exit 0

COMPONENT_NAME=$(basename "$FILE_PATH" .tsx)

claude --print \
  "Create a Storybook story file for the component at $FILE_PATH. \
Write it to $STORY_PATH. \
Use the storybook MCP to read an existing story (e.g. packages/ui/src/components/Button/Button.stories.tsx) for structure, Meta typing, StoryObj typing, and export naming conventions. \
Mirror the same import style, meta shape, and story export pattern. \
If the MCP is unavailable, infer story variants from the component's props." \
  2>/dev/null

echo "Story created: $(basename "$STORY_PATH")"
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x /Users/marco/Projects/mfranceschit/developer/.claude/hooks/create-story.sh
```

- [ ] **Step 3: Dry-run the script manually to verify detection logic**

Run with a fake payload that matches a component:

```bash
echo '{"hook_event_name":"PostToolUse","tool_name":"Write","tool_input":{"file_path":"/Users/marco/Projects/mfranceschit/developer/packages/ui/src/components/Avatar/Avatar.tsx","content":""}}' \
  | bash /Users/marco/Projects/mfranceschit/developer/.claude/hooks/create-story.sh
```

Expected: Script runs (subprocess fires, or fails fast if Storybook isn't running). Do NOT run this against a file that already has a story — use a path that doesn't exist on disk yet.

Run with a payload that should be ignored (a story file):

```bash
echo '{"hook_event_name":"PostToolUse","tool_name":"Write","tool_input":{"file_path":"/Users/marco/Projects/mfranceschit/developer/packages/ui/src/components/Button/Button.stories.tsx","content":""}}' \
  | bash /Users/marco/Projects/mfranceschit/developer/.claude/hooks/create-story.sh
echo "Exit code: $?"
```

Expected: Exits silently with code 0. No output.

Run with a payload outside the component path:

```bash
echo '{"hook_event_name":"PostToolUse","tool_name":"Write","tool_input":{"file_path":"/Users/marco/Projects/mfranceschit/developer/apps/portfolio/src/pages/index.tsx","content":""}}' \
  | bash /Users/marco/Projects/mfranceschit/developer/.claude/hooks/create-story.sh
echo "Exit code: $?"
```

Expected: Exits silently with code 0. No output.

- [ ] **Step 4: Commit**

```bash
git add .claude/hooks/create-story.sh
git commit -m "chore(ui): add create-story hook script"
```

---

### Task 3: Wire the hook in `.claude/settings.json`

**Files:**
- Create: `.claude/settings.json`

**Interfaces:**
- Consumes: `.claude/hooks/create-story.sh` from Task 2
- Produces: Hook fires automatically on every `Write` tool call in Claude Code sessions for this project

- [ ] **Step 1: Create `.claude/settings.json`**

Create `/Users/marco/Projects/mfranceschit/developer/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/create-story.sh",
            "statusMessage": "Checking if story needed..."
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Verify hook is loaded**

In a Claude Code session (reload or open new session in this project), run:

```
/hooks
```

Expected: The `PostToolUse` hook for `Write` appears in the list pointing to `.claude/hooks/create-story.sh`.

- [ ] **Step 3: End-to-end smoke test**

Ask Claude Code to create a minimal new component — for example a `Badge` component stub:

```
Create a minimal Badge component at packages/ui/src/components/Badge/Badge.tsx with a single `label` string prop.
```

After Claude writes the file, verify:
1. The hook fires (`Checking if story needed...` spinner appears)
2. A `Badge.stories.tsx` is created at `packages/ui/src/components/Badge/`
3. The main conversation shows `Story created: Badge.stories.tsx`
4. The story file follows the same structure as `Button.stories.tsx` (Meta typing, StoryObj typing, named exports per variant)

- [ ] **Step 4: Commit**

```bash
git add .claude/settings.json
git commit -m "chore(ui): wire PostToolUse hook for auto story generation"
```
