#!/bin/bash
# screenshot.sh - Take screenshots of URLs using Playwright
#
# Usage: ./scripts/screenshot.sh <url> [viewport]
#
# Examples:
#   ./scripts/screenshot.sh 'https://scopeguard.fly.dev/projects/xxx/requests'
#   ./scripts/screenshot.sh 'https://scopeguard.fly.dev/login' mobile
#   ./scripts/screenshot.sh 'https://scopeguard.fly.dev/login' desktop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCREENSHOTS_DIR="$PROJECT_DIR/.claude/screenshots"

URL="$1"
VIEWPORT="${2:-desktop}"

if [ -z "$URL" ]; then
    echo "Usage: ./scripts/screenshot.sh <url> [viewport]"
    echo ""
    echo "Viewports:"
    echo "  desktop (default) - 1920x1080"
    echo "  mobile            - 375x812 (iPhone X)"
    echo "  tablet            - 768x1024 (iPad)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/screenshot.sh 'https://scopeguard.fly.dev/login'"
    echo "  ./scripts/screenshot.sh 'https://scopeguard.fly.dev/login' mobile"
    exit 1
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFE_URL=$(echo "$URL" | sed 's|https\?://||' | sed 's|[/:?&=]|_|g' | cut -c1-50)
FILENAME="${TIMESTAMP}_${VIEWPORT}_${SAFE_URL}.png"
FILEPATH="$SCREENSHOTS_DIR/$FILENAME"

echo "📸 Taking screenshot..."
echo "   URL: $URL"
echo "   Viewport: $VIEWPORT"

# Set viewport dimensions
case "$VIEWPORT" in
    mobile)
        WIDTH=375
        HEIGHT=812
        ;;
    tablet)
        WIDTH=768
        HEIGHT=1024
        ;;
    desktop|*)
        WIDTH=1920
        HEIGHT=1080
        ;;
esac

# Create a temporary Node.js script for Playwright
TEMP_SCRIPT=$(mktemp /tmp/screenshot_XXXXXX.mjs)
cat > "$TEMP_SCRIPT" << EOF
import { chromium } from 'playwright';

const url = process.argv[2];
const filepath = process.argv[3];
const width = parseInt(process.argv[4]);
const height = parseInt(process.argv[5]);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2, // Retina quality
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait a bit for any animations to settle
    await page.waitForTimeout(1000);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log('Screenshot saved: ' + filepath);
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
EOF

# Run the script with npx playwright
npx playwright install chromium --quiet 2>/dev/null || true
node "$TEMP_SCRIPT" "$URL" "$FILEPATH" "$WIDTH" "$HEIGHT"

# Cleanup
rm -f "$TEMP_SCRIPT"

if [ -f "$FILEPATH" ]; then
    echo ""
    echo "✅ Screenshot saved:"
    echo "   $FILEPATH"
    echo ""
    echo "   File size: $(ls -lh "$FILEPATH" | awk '{print $5}')"

    # Also save as latest for easy reference
    LATEST="$SCREENSHOTS_DIR/latest_${VIEWPORT}.png"
    cp "$FILEPATH" "$LATEST"
    echo "   Also saved as: $LATEST"
else
    echo "❌ Failed to save screenshot"
    exit 1
fi
