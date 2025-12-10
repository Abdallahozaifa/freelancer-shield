#!/bin/bash
# implement.sh - Full implementation pipeline using all three tools
#
# Workflow:
#   1. Claude Chat → You screenshot + get task → pbpaste > .claude/task.md
#   2. This script → Generates context, opens Cursor, runs CLI
#
# Usage: ./scripts/implement.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🔄 Implementation Pipeline"
echo "=========================="
echo ""

# Step 1: Check for task file
if [ ! -f ".claude/task.md" ]; then
    echo "❌ No task found at .claude/task.md"
    echo ""
    echo "First, get a task from Claude Chat:"
    echo "  1. Screenshot your bug/feature"
    echo "  2. Paste in Claude Chat"
    echo "  3. Copy the structured task block"
    echo "  4. Run: pbpaste > .claude/task.md"
    echo ""
    exit 1
fi

# Check if task is just the template
if grep -q "^\[What's broken" .claude/task.md; then
    echo "❌ .claude/task.md contains only the template"
    echo "   Paste an actual task from Claude Chat"
    exit 1
fi

echo "📋 Current Task:"
echo "────────────────"
head -20 .claude/task.md
echo ""
echo "────────────────"
echo ""

# Step 2: Generate fresh codebase context
echo "📁 Generating codebase context..."
./scripts/context.sh
echo ""

# Step 3: Open Cursor for implementation
echo "🖥️  CURSOR PHASE"
echo "────────────────"
echo "Opening project in Cursor..."
echo ""
echo "In Cursor Composer, use this prompt:"
echo ""
echo "┌────────────────────────────────────────────────────────────┐"
echo "│  Read .claude/task.md and .claude/codebase.md             │"
echo "│  Implement the task using your full codebase context.     │"
echo "│  Follow conventions in .claude/INSTRUCTIONS.md            │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

# Open Cursor (works on macOS, adjust for Linux)
if command -v cursor &> /dev/null; then
    cursor .
elif [ -d "/Applications/Cursor.app" ]; then
    open -a Cursor .
else
    echo "⚠️  Cursor not found in PATH. Open manually: cursor ."
fi

echo ""
read -p "Press Enter when Cursor implementation is complete..."
echo ""

# Step 4: Run Claude CLI for testing and verification
echo "🧪 CLI PHASE"
echo "────────────────"
echo "Running Claude CLI for testing and verification..."
echo ""

# Check if claude CLI is available
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI not found. Install it:"
    echo "   npm install -g @anthropic-ai/claude-cli"
    exit 1
fi

claude --print "You are verifying and testing code that Cursor just implemented.

READ THESE FILES FIRST:
- .claude/task.md (what was supposed to be built)
- .claude/INSTRUCTIONS.md (project conventions)

YOUR JOB:
1. Verify the implementation matches the task requirements
2. Run build: cd apps/web && npm run build
3. Run linting: cd apps/web && npm run lint
4. Check for TypeScript errors in the output
5. Fix ANY errors you find - do not leave broken code
6. If you fix something, re-run the checks

IMPORTANT:
- Loop until all checks pass (max 5 attempts per check)
- If something is unfixable, document it in .claude/errors.md
- Write a summary of results to .claude/result.md

START by reading the task and verifying the implementation."

# Step 5: Show results
echo ""
echo "📊 RESULTS"
echo "────────────────"

if [ -f ".claude/result.md" ]; then
    cat .claude/result.md
else
    echo "No result.md generated. Check Claude CLI output above."
fi

echo ""

if [ -f ".claude/errors.md" ]; then
    echo "⚠️  ERRORS (see .claude/errors.md):"
    cat .claude/errors.md
fi

echo ""
echo "✅ Pipeline complete. Review changes:"
echo "   git diff"
echo ""
