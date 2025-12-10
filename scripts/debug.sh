#!/bin/bash
# debug.sh - Production debugging script for Fly.io
#
# Usage:
#   ./scripts/debug.sh             # Fetch all logs (last 10 min)
#   ./scripts/debug.sh requests    # Filter logs by endpoint/keyword
#   ./scripts/debug.sh auth        # Filter for auth-related logs
#
# Output:
#   .claude/logs.txt   - Full logs
#   .claude/errors.txt - Filtered error logs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FILTER="${1:-}"

cd "$PROJECT_DIR"

echo "🔍 Production Debug Script"
echo "=========================="
echo ""

# Check for Fly CLI
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not installed."
    echo "   Install: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Fetch logs
echo "📋 Fetching logs from Fly.io (last 10 minutes)..."
echo ""

if [ -n "$FILTER" ]; then
    echo "   Filter: '$FILTER'"
    LOGS=$(fly logs -a scopeguard --since 10m 2>/dev/null | grep -i "$FILTER" || true)
else
    LOGS=$(fly logs -a scopeguard --since 10m 2>/dev/null || echo "")
fi

if [ -z "$LOGS" ]; then
    echo "⚠️  No logs found (or no matching logs for filter '$FILTER')"
    exit 0
fi

# Save full logs
echo "$LOGS" > .claude/logs.txt
LOG_COUNT=$(echo "$LOGS" | wc -l | tr -d ' ')
echo "✅ Saved $LOG_COUNT log lines to .claude/logs.txt"
echo ""

# Extract errors
echo "🔴 Extracting errors..."
ERRORS=$(echo "$LOGS" | grep -iE "error|exception|500|failed|traceback|critical|pydantic" 2>/dev/null || true)

if [ -n "$ERRORS" ]; then
    echo "$ERRORS" > .claude/errors.txt
    ERROR_COUNT=$(echo "$ERRORS" | wc -l | tr -d ' ')
    echo "⚠️  Found $ERROR_COUNT error lines"
    echo ""
    echo "────────────────────────────────────────"
    echo "RECENT ERRORS:"
    echo "────────────────────────────────────────"
    echo "$ERRORS" | head -30
    echo "────────────────────────────────────────"
    echo ""
    echo "Full errors saved to: .claude/errors.txt"
else
    echo "" > .claude/errors.txt
    echo "✅ No errors found!"
fi

echo ""

# Extract HTTP status codes summary
echo "📊 HTTP Response Summary:"
echo "────────────────────────────────────────"

# Count 2xx responses
COUNT_2XX=$(echo "$LOGS" | grep -oE "HTTP/[0-9.]+ (2[0-9]{2})" | wc -l | tr -d ' ')
# Count 4xx responses
COUNT_4XX=$(echo "$LOGS" | grep -oE "HTTP/[0-9.]+ (4[0-9]{2})" | wc -l | tr -d ' ')
# Count 5xx responses
COUNT_5XX=$(echo "$LOGS" | grep -oE "HTTP/[0-9.]+ (5[0-9]{2})" | wc -l | tr -d ' ')

echo "   2xx (Success): $COUNT_2XX"
echo "   4xx (Client Error): $COUNT_4XX"
echo "   5xx (Server Error): $COUNT_5XX"
echo ""

# Show recent 5xx errors specifically
if [ "$COUNT_5XX" -gt 0 ]; then
    echo "🚨 Recent 5xx Errors:"
    echo "────────────────────────────────────────"
    echo "$LOGS" | grep -E "5[0-9]{2}" | tail -10
    echo "────────────────────────────────────────"
    echo ""
fi

# Show slow requests if any
SLOW_REQUESTS=$(echo "$LOGS" | grep -E "[0-9]{4,}ms" 2>/dev/null || true)
if [ -n "$SLOW_REQUESTS" ]; then
    echo "🐢 Slow Requests (>1000ms):"
    echo "────────────────────────────────────────"
    echo "$SLOW_REQUESTS" | head -5
    echo "────────────────────────────────────────"
    echo ""
fi

echo "📁 Output files:"
echo "   .claude/logs.txt   - Full logs ($LOG_COUNT lines)"
echo "   .claude/errors.txt - Error logs"
echo ""

# Provide next steps based on what was found
if [ -n "$ERRORS" ]; then
    echo "💡 Next steps:"
    echo "   1. Review .claude/errors.txt for error details"
    echo "   2. Search codebase for the failing endpoint/function"
    echo "   3. Fix the issue and deploy: fly deploy"
    echo "   4. Verify fix: ./scripts/debug.sh"
fi
