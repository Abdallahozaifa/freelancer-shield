#!/bin/bash
# api-test.sh - Test API endpoints against production
#
# Usage: ./scripts/api-test.sh <method> <endpoint> [body]
#
# Examples:
#   ./scripts/api-test.sh GET /projects
#   ./scripts/api-test.sh GET /projects/{id}/requests
#   ./scripts/api-test.sh PATCH /projects/{id}/requests/{id} '{"status":"active"}'
#   ./scripts/api-test.sh POST /projects '{"name":"Test","client_name":"Client"}'
#
# Requires: SCOPEGUARD_TOKEN environment variable for authenticated requests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

METHOD="${1^^}"  # Uppercase
ENDPOINT="$2"
BODY="$3"

BASE_URL="${SCOPEGUARD_API_URL:-https://scopeguard.fly.dev/api/v1}"

if [ -z "$METHOD" ] || [ -z "$ENDPOINT" ]; then
    echo "Usage: ./scripts/api-test.sh <method> <endpoint> [body]"
    echo ""
    echo "Methods: GET, POST, PUT, PATCH, DELETE"
    echo ""
    echo "Examples:"
    echo "  ./scripts/api-test.sh GET /projects"
    echo "  ./scripts/api-test.sh GET /projects/{id}/requests"
    echo "  ./scripts/api-test.sh PATCH /projects/{id}/requests/{id} '{\"status\":\"active\"}'"
    echo ""
    echo "Environment Variables:"
    echo "  SCOPEGUARD_TOKEN     - Auth token (required for authenticated endpoints)"
    echo "  SCOPEGUARD_API_URL   - Base URL (default: https://scopeguard.fly.dev/api/v1)"
    exit 1
fi

# Build full URL
if [[ "$ENDPOINT" == /* ]]; then
    FULL_URL="${BASE_URL}${ENDPOINT}"
else
    FULL_URL="${BASE_URL}/${ENDPOINT}"
fi

echo "🔗 API Test"
echo "==========="
echo "Method:   $METHOD"
echo "Endpoint: $ENDPOINT"
echo "URL:      $FULL_URL"
if [ -n "$BODY" ]; then
    echo "Body:     $BODY"
fi
echo ""

# Build curl command
CURL_ARGS=(-s -w "\n%{http_code}" -X "$METHOD")
CURL_ARGS+=(-H "Content-Type: application/json")

# Add auth header if token is set
if [ -n "$SCOPEGUARD_TOKEN" ]; then
    CURL_ARGS+=(-H "Authorization: Bearer $SCOPEGUARD_TOKEN")
    echo "🔐 Using auth token"
else
    echo "⚠️  No SCOPEGUARD_TOKEN set (request will be unauthenticated)"
fi

# Add body for POST/PUT/PATCH
if [ -n "$BODY" ] && [[ "$METHOD" =~ ^(POST|PUT|PATCH)$ ]]; then
    CURL_ARGS+=(-d "$BODY")
fi

echo ""
echo "📡 Sending request..."
echo ""

# Execute request and capture response + status code
RESPONSE=$(curl "${CURL_ARGS[@]}" "$FULL_URL" 2>&1)

# Extract status code (last line) and body (everything else)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

# Save results
echo "$HTTP_STATUS" > "$PROJECT_DIR/.claude/api-status.txt"
echo "$RESPONSE_BODY" > "$PROJECT_DIR/.claude/api-response.json"

# Try to pretty-print JSON, fall back to raw if not JSON
if command -v python3 &> /dev/null; then
    PRETTY_JSON=$(echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null) || PRETTY_JSON="$RESPONSE_BODY"
else
    PRETTY_JSON="$RESPONSE_BODY"
fi

# Display results with color coding
echo "📊 Response"
echo "==========="

if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
    echo "✅ Status: $HTTP_STATUS (Success)"
elif [ "$HTTP_STATUS" -ge 400 ] && [ "$HTTP_STATUS" -lt 500 ]; then
    echo "⚠️  Status: $HTTP_STATUS (Client Error)"
elif [ "$HTTP_STATUS" -ge 500 ]; then
    echo "❌ Status: $HTTP_STATUS (Server Error)"
else
    echo "ℹ️  Status: $HTTP_STATUS"
fi

echo ""
echo "Body:"
echo "-----"
# Truncate if too long
if [ ${#PRETTY_JSON} -gt 2000 ]; then
    echo "${PRETTY_JSON:0:2000}"
    echo ""
    echo "... (truncated, see .claude/api-response.json for full response)"
else
    echo "$PRETTY_JSON"
fi

echo ""
echo "📁 Results saved to:"
echo "   .claude/api-status.txt   ($HTTP_STATUS)"
echo "   .claude/api-response.json"

# Exit with error if status >= 400
if [ "$HTTP_STATUS" -ge 400 ]; then
    exit 1
fi
