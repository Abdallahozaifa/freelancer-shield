#!/bin/bash
# visual-check.sh - Take screenshot and use Claude Vision to verify UI
#
# Usage: ./scripts/visual-check.sh <url> [check_description]
#
# Examples:
#   ./scripts/visual-check.sh 'https://scopeguard.fly.dev/login'
#   ./scripts/visual-check.sh 'https://scopeguard.fly.dev/projects' 'Modal should be open'
#
# Requires: ANTHROPIC_API_KEY environment variable

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

URL="$1"
CHECK_DESC="$2"
TASK_FILE="$PROJECT_DIR/.claude/task.md"
RESULT_FILE="$PROJECT_DIR/.claude/visual-check.md"

if [ -z "$URL" ]; then
    echo "Usage: ./scripts/visual-check.sh <url> [check_description]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/visual-check.sh 'https://scopeguard.fly.dev/login'"
    echo "  ./scripts/visual-check.sh 'https://scopeguard.fly.dev/projects' 'Modal should be open'"
    echo ""
    echo "Requires: ANTHROPIC_API_KEY environment variable"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY environment variable is required"
    echo ""
    echo "Set it with: export ANTHROPIC_API_KEY='your-key'"
    exit 1
fi

echo "🔍 Visual Check with Claude Vision"
echo "==================================="
echo ""

# Get check description from task.md if not provided
if [ -z "$CHECK_DESC" ] && [ -f "$TASK_FILE" ]; then
    CHECK_DESC=$(grep -A1 "## UI Verify" "$TASK_FILE" 2>/dev/null | grep "Check:" | sed 's/.*Check: *//' || echo "")
fi

if [ -z "$CHECK_DESC" ]; then
    CHECK_DESC="Verify that the page renders correctly and all elements are visible"
fi

echo "URL: $URL"
echo "Check: $CHECK_DESC"
echo ""

# Take screenshot
echo "📸 Taking screenshot..."
"$SCRIPT_DIR/screenshot.sh" "$URL" desktop

SCREENSHOT="$PROJECT_DIR/.claude/screenshots/latest_desktop.png"

if [ ! -f "$SCREENSHOT" ]; then
    echo "❌ Failed to take screenshot"
    exit 1
fi

echo ""
echo "🤖 Sending to Claude Vision for analysis..."
echo ""

# Convert image to base64
IMAGE_BASE64=$(base64 -i "$SCREENSHOT")

# Get task context if available
TASK_CONTEXT=""
if [ -f "$TASK_FILE" ]; then
    TASK_CONTEXT=$(cat "$TASK_FILE" | head -50)
fi

# Build the prompt
PROMPT="You are a QA engineer reviewing a UI screenshot to verify a fix was implemented correctly.

## What to Check
$CHECK_DESC

## Task Context
$TASK_CONTEXT

## Instructions
1. Analyze the screenshot carefully
2. Determine if the UI matches the expected behavior
3. Look for any visual issues, errors, or broken layouts
4. Provide a clear PASS or FAIL verdict

Respond in this format:
## Result: [PASS/FAIL]

## Analysis
[Your detailed analysis]

## Issues Found
[List any issues, or 'None' if everything looks correct]

## Recommendations
[Any suggestions for improvement, or 'None' if everything is good]"

# Call Claude API with vision
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"claude-sonnet-4-20250514\",
    \"max_tokens\": 1024,
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": [
          {
            \"type\": \"image\",
            \"source\": {
              \"type\": \"base64\",
              \"media_type\": \"image/png\",
              \"data\": \"$IMAGE_BASE64\"
            }
          },
          {
            \"type\": \"text\",
            \"text\": $(echo "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
          }
        ]
      }
    ]
  }")

# Extract the response content
ANALYSIS=$(echo "$RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'content' in data and len(data['content']) > 0:
        print(data['content'][0]['text'])
    elif 'error' in data:
        print('Error: ' + data['error'].get('message', 'Unknown error'))
    else:
        print('Error: Unexpected response format')
except Exception as e:
    print(f'Error parsing response: {e}')
")

# Save results
cat > "$RESULT_FILE" << EOF
# Visual Check Results
> Generated: $(date)
> URL: $URL

## Check Description
$CHECK_DESC

## Screenshot
Saved to: \`.claude/screenshots/latest_desktop.png\`

$ANALYSIS
EOF

echo ""
echo "📋 Results"
echo "=========="
echo ""
echo "$ANALYSIS"
echo ""
echo "---"
echo ""
echo "Results saved to: .claude/visual-check.md"

# Determine pass/fail from response
if echo "$ANALYSIS" | grep -qi "Result: PASS"; then
    echo ""
    echo "✅ Visual check PASSED"
    exit 0
elif echo "$ANALYSIS" | grep -qi "Result: FAIL"; then
    echo ""
    echo "❌ Visual check FAILED"
    exit 1
else
    echo ""
    echo "⚠️  Could not determine pass/fail status"
    exit 0
fi
