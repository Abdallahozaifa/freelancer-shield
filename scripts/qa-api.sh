#!/bin/bash
# qa-api.sh - API endpoint testing for ScopeGuard
#
# Usage: ./scripts/qa-api.sh [options]
#
# Options:
#   --priority=HIGH    Run only HIGH priority tests
#   --verbose          Show full response bodies
#   --no-auth          Skip authenticated tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
QA_DIR="$PROJECT_DIR/.claude/qa"

cd "$PROJECT_DIR"
mkdir -p "$QA_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Config
SCOPEGUARD_API=${SCOPEGUARD_API:-"https://scopeguard.fly.dev/api/v1"}
TOKEN_FILE="$PROJECT_DIR/.claude/.token"
VERBOSE=false
PRIORITY_FILTER=""
SKIP_AUTH=false
TOKEN="${SCOPEGUARD_TOKEN:-""}"

# Results tracking
TESTS_PASSED=0
TESTS_FAILED=0
RESULTS_JSON='{"tests":[]}'

# Parse arguments
for arg in "$@"; do
    case $arg in
        --priority=*)
            PRIORITY_FILTER="${arg#*=}"
            ;;
        --verbose)
            VERBOSE=true
            ;;
        --no-auth)
            SKIP_AUTH=true
            ;;
    esac
done

log_result() {
    local name=$1
    local status=$2
    local details=$3

    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $name"
        echo -e "  ${RED}$details${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    # Add to JSON results
    RESULTS_JSON=$(echo "$RESULTS_JSON" | jq --arg name "$name" --arg status "$status" --arg details "$details" \
        '.tests += [{"name": $name, "status": $status, "details": $details}]')
}

api_test() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_code=$4
    local data=$5
    local auth_required=$6
    local priority=${7:-"MEDIUM"}

    # Skip based on priority filter
    if [ -n "$PRIORITY_FILTER" ] && [ "$priority" != "$PRIORITY_FILTER" ]; then
        return 0
    fi

    # Skip auth tests if requested
    if [ "$auth_required" = "true" ] && [ "$SKIP_AUTH" = "true" ]; then
        echo -e "${YELLOW}⊘${NC} $name (skipped - auth required)"
        return 0
    fi

    local url="$SCOPEGUARD_API$endpoint"
    local curl_args="-s -w '%{http_code}' -o /tmp/qa_response.json"

    # Add auth header if needed and token available
    if [ "$auth_required" = "true" ] && [ -n "$TOKEN" ]; then
        curl_args="$curl_args -H 'Authorization: Bearer $TOKEN'"
    fi

    # Add content type for POST/PUT/PATCH
    if [ "$method" != "GET" ] && [ "$method" != "DELETE" ]; then
        curl_args="$curl_args -H 'Content-Type: application/json'"
    fi

    # Add data if provided
    if [ -n "$data" ]; then
        curl_args="$curl_args -d '$data'"
    fi

    # Execute request
    local response_code=$(eval "curl $curl_args -X $method '$url'" 2>/dev/null | tr -d "'")

    if [ "$VERBOSE" = "true" ] && [ -f /tmp/qa_response.json ]; then
        echo "Response: $(cat /tmp/qa_response.json | head -c 200)"
    fi

    # Check result - supports multiple expected codes (e.g., "401|403")
    if [[ "$expected_code" == *"|"* ]]; then
        # Multiple allowed codes
        if [[ "$expected_code" == *"$response_code"* ]]; then
            log_result "$name" "pass" ""
        else
            log_result "$name" "fail" "Expected $expected_code, got $response_code"
        fi
    else
        # Single expected code
        if [ "$response_code" = "$expected_code" ]; then
            log_result "$name" "pass" ""
        else
            log_result "$name" "fail" "Expected $expected_code, got $response_code"
        fi
    fi
}

