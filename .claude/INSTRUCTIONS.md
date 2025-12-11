# Project Instructions

> Claude CLI reads this file automatically on every run.

## Tech Stack
- Frontend: React 18, TypeScript, Tailwind CSS, Vite, TanStack Query
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- Deployment: Fly.io (app: scopeguard, db: scopeguard-db)
- Auth: JWT + Google OAuth
- Payments: Stripe

## Directory Structure
```
apps/web/src/
├── pages/              # Route components
│   ├── auth/           # Login, Register, Password reset
│   ├── projects/       # Projects, requests, scope, proposals
│   │   ├── requests/   # RequestsTab, RequestCard, RequestEditPage
│   │   ├── scope/      # ScopeTab, ScopeItemEditPage
│   │   └── proposals/  # ProposalsTab, ProposalEditPage
│   ├── landing/        # Landing page
│   └── settings/       # Billing
├── components/         # Shared UI components
│   └── ui/             # Button, Input, Modal, Select, etc.
├── hooks/              # Custom hooks (useRequests, useProjects, etc.)
├── stores/             # Zustand stores (authStore)
├── types/              # TypeScript types
├── utils/              # Utility functions (cn, format)
└── layouts/            # AppLayout

app/                    # Backend (FastAPI)
├── api/
│   └── v1/
│       └── endpoints/  # auth, projects, clients, billing, etc.
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic
└── core/               # Config, security, deps
```

## Conventions

### Frontend
- Use existing UI components from `components/ui/` (Button, Input, Modal, etc.)
- API calls through hooks in `hooks/` (useRequests, useProjects, etc.)
- Use `cn()` utility from `utils/cn` for conditional classNames
- Tailwind responsive: mobile-first (sm:, md:, lg:)
- Add `touch-manipulation` class to clickable mobile elements
- Add `onTouchEnd={(e) => e.stopPropagation()}` for mobile dropdowns
- Use TanStack Query for data fetching (already configured)

### Backend
- All routes under `/api/v1/`
- Use dependency injection via `Depends()` for DB sessions and auth
- Pydantic schemas for all request/response models
- Async endpoints with SQLAlchemy

### Mobile-First Design
- Base styles for mobile, then sm:, md:, lg: breakpoints
- Separate edit pages for mobile (e.g., RequestEditPage, ScopeItemEditPage)
- Desktop uses modals, mobile navigates to full pages
- Check: `window.innerWidth < 1024` for mobile detection

### Auth Pages
- Two-panel layout on desktop (left: mockup, right: form)
- Single responsive form component

## Commands
```bash
# Frontend
cd apps/web && npm run dev           # Dev server (port 5173)
cd apps/web && npm run build         # Build
cd apps/web && npm run lint          # Lint

# Backend
uvicorn app.main:app --reload        # Dev server (port 8000)
pytest                               # Tests
alembic upgrade head                 # Migrations

# Deploy
fly deploy                           # Deploy to Fly.io
fly logs                             # View logs
fly postgres connect -a scopeguard-db -d scopeguard  # DB access
```

## Task Workflow
1. Read `.claude/task.md` for current task
2. Read `.claude/codebase.md` for fresh codebase context
3. Implement changes following this project's patterns
4. Run type checking and fix errors
5. Write results to `.claude/result.md`

## Error Handling
- If tests fail, fix and re-run (max 5 attempts)
- If type errors, fix them before proceeding
- If lint errors, run auto-fix first: `npm run lint -- --fix`
- Write any unresolved issues to `.claude/errors.md`

## Debugging Production Issues

### Before Claiming a Fix Works
1. Run `./scripts/debug.sh` to fetch recent production logs
2. Check `.claude/logs.txt` for full context
3. Check `.claude/errors.txt` for filtered errors
4. If errors exist, the fix is NOT complete

### After Deploying a Fix
1. Run `./scripts/quick.sh deploy-test` to deploy and verify
2. This will:
   - Deploy to Fly.io
   - Wait 30 seconds for stabilization
   - Fetch logs and check for errors
   - Report success/failure

### Debug Commands
```bash
./scripts/debug.sh              # Fetch all logs (last 10 min)
./scripts/debug.sh requests     # Filter logs by keyword
./scripts/quick.sh logs         # Quick logs (5 min) → .claude/logs.txt
./scripts/quick.sh logs-error   # Error logs (30 min) → .claude/errors.txt
./scripts/quick.sh deploy-test  # Deploy + verify no errors
```

### Output Files
- `.claude/logs.txt` - Full production logs
- `.claude/errors.txt` - Filtered error logs
- `.claude/result.md` - Implementation results

### Debug Loop Workflow
If a fix attempt fails:
1. Read `.claude/errors.txt` for the actual error
2. Identify root cause in the codebase
3. Fix the issue
4. Deploy with `fly deploy`
5. Run `./scripts/debug.sh` to verify
6. Loop until `.claude/errors.txt` shows no related errors

## Verification Steps

### After UI Changes
1. Take screenshots to verify: `./scripts/quick.sh screenshot 'https://scopeguard.fly.dev/page' desktop`
2. Check mobile view: `./scripts/quick.sh screenshot 'https://scopeguard.fly.dev/page' mobile`
3. Run AI visual check: `./scripts/quick.sh visual 'https://scopeguard.fly.dev/page' 'Check description'`

### After API Changes
1. Test the endpoint: `./scripts/quick.sh api GET /projects/{id}/requests`
2. Test with body: `./scripts/quick.sh api PATCH /projects/{id}/requests/{id} '{"status":"active"}'`
3. Check logs for errors: `./scripts/quick.sh logs-error`

### Always Verify in Production
- Don't just test locally - verify the fix works in production
- Use `./scripts/quick.sh deploy-test` to deploy and check for errors
- Use `./scripts/quick.sh verify both` to run UI + API verification

