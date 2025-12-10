#!/bin/bash
# verify.sh - Run verification after a fix
#
# Usage: ./scripts/verify.sh <type> [options]
#
# Types:
#   ui    - Take screenshot and save for review
#   api   - Run API test from .claude/task.md
#   both  - Run both UI and API verification
#
# Examples:
#   ./scripts/verify.sh ui 'https://scopeguard.fly.dev/login'
#   ./scripts/verify.sh api
#   ./scripts/verify.sh both 'https://scopeguard.fly.dev/projects'

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

TYPE="${1:-both}"
URL="$2"

RESULT_FILE="$PROJECT_DIR/.claude/verify-result.md"
TASK_FILE="$PROJECT_DIR/.claude/task.md"

# Initialize result file
cat > "$RESULT_FILE" << EOF
# Verification Results
> Generated: $(date)

EOF

echo "🔍 Running Verification"
echo "======================="
echo "Type: $TYPE"
echo ""

# Function to extract value from task.md
extract_from_task() {
    local key="$1"
    if [ -f "$TASK_FILE" ]; then
        grep -A1 "^- $key:" "$TASK_FILE" 2>/dev/null | head -1 | sed "s/^- $key: *//" || echo ""
    fi
}

# Function to run UI verification
verify_ui() {
    local verify_url="$1"

    echo "📸 UI Verification"
    echo "==================" | tee -a "$RESULT_FILE"
    echo "" >> "$RESULT_FILE"

    # Get URL from task.md if not provided
    if [ -z "$verify_url" ]; then
        verify_url=$(grep -A1 "## UI Verify" "$TASK_FILE" 2>/dev/null | grep "URL:" | sed 's/.*URL: *//' || echo "")
    fi

    if [ -z "$verify_url" ]; then
        echo "⚠️  No URL provided and none found in .claude/task.md"
        echo "   Usage: ./scripts/verify.sh ui 'https://example.com/page'"
        echo "" >> "$RESULT_FILE"
        echo "**UI Verification:** Skipped (no URL provided)" >> "$RESULT_FILE"
        return 1
    fi

    echo "URL: $verify_url"
    echo ""

    # Take desktop and mobile screenshots
    echo "Taking desktop screenshot..."
    if "$SCRIPT_DIR/screenshot.sh" "$verify_url" desktop; then
        DESKTOP_SCREENSHOT="$PROJECT_DIR/.claude/screenshots/latest_desktop.png"
        echo "**Desktop Screenshot:** Saved to \`$DESKTOP_SCREENSHOT\`" >> "$RESULT_FILE"
    else
        echo "**Desktop Screenshot:** Failed" >> "$RESULT_FILE"
    fi

    echo ""
    echo "Taking mobile screenshot..."
    if "$SCRIPT_DIR/screenshot.sh" "$verify_url" mobile; then
        MOBILE_SCREENSHOT="$PROJECT_DIR/.claude/screenshots/latest_mobile.png"
        echo "**Mobile Screenshot:** Saved to \`$MOBILE_SCREENSHOT\`" >> "$RESULT_FILE"
    else
        echo "**Mobile Screenshot:** Failed" >> "$RESULT_FILE"
    fi

    echo "" >> "$RESULT_FILE"

    # Get check description from task.md
    CHECK_DESC=$(grep -A1 "## UI Verify" "$TASK_FILE" 2>/dev/null | grep "Check:" | sed 's/.*Check: *//' || echo "")
    if [ -n "$CHECK_DESC" ]; then
        echo "**Expected:** $CHECK_DESC" >> "$RESULT_FILE"
    fi

    echo "" >> "$RESULT_FILE"
}

# Function to run API verification
verify_api() {
    echo "🔗 API Verification"
    echo "===================" | tee -a "$RESULT_FILE"
    echo "" >> "$RESULT_FILE"

    if [ ! -f "$TASK_FILE" ]; then
        echo "⚠️  No .claude/task.md found"
        echo "**API Verification:** Skipped (no task file)" >> "$RESULT_FILE"
        return 1
    fi

    # Extract API test details from task.md
    METHOD=$(grep -A5 "## API Test" "$TASK_FILE" 2>/dev/null | grep "Method:" | sed 's/.*Method: *//' | tr -d '[:space:]' || echo "")
    ENDPOINT=$(grep -A5 "## API Test" "$TASK_FILE" 2>/dev/null | grep "Endpoint:" | sed 's/.*Endpoint: *//' | tr -d '[:space:]' || echo "")
    BODY=$(grep -A5 "## API Test" "$TASK_FILE" 2>/dev/null | grep "Body:" | sed 's/.*Body: *//' || echo "")
    EXPECTED=$(grep -A5 "## API Test" "$TASK_FILE" 2>/dev/null | grep "Expected:" | sed 's/.*Expected: *//' | tr -d '[:space:]' || echo "")

    if [ -z "$METHOD" ] || [ -z "$ENDPOINT" ]; then
        echo "⚠️  No API test defined in .claude/task.md"
        echo "   Add an '## API Test' section with Method and Endpoint"
        echo "**API Verification:** Skipped (no API test defined)" >> "$RESULT_FILE"
        return 1
    fi

    echo "Method:   $METHOD"
    echo "Endpoint: $ENDPOINT"
    if [ -n "$BODY" ]; then
        echo "Body:     $BODY"
    fi
    if [ -n "$EXPECTED" ]; then
        echo "Expected: $EXPECTED"
    fi
    echo ""

    # Run the API test
    if [ -n "$BODY" ]; then
        "$SCRIPT_DIR/api-test.sh" "$METHOD" "$ENDPOINT" "$BODY"
    else
        "$SCRIPT_DIR/api-test.sh" "$METHOD" "$ENDPOINT"
    fi

    API_STATUS=$(cat "$PROJECT_DIR/.claude/api-status.txt" 2>/dev/null || echo "unknown")

    echo "**Method:** $METHOD" >> "$RESULT_FILE"
    echo "**Endpoint:** $ENDPOINT" >> "$RESULT_FILE"
    echo "**Status:** $API_STATUS" >> "$RESULT_FILE"

    if [ -n "$EXPECTED" ]; then
        if [ "$API_STATUS" = "$EXPECTED" ]; then
            echo "**Result:** ✅ PASS (expected $EXPECTED, got $API_STATUS)" >> "$RESULT_FILE"
        else
            echo "**Result:** ❌ FAIL (expected $EXPECTED, got $API_STATUS)" >> "$RESULT_FILE"
        fi
    fi

    echo "" >> "$RESULT_FILE"
}

# Run verification based on type
case "$TYPE" in
    ui)
        verify_ui "$URL"
        ;;
    api)
        verify_api
        ;;
    both)
        verify_ui "$URL"
        echo ""
        verify_api
        ;;
    *)
        echo "❌ Unknown type: $TYPE"
        echo "   Use: ui, api, or both"
        exit 1
        ;;
esac

# Add summary
echo "---" >> "$RESULT_FILE"
echo "" >> "$RESULT_FILE"
echo "## Summary" >> "$RESULT_FILE"
echo "" >> "$RESULT_FILE"
echo "Verification completed at $(date)" >> "$RESULT_FILE"
echo "" >> "$RESULT_FILE"

echo ""
echo "📋 Verification Complete"
echo "========================"
echo ""
echo "Results saved to: .claude/verify-result.md"
echo ""
cat "$RESULT_FILE"
