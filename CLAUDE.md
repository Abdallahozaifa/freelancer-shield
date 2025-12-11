# ScopeGuard Development Instructions

## After Every Change
1. Deploy: `fly deploy --app scopeguard --ha=false`
2. Run Standard QA: `devloop qa --no-auth`
3. Run Live Flow Tests: `devloop qa --live --api-url https://scopeguard.fly.dev/api/v1`
4. Verify pass rate 80%+

## Live Tests
The `--live` flag tests real user flows:
- Register new user
- Login and get token
- /auth/me verification
- Onboarding field check
- Complete onboarding
- Onboarding persistence
- Create client
- Create project

## Stack
- Backend: FastAPI + PostgreSQL
- Frontend: React + Vite + Tailwind
- Hosting: Fly.io

## Key URLs
- Production: https://scopeguard.fly.dev
- API: https://scopeguard.fly.dev/api/v1
- Health: https://scopeguard.fly.dev/api/v1/health

## Database
- App: scopeguard-db
- Run migrations: `fly ssh console -a scopeguard` then `alembic upgrade head`

## Current State
- Onboarding: Full-page wizard (FIXED - added has_completed_onboarding to UserResponse schema)
- Security: JWT tokens, hashed portal tokens

## Key Files
- API schemas: `app/schemas/auth.py` (UserResponse), `app/schemas/user.py` (UserProfile)
- User model: `app/models/user.py`
- Auth endpoints: `app/api/v1/endpoints/auth.py`
- Frontend routing: `apps/web/src/App.tsx`
- Auth store: `apps/web/src/stores/authStore.ts`

## Recent Fixes
- 2024-12-11: Fixed onboarding redirect by adding `has_completed_onboarding` to `UserResponse` schema in `app/schemas/auth.py`

---