### Verification Commands
```bash
./scripts/quick.sh screenshot <url> [viewport]  # Take screenshot
./scripts/quick.sh api <method> <endpoint> [body]  # Test API
./scripts/quick.sh verify ui <url>              # UI verification
./scripts/quick.sh verify api                   # API verification (from task.md)
./scripts/quick.sh verify both                  # Both UI and API
./scripts/quick.sh visual <url> [check]         # AI visual check
```

### Task Template
Use the task template for structured tasks:
```bash
./scripts/quick.sh template  # Copy template to .claude/task.md
```

Include API Test and UI Verify sections for automated verification.

## Environment Variables
```bash
SCOPEGUARD_TOKEN       # Auth token for API testing
ANTHROPIC_API_KEY      # Required for visual-check.sh (Claude Vision)
SCOPEGUARD_API_URL     # Optional: override API URL (default: https://scopeguard.fly.dev/api/v1)
```

## Automated QA Testing

### Quick QA Commands
```bash
./scripts/quick.sh smoke       # Quick health check (API + UI accessible)
./scripts/quick.sh qa-api      # Run API endpoint tests
./scripts/quick.sh qa-ui       # Run UI tests with screenshots
./scripts/quick.sh qa          # Full QA suite (api + ui)
./scripts/quick.sh qa-fix      # Auto-fix failures with Claude CLI
./scripts/quick.sh qa-report   # Generate QA report
./scripts/quick.sh e2e         # Run Playwright E2E tests
```

### QA Documentation
- `.claude/features.md` - Complete feature list with API/UI test matrix
- `.claude/test-accounts.md` - Test account setup and credentials
- `tests/e2e/flows.spec.ts` - Playwright E2E test flows

### QA Workflow
1. After making changes: `./scripts/quick.sh smoke` (quick check)
2. Before merging: `./scripts/quick.sh qa` (full suite)
3. If tests fail: `./scripts/quick.sh qa-fix` (auto-fix loop)
4. Review report: `./scripts/quick.sh qa-report`

### Authentication for QA

QA tests auto-authenticate using credentials from environment variables or cached tokens.

**Option 1: Environment Variables**
```bash
export QA_EMAIL="qa@scopeguard.test"
export QA_PASSWORD="your-password"
```

**Option 2: Manual Token**
```bash
source ./scripts/get-token.sh  # Authenticates and exports SCOPEGUARD_TOKEN
```

**How it works:**
1. Scripts first check for `SCOPEGUARD_TOKEN` env var
2. Then check cached token at `.claude/.token`
3. If no token, auto-authenticate using `QA_EMAIL`/`QA_PASSWORD`
4. Token is cached for reuse (auto-refreshed if expired)

**Creating a test user:**
```bash
# Via Fly.io postgres
fly postgres connect -a scopeguard-db -d scopeguard -c "
INSERT INTO users (id, email, full_name, hashed_password, is_active, is_verified, created_at, updated_at)
VALUES (gen_random_uuid(), 'qa@scopeguard.test', 'QA Test User',
        '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYz0NJ0YQvKe',
        true, true, NOW(), NOW());"
```

### QA Environment Variables
```bash
QA_EMAIL="qa@scopeguard.test"      # Test account email
QA_PASSWORD="QATest123!"           # Test account password
SCOPEGUARD_API="https://scopeguard.fly.dev/api/v1"
SCOPEGUARD_URL="https://scopeguard.fly.dev"
ANTHROPIC_API_KEY="..."            # For Claude Vision UI checks
```

### QA Output Files
- `.claude/qa/api-results.json` - API test results
- `.claude/qa/ui-results.json` - UI test results
- `.claude/qa/screenshots/` - UI screenshots
- `.claude/qa/qa-report-*.md` - Generated reports

## Claude CLI Auto-Approve Mode

This project is configured for auto-approve mode, allowing Claude CLI to run without permission prompts.

### Configuration Files
- `.claude/settings.local.json` - Project-level permission rules (auto-approve common tools)
- `scripts/ai.sh` - Wrapper script with `--dangerously-skip-permissions` flag

### Running Claude CLI Without Prompts

**Option 1: Quick command (recommended)**
```bash
./scripts/quick.sh ai "Your prompt here"
./scripts/quick.sh ai-task  # Run on current task
```

**Option 2: Direct wrapper**
```bash
./scripts/ai.sh "Fix all TypeScript errors"
./scripts/ai.sh --print "Read .claude/task.md and implement the task"
./scripts/ai.sh -c  # Continue previous conversation
```

**Option 3: Standard claude command**
```bash
claude --dangerously-skip-permissions "Your prompt"
```

### Auto-Approved Operations
The `.claude/settings.local.json` file auto-approves:
- File operations: Read, Write, Edit, Glob, Grep
- Shell commands: git, npm, npx, node, python3, pytest
- Project scripts: `./scripts/*`
- Fly.io: fly deploy, logs, secrets, postgres, ssh
- Build tools: tsc, playwright, alembic, uvicorn

### Adding New Auto-Approve Rules
Edit `.claude/settings.local.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(your-command:*)",
      "Read(*)",
      "Write(*)"
    ]
  }
}
```

### Security Warning
Auto-approve mode gives Claude full control over file operations and shell commands.
Only use in trusted projects. The first run of `ai.sh` shows a warning banner.

## Key Files Reference
- `apps/web/src/App.tsx` - Routes configuration
- `apps/web/src/stores/authStore.ts` - Auth state
- `apps/web/src/hooks/useRequests.ts` - Request API hooks
- `apps/web/src/pages/projects/requests/RequestsTab.tsx` - Request list view
- `app/api/v1/endpoints/` - All API endpoints
