#!/bin/bash
# context.sh - Generates codebase context that all tools can read
# Run this before implementation to give Cursor and CLI fresh context

set -e

OUT=".claude/codebase.md"
PROJECT_NAME=$(basename "$(pwd)")

echo "📁 Generating codebase context..."

cat > "$OUT" << EOF
# Codebase Context: $PROJECT_NAME

> Auto-generated: $(date)
> This file is read by Cursor and Claude CLI for context

EOF

# File structure
echo "## File Structure" >> "$OUT"
echo '```' >> "$OUT"
if command -v tree &> /dev/null; then
    tree -I 'node_modules|.git|dist|build|__pycache__|.venv|.next|coverage|.pytest_cache' --dirsfirst -L 3 2>/dev/null >> "$OUT" || find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.py" | head -50 >> "$OUT"
else
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" \) | grep -v node_modules | grep -v .git | head -50 >> "$OUT"
fi
echo '```' >> "$OUT"
echo "" >> "$OUT"

# Git status
echo "## Git Status" >> "$OUT"
echo '```' >> "$OUT"
git status --short 2>/dev/null >> "$OUT" || echo "Not a git repo" >> "$OUT"
echo '```' >> "$OUT"
echo "" >> "$OUT"

# Recent commits
echo "## Recent Changes" >> "$OUT"
echo '```' >> "$OUT"
git log --oneline -10 2>/dev/null >> "$OUT" || echo "No git history" >> "$OUT"
echo '```' >> "$OUT"
echo "" >> "$OUT"

# Package.json dependencies (monorepo structure)
if [ -f "apps/web/package.json" ]; then
    echo "## Frontend Dependencies" >> "$OUT"
    echo '```json' >> "$OUT"
    cat apps/web/package.json | grep -A 50 '"dependencies"' | head -30 >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
elif [ -f "package.json" ]; then
    echo "## Dependencies" >> "$OUT"
    echo '```json' >> "$OUT"
    cat package.json | grep -A 50 '"dependencies"' | head -30 >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
fi

# Python requirements
if [ -f "requirements.txt" ]; then
    echo "## Backend Dependencies" >> "$OUT"
    echo '```' >> "$OUT"
    cat requirements.txt >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
fi

# TypeScript types
if [ -f "apps/web/src/types/index.ts" ]; then
    echo "## Key Types" >> "$OUT"
    echo '```typescript' >> "$OUT"
    cat apps/web/src/types/index.ts >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
fi

# API routes summary
if [ -d "app/api" ]; then
    echo "## API Endpoints" >> "$OUT"
    echo '```python' >> "$OUT"
    grep -r "@router\." app/api --include="*.py" 2>/dev/null | head -40 >> "$OUT" || echo "No routes found" >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
fi

# Current task if exists
if [ -f ".claude/task.md" ]; then
    echo "## Current Task" >> "$OUT"
    cat .claude/task.md >> "$OUT"
    echo "" >> "$OUT"
fi

# Current errors if exist
if [ -f ".claude/errors.md" ]; then
    echo "## Known Errors" >> "$OUT"
    cat .claude/errors.md >> "$OUT"
    echo "" >> "$OUT"
fi

# Recent production logs (Fly.io)
echo "## Recent Production Logs" >> "$OUT"
echo "" >> "$OUT"
echo "Fetching recent Fly.io logs..." >&2

if command -v fly &> /dev/null; then
    # Fetch recent logs
    LOGS=$(fly logs -a scopeguard --since 5m 2>/dev/null || echo "Unable to fetch logs")

    if [ -n "$LOGS" ] && [ "$LOGS" != "Unable to fetch logs" ]; then
        # Save full logs
        echo "$LOGS" > .claude/logs.txt

        # Extract errors for the context file
        ERRORS=$(echo "$LOGS" | grep -iE "error|exception|500|failed|traceback|critical" 2>/dev/null || true)

        if [ -n "$ERRORS" ]; then
            echo "### Recent Errors (last 5 min)" >> "$OUT"
            echo '```' >> "$OUT"
            echo "$ERRORS" | head -30 >> "$OUT"
            echo '```' >> "$OUT"
            echo "" >> "$OUT"

            # Also save to errors.txt
            echo "$ERRORS" > .claude/errors.txt
            ERROR_COUNT=$(echo "$ERRORS" | wc -l | tr -d ' ')
            echo "⚠️  Found $ERROR_COUNT error lines (saved to .claude/errors.txt)" >&2
        else
            echo "### Production Status" >> "$OUT"
            echo "No errors in last 5 minutes." >> "$OUT"
            echo "" >> "$OUT"
            echo "✅ No errors in recent logs" >&2
        fi

        # Add recent request summary
        REQUEST_LOGS=$(echo "$LOGS" | grep -E "\"(GET|POST|PUT|PATCH|DELETE)" | tail -10 2>/dev/null || true)
        if [ -n "$REQUEST_LOGS" ]; then
            echo "### Recent Requests" >> "$OUT"
            echo '```' >> "$OUT"
            echo "$REQUEST_LOGS" >> "$OUT"
            echo '```' >> "$OUT"
            echo "" >> "$OUT"
        fi
    else
        echo "Unable to fetch production logs. Run \`fly auth login\` if needed." >> "$OUT"
        echo "" >> "$OUT"
        echo "⚠️  Could not fetch Fly.io logs" >&2
    fi
else
    echo "Fly CLI not installed. Install with: curl -L https://fly.io/install.sh | sh" >> "$OUT"
    echo "" >> "$OUT"
    echo "⚠️  Fly CLI not found" >&2
fi

echo "✅ Generated $OUT ($(wc -l < "$OUT") lines)"
