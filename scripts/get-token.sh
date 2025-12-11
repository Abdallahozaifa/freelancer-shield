#!/bin/bash
# get-token.sh - Authenticate and get JWT token for QA testing
#
# Usage: source ./scripts/get-token.sh
#   or:  ./scripts/get-token.sh (just prints token)
#
# Reads credentials from:
#   1. Environment variables: QA_EMAIL, QA_PASSWORD
#   2. .claude/test-accounts.md (parses email/password lines)
#   3. Falls back to defaults
#
# Saves token to .claude/.token for reuse

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TOKEN_FILE="$PROJECT_DIR/.claude/.token"
ACCOUNTS_FILE="$PROJECT_DIR/.claude/test-accounts.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Config
SCOPEGUARD_API=${SCOPEGUARD_API:-"https://scopeguard.fly.dev/api/v1"}

# Get credentials
get_credentials() {
    # Priority 1: Environment variables
    if [ -n "$QA_EMAIL" ] && [ -n "$QA_PASSWORD" ]; then
        EMAIL="$QA_EMAIL"
        PASSWORD="$QA_PASSWORD"
        return 0
    fi

    # Priority 2: Parse from test-accounts.md
    if [ -f "$ACCOUNTS_FILE" ]; then
        # Look for Email: and Password: lines
        EMAIL=$(grep -i "^\*\*Email:\*\*" "$ACCOUNTS_FILE" | head -1 | sed 's/.*`\([^`]*\)`.*/\1/')
        PASSWORD=$(grep -i "^\*\*Password:\*\*" "$ACCOUNTS_FILE" | head -1 | sed 's/.*`\([^`]*\)`.*/\1/')

        if [ -n "$EMAIL" ] && [ -n "$PASSWORD" ]; then
            return 0
        fi
    fi

    # Priority 3: Default test credentials
    EMAIL="${SCOPEGUARD_TEST_EMAIL:-qa@scopeguard.test}"
    PASSWORD="${SCOPEGUARD_TEST_PASSWORD:-QATest123!}"
}

# Check if existing token is still valid
check_existing_token() {
    if [ ! -f "$TOKEN_FILE" ]; then
        return 1
    fi

    local token=$(cat "$TOKEN_FILE")
    if [ -z "$token" ]; then
        return 1
    fi

    # Test if token is still valid
    local response=$(curl -s -w "%{http_code}" -o /tmp/token_check.json \
        -H "Authorization: Bearer $token" \
        "$SCOPEGUARD_API/auth/me" 2>/dev/null)

    if [ "$response" = "200" ]; then
        export SCOPEGUARD_TOKEN="$token"
        return 0
    fi

    return 1
}

# Get new token
get_new_token() {
    get_credentials

    echo -e "${YELLOW}Authenticating as $EMAIL...${NC}" >&2

    local response=$(curl -s -X POST "$SCOPEGUARD_API/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

    local token=$(echo "$response" | jq -r '.access_token // empty')

    if [ -z "$token" ] || [ "$token" = "null" ]; then
        local error=$(echo "$response" | jq -r '.detail // "Unknown error"')
        echo -e "${RED}Authentication failed: $error${NC}" >&2
        echo -e "${YELLOW}Hint: Create test user with: ./scripts/quick.sh create-qa-user${NC}" >&2
        return 1
    fi

    # Save token
    mkdir -p "$(dirname "$TOKEN_FILE")"
    echo "$token" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"

    export SCOPEGUARD_TOKEN="$token"
    echo -e "${GREEN}Authenticated successfully${NC}" >&2
    return 0
}

# Main
main() {
    # Check for existing valid token first
    if check_existing_token; then
        echo -e "${GREEN}Using cached token${NC}" >&2
    else
        # Get new token
        if ! get_new_token; then
            return 1
        fi
    fi

    # Output token (for non-sourced usage)
    echo "$SCOPEGUARD_TOKEN"
}

# Run main and export token if sourced
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    # Script is being executed directly
    main
else
    # Script is being sourced
    main > /dev/null
    echo -e "${GREEN}SCOPEGUARD_TOKEN exported${NC}"
fi
