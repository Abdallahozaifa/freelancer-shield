#!/bin/bash
# new-product.sh - Create a new micro-SaaS project from template
#
# Usage: ./scripts/new-product.sh <product-name> [template-dir]
#
# Examples:
#   ./scripts/new-product.sh logcost-ai
#   ./scripts/new-product.sh schema-shield ~/projects/microsaas-template

set -e

PRODUCT_NAME=$1
TEMPLATE_DIR=${2:-"$(dirname "$(pwd)")/microsaas-template"}
TARGET_DIR="$(dirname "$(pwd)")/$PRODUCT_NAME"

if [ -z "$PRODUCT_NAME" ]; then
    echo "Usage: ./scripts/new-product.sh <product-name> [template-dir]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/new-product.sh logcost-ai"
    echo "  ./scripts/new-product.sh schema-shield ~/templates/saas"
    exit 1
fi

# Validate product name (lowercase, hyphens only)
if [[ ! "$PRODUCT_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    echo "❌ Invalid product name: $PRODUCT_NAME"
    echo "   Use lowercase letters, numbers, and hyphens"
    echo "   Must start with a letter"
    exit 1
fi

# Check if target already exists
if [ -d "$TARGET_DIR" ]; then
    echo "❌ Directory already exists: $TARGET_DIR"
    exit 1
fi

echo "🚀 Creating new micro-SaaS: $PRODUCT_NAME"
echo "=========================================="
echo ""

# Check if template exists, if not create minimal structure
if [ -d "$TEMPLATE_DIR" ]; then
    echo "📁 Copying template from $TEMPLATE_DIR..."
    cp -r "$TEMPLATE_DIR" "$TARGET_DIR"
else
    echo "📁 No template found. Creating minimal structure..."
    mkdir -p "$TARGET_DIR"
    mkdir -p "$TARGET_DIR/.claude"
    mkdir -p "$TARGET_DIR/scripts"
    mkdir -p "$TARGET_DIR/apps/web/src"
    mkdir -p "$TARGET_DIR/app"

    # Copy workflow files from current project
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

    if [ -f "$PROJECT_DIR/.claude/INSTRUCTIONS.md" ]; then
        cp "$PROJECT_DIR/.claude/INSTRUCTIONS.md" "$TARGET_DIR/.claude/"
    fi
    if [ -f "$PROJECT_DIR/scripts/context.sh" ]; then
        cp "$PROJECT_DIR/scripts/context.sh" "$TARGET_DIR/scripts/"
    fi
    if [ -f "$PROJECT_DIR/scripts/implement.sh" ]; then
        cp "$PROJECT_DIR/scripts/implement.sh" "$TARGET_DIR/scripts/"
    fi
    if [ -f "$PROJECT_DIR/scripts/quick.sh" ]; then
        cp "$PROJECT_DIR/scripts/quick.sh" "$TARGET_DIR/scripts/"
    fi
    if [ -f "$PROJECT_DIR/.cursorrules" ]; then
        cp "$PROJECT_DIR/.cursorrules" "$TARGET_DIR/"
    fi
fi

cd "$TARGET_DIR"

# Update project name in files
echo "📝 Updating project name..."

# Update package.json if exists
if [ -f "apps/web/package.json" ]; then
    sed -i.bak "s/\"name\": \".*\"/\"name\": \"$PRODUCT_NAME\"/" apps/web/package.json
    rm -f apps/web/package.json.bak
fi

if [ -f "package.json" ]; then
    sed -i.bak "s/\"name\": \".*\"/\"name\": \"$PRODUCT_NAME\"/" package.json
    rm -f package.json.bak
fi

# Update fly.toml if exists
if [ -f "fly.toml" ]; then
    sed -i.bak "s/^app = \".*\"/app = \"$PRODUCT_NAME\"/" fly.toml
    rm -f fly.toml.bak
fi

# Create product-specific context
cat > ".claude/context.md" << EOF
# $PRODUCT_NAME - Project Context

## Product
- Name: $PRODUCT_NAME
- Type: Micro-SaaS
- Created: $(date +%Y-%m-%d)

## Tech Stack
- Frontend: React 18, TypeScript, Tailwind, Vite
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Deployment: Fly.io
- Auth: JWT + Google OAuth

## Status
- [ ] Landing page with waitlist
- [ ] Core feature MVP
- [ ] Stripe integration
- [ ] Deployed to production

## Current Focus
[Describe what you're building]

## Notes
[Add product-specific notes here]
EOF

# Initialize git
echo "📦 Initializing git..."
rm -rf .git
git init
git add .
git commit -m "Initial commit: $PRODUCT_NAME"

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ Created $PRODUCT_NAME at $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  cd $TARGET_DIR"
echo "  cursor .                    # Open in Cursor"
echo "  claude 'Build landing page with waitlist for [describe your product]'"
echo ""