authenticate() {
    # First check if we already have a token from SCOPEGUARD_TOKEN env var
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}Using token from environment${NC}"
        return 0
    fi

    # Try to read from cached token file
    if [ -f "$TOKEN_FILE" ]; then
        TOKEN=$(cat "$TOKEN_FILE")
        if [ -n "$TOKEN" ]; then
            echo -e "${GREEN}Using cached token from $TOKEN_FILE${NC}"
            return 0
        fi
    fi

    # Try to get a new token using get-token.sh
    if [ -f "$SCRIPT_DIR/get-token.sh" ]; then
        echo -e "${YELLOW}Getting auth token...${NC}"
        source "$SCRIPT_DIR/get-token.sh"
        TOKEN="$SCOPEGUARD_TOKEN"
        if [ -n "$TOKEN" ]; then
            return 0
        fi
    fi

    # Fallback to manual authentication
    echo -e "${YELLOW}Authenticating manually...${NC}"

    local email=${QA_EMAIL:-${SCOPEGUARD_TEST_EMAIL:-"qa@scopeguard.test"}}
    local password=${QA_PASSWORD:-${SCOPEGUARD_TEST_PASSWORD:-"QATest123!"}}

    local response=$(curl -s -X POST "$SCOPEGUARD_API/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")

    TOKEN=$(echo "$response" | jq -r '.access_token // empty')

    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✓ Authenticated as $email${NC}"
        # Cache the token
        mkdir -p "$(dirname "$TOKEN_FILE")"
        echo "$TOKEN" > "$TOKEN_FILE"
        chmod 600 "$TOKEN_FILE"
        return 0
    else
        echo -e "${YELLOW}⚠ Authentication failed - running unauthenticated tests only${NC}"
        echo "  Response: $(echo "$response" | head -c 100)"
        SKIP_AUTH=true
        return 1
    fi
}

echo "═══════════════════════════════════════"
echo "       ScopeGuard API Tests"
echo "═══════════════════════════════════════"
echo ""
echo "API: $SCOPEGUARD_API"
echo ""

# Try to authenticate
if [ "$SKIP_AUTH" != "true" ]; then
    authenticate || true
fi

echo ""
echo "─────────────────────────────────────"
echo "Public Endpoints"
echo "─────────────────────────────────────"

# Health check (if available)
api_test "Health check" "GET" "/../health" "200" "" "false" "HIGH"

# Auth - public endpoints
api_test "Login - invalid credentials returns 401" "POST" "/auth/login" "401" '{"email":"fake@test.com","password":"wrong"}' "false" "HIGH"
api_test "Login - missing fields returns 422" "POST" "/auth/login" "422" '{}' "false" "HIGH"
api_test "Register - missing fields returns 422" "POST" "/auth/register" "422" '{}' "false" "HIGH"
api_test "Forgot password - invalid email returns 422" "POST" "/auth/forgot-password" "422" '{"email":"notanemail"}' "false" "MEDIUM"

echo ""
echo "─────────────────────────────────────"
echo "Protected Endpoints (Auth Required)"
echo "─────────────────────────────────────"

if [ "$SKIP_AUTH" != "true" ] && [ -n "$TOKEN" ]; then
    # Auth - protected
    api_test "Get current user" "GET" "/auth/me" "200" "" "true" "HIGH"

    # Dashboard
    api_test "Dashboard summary" "GET" "/dashboard/summary" "200" "" "true" "HIGH"
    api_test "Dashboard alerts" "GET" "/dashboard/alerts" "200" "" "true" "HIGH"
    api_test "Dashboard activity" "GET" "/dashboard/activity" "200" "" "true" "MEDIUM"

    # Clients
    api_test "List clients" "GET" "/clients" "200" "" "true" "HIGH"

    # Projects
    api_test "List projects" "GET" "/projects" "200" "" "true" "HIGH"

    # Billing
    api_test "Get subscription" "GET" "/billing/subscription" "200" "" "true" "HIGH"
    api_test "Get usage limits" "GET" "/billing/limits" "200" "" "true" "HIGH"

else
    echo -e "${YELLOW}Skipping authenticated tests - no valid token${NC}"
fi

echo ""
echo "─────────────────────────────────────"
echo "Unauthorized Access (Should Return 401/403)"
echo "─────────────────────────────────────"

# Test that protected endpoints reject unauthenticated requests
# Note: FastAPI may return 401 or 403 depending on security config
api_test "Projects without auth returns 401/403" "GET" "/projects" "401|403" "" "false" "HIGH"
api_test "Clients without auth returns 401/403" "GET" "/clients" "401|403" "" "false" "HIGH"
api_test "Dashboard without auth returns 401/403" "GET" "/dashboard/summary" "401|403" "" "false" "HIGH"

echo ""
echo "═══════════════════════════════════════"
echo "                Results"
echo "═══════════════════════════════════════"
echo ""
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Save results
echo "$RESULTS_JSON" | jq '.' > "$QA_DIR/api-results.json"
echo "Results saved to $QA_DIR/api-results.json"

# Exit with error if tests failed
if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
fi
