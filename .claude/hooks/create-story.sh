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
