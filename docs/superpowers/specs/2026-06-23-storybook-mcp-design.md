# Storybook MCP + Auto-Story Hook

**Date:** 2026-06-23  
**Branch:** `chore/storybook-mcp-config`  
**Scope:** `packages/ui`

## Goal

Automatically generate a `.stories.tsx` file whenever a new component is written in `packages/ui/src/components/`. Claude Code uses the Storybook MCP to reference existing stories for consistent structure and naming. Story creation runs in a subprocess to keep the main conversation context clean.

## Architecture

Three pieces, each with a single responsibility:

| Artifact | Location | Purpose |
|---|---|---|
| MCP server config | `.mcp.json` (monorepo root) | Gives Claude access to running Storybook |
| Hook config | `.claude/settings.json` | Fires story creation after a component Write |
| Hook script | `.claude/hooks/create-story.sh` | Detection logic + subprocess spawn |

## 1. MCP Configuration

`.mcp.json` at the monorepo root:

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

Storybook MCP starts on demand. If Storybook isn't running, the subprocess Claude falls back to inferring story structure from the component file directly.

## 2. Hook Configuration

In `.claude/settings.json` under the `"hooks"` key:

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

## 3. Hook Script

`.claude/hooks/create-story.sh`:

**Input:** JSON payload from stdin with the `Write` tool's `file_path`.

**Logic:**

1. Parse `file_path` from stdin JSON
2. Bail if path does not match `packages/ui/src/components/**/*.tsx`
3. Bail if file is `*.stories.tsx` or `index.ts`
4. Bail if sibling `.stories.tsx` already exists (idempotent)
5. Spawn `claude --print` with prompt to create the sibling story, referencing existing stories via Storybook MCP
6. Print `Story created: <filename>.stories.tsx` to stdout

**Subprocess prompt template:**

```
Create a Storybook story file for the component at <component_path>.
Write it to <story_path>.
Use the storybook MCP to reference existing stories for structure, naming, and export conventions.
If the MCP is unavailable, infer story variants from the component's props.
```

## Data Flow

```
Claude writes component file
       ↓
PostToolUse hook fires
       ↓
create-story.sh receives JSON payload
       ↓
Detection: is this a new component? → no → exit silently
                                    → yes ↓
claude --print spawned (subprocess)
       ↓
Subprocess queries Storybook MCP for existing story patterns
       ↓
Subprocess writes <ComponentName>.stories.tsx
       ↓
Hook prints one-liner to main session
```

## Error Handling

- **Storybook not running:** MCP call fails; subprocess continues using component props as reference
- **Story already exists:** Script exits before spawning subprocess — no duplicate, no noise
- **Component has no props:** Subprocess creates a minimal story with a single default export

## Out of Scope

- Updating existing stories when a component changes
- Generating stories for components outside `packages/ui/src/components/`
- Running Storybook automatically as part of this flow
