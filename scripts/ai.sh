#!/bin/bash
# ai.sh - Run Claude CLI with auto-approve (no permission prompts)
#
# This wrapper runs Claude CLI with --dangerously-skip-permissions flag,
# which skips all permission prompts and auto-approves tool calls.
#
# WARNING: Only use this in trusted environments where you understand
# the risks of allowing Claude to execute commands without confirmation.
#
# Usage:
#   ./scripts/ai.sh "Your prompt here"
#   ./scripts/ai.sh --print "Your prompt here"
#   ./scripts/ai.sh -c  # Continue previous conversation
#
# Examples:
#   ./scripts/ai.sh "Fix all TypeScript errors in the codebase"
#   ./scripts/ai.sh "Run the QA suite and fix any failures"
#   ./scripts/ai.sh --print "Read .claude/task.md and implement the task"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check if claude CLI is available
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI not found. Install it:"
    echo "   npm install -g @anthropic-ai/claude-cli"
    exit 1
fi

# Show warning banner on first use
if [ ! -f ".claude/.ai-warned" ]; then
    echo "⚠️  AUTO-APPROVE MODE"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "Running Claude with --dangerously-skip-permissions"
    echo "Claude will execute commands WITHOUT asking for permission."
    echo ""
    echo "This includes:"
    echo "  • File reads, writes, and deletions"
    echo "  • Shell command execution"
    echo "  • Git operations"
    echo "  • Deployment commands"
    echo ""
    echo "Only use this in trusted projects where you understand the risks."
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    touch .claude/.ai-warned
fi

# Pass all arguments to claude with auto-approve flag
exec claude --dangerously-skip-permissions "$@"
