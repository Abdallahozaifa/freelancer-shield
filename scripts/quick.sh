#!/bin/bash
# quick.sh - Quick commands for the three-tool workflow
#
# Usage: ./scripts/quick.sh <command>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

case "$1" in

    # Paste task from clipboard (macOS)
    paste|p)
        pbpaste > .claude/task.md
        echo "✅ Task saved to .claude/task.md"
        echo ""
        head -15 .claude/task.md
        ;;

    # Generate context
    context|c)
        ./scripts/context.sh
        ;;

    # Full implementation pipeline
    build|b)
        ./scripts/implement.sh
        ;;

    # Just run Claude CLI on current task
    cli)
        claude "Read .claude/task.md and .claude/INSTRUCTIONS.md. Implement the task, run tests, fix errors."
        ;;

    # Open in Cursor
    cursor|edit|e)
        cursor .
        ;;

    # Run tests/checks
    test|t)
        echo "🧪 Running checks..."
        echo "Frontend build:"
        cd apps/web && npm run build
        cd "$PROJECT_DIR"
        echo ""
        echo "Frontend lint:"
        cd apps/web && npm run lint
        cd "$PROJECT_DIR"
        ;;

    # Deploy
    deploy|d)
        echo "🚀 Deploying to Fly.io..."
        fly deploy
        ;;

    # Check status
    status|s)
        echo "📊 Project Status"
        echo "================="
        echo ""
        echo "Current task:"
        if [ -f ".claude/task.md" ]; then
            head -5 .claude/task.md
        else
            echo "  (none)"
        fi
        echo ""
        echo "Git status:"
        git status --short
        echo ""
        echo "Recent commits:"
        git log --oneline -5
        ;;

    # Clear task
    clear)
        rm -f .claude/task.md .claude/result.md .claude/errors.md .claude/logs.txt
        echo "✅ Cleared task files"
        ;;

    # View recent logs (last 5 minutes)
    logs|l)
        echo "📋 Fetching Fly.io logs (last 5 minutes)..."
        fly logs -a scopeguard --since 5m | tee .claude/logs.txt
        echo ""
        echo "✅ Logs saved to .claude/logs.txt"
        ;;

    # View error logs (last 30 minutes, filtered)
    logs-error|le)
        echo "🔴 Fetching error logs (last 30 minutes)..."
        fly logs -a scopeguard --since 30m 2>/dev/null | grep -iE "error|exception|500|failed|traceback|critical" | tee .claude/errors.txt
        ERROR_COUNT=$(wc -l < .claude/errors.txt | tr -d ' ')
        echo ""
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo "⚠️  Found $ERROR_COUNT error lines in .claude/errors.txt"
        else
            echo "✅ No errors found in last 30 minutes"
        fi
        ;;

    # Deploy and verify - deploy, wait, check for errors
    deploy-test|dt)
        echo "🚀 Deploy and Test Pipeline"
        echo "============================"
        echo ""

        # Step 1: Deploy
        echo "📦 Step 1: Deploying to Fly.io..."
        if ! fly deploy; then
            echo "❌ Deploy failed!"
            exit 1
        fi

        echo ""
        echo "⏳ Step 2: Waiting 30 seconds for app to stabilize..."
        sleep 30

        echo ""
        echo "📋 Step 3: Fetching logs..."
        fly logs -a scopeguard --since 2m > .claude/logs.txt 2>&1

        echo ""
        echo "🔍 Step 4: Checking for errors..."
        grep -iE "error|exception|500|failed|traceback|critical" .claude/logs.txt > .claude/errors.txt 2>/dev/null || true
        ERROR_COUNT=$(wc -l < .claude/errors.txt | tr -d ' ')

        echo ""
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo "⚠️  Found $ERROR_COUNT error lines after deploy:"
            echo "────────────────────────────────────────"
            head -20 .claude/errors.txt
            echo "────────────────────────────────────────"
            echo ""
            echo "Full logs: .claude/logs.txt"
            echo "Errors: .claude/errors.txt"
            exit 1
        else
            echo "✅ Deploy successful! No errors detected."
            echo "   App: https://scopeguard.fly.dev/"
        fi
        ;;

    # Run debug script
    debug)
        ./scripts/debug.sh "$2"
        ;;

    # Take screenshot of a URL
    screenshot|ss)
        if [ -z "$2" ]; then
            echo "Usage: ./scripts/quick.sh screenshot <url> [viewport]"
            echo "Viewports: desktop (default), mobile, tablet"
            exit 1
        fi
        ./scripts/screenshot.sh "$2" "$3"
        ;;

    # Run API test
    api)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: ./scripts/quick.sh api <method> <endpoint> [body]"
            echo "Example: ./scripts/quick.sh api GET /projects"
            exit 1
        fi
        ./scripts/api-test.sh "$2" "$3" "$4"
        ;;

    # Run verification
    verify|v)
        ./scripts/verify.sh "${2:-both}" "$3"
        ;;

    # Run visual check with AI
    visual)
        if [ -z "$2" ]; then
            echo "Usage: ./scripts/quick.sh visual <url> [check_description]"
            exit 1
        fi
        ./scripts/visual-check.sh "$2" "$3"
        ;;

    # Copy task template
    template)
        cp .claude/task-template.md .claude/task.md
        echo "✅ Copied task template to .claude/task.md"
        echo "   Edit .claude/task.md with your task details"
        ;;

    # Show help
    *)
        echo "Quick Commands for Three-Tool Workflow"
        echo "======================================="
        echo ""
        echo "Usage: ./scripts/quick.sh <command>"
        echo ""
        echo "Commands:"
        echo ""
        echo "  Task Management:"
        echo "    paste, p       Paste task from clipboard to .claude/task.md"
        echo "    template       Copy task template to .claude/task.md"
        echo "    context, c     Generate fresh codebase context"
        echo "    clear          Clear task files"
        echo ""
        echo "  Development:"
        echo "    build, b       Full implementation pipeline (context → Cursor → CLI)"
        echo "    cli            Run Claude CLI on current task"
        echo "    cursor, e      Open project in Cursor"
        echo "    test, t        Run build and lint checks"
        echo ""
        echo "  Deployment:"
        echo "    deploy, d      Deploy to Fly.io"
        echo "    deploy-test, dt Deploy, wait, then check for errors"
        echo "    status, s      Show project status"
        echo ""
        echo "  Debugging:"
        echo "    logs, l        Fetch recent logs (5 min) → .claude/logs.txt"
        echo "    logs-error, le Fetch error logs (30 min) → .claude/errors.txt"
        echo "    debug [filter] Run debug script (optional endpoint filter)"
        echo ""
        echo "  Verification:"
        echo "    screenshot, ss <url> [viewport]  Take screenshot (desktop/mobile/tablet)"
        echo "    api <method> <endpoint> [body]   Test API endpoint"
        echo "    verify, v [type] [url]           Run verification (ui/api/both)"
        echo "    visual <url> [check]             AI visual check with Claude Vision"
        echo ""
        echo "Examples:"
        echo "  ./scripts/quick.sh screenshot 'https://scopeguard.fly.dev/login' mobile"
        echo "  ./scripts/quick.sh api GET /projects"
        echo "  ./scripts/quick.sh api PATCH /projects/123/requests/456 '{\"status\":\"active\"}'"
        echo "  ./scripts/quick.sh verify ui 'https://scopeguard.fly.dev/login'"
        echo "  ./scripts/quick.sh visual 'https://scopeguard.fly.dev' 'Check login button'"
        echo ""
        echo "Verification Workflow:"
        echo "  1. Fix an issue"
        echo "  2. ./scripts/quick.sh deploy-test  # Deploy and check for errors"
        echo "  3. ./scripts/quick.sh verify both  # Run UI + API verification"
        echo "  4. ./scripts/quick.sh visual <url> # AI visual check (optional)"
        ;;
esac
