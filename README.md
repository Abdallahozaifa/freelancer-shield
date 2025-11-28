# Freelancer Project Shield

A micro-SaaS tool that detects scope creep and protects freelancer earnings.

## Features

- 🛡️ **Scope Creep Detection** - AI-powered analysis to identify when client requests fall outside original scope
- 📝 **One-Click Proposals** - Instantly generate paid proposals for out-of-scope work
- 📊 **Project Health Dashboard** - Visual tracking of scope, requests, and financials
- 🔐 **Smart Contract Clauses** - Protection against common scope issues

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL
- **Authentication**: JWT tokens, bcrypt password hashing
- **Testing**: pytest, pytest-asyncio

## Project Structure

```
freelancer-shield/
├── .env
├── .env.example
├── .gitignore
├── alembic.ini
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── __init__.py
│   │       │   ├── auth.py
│   │       │   ├── client_requests.py
│   │       │   ├── clients.py
│   │       │   ├── dashboard.py
│   │       │   ├── health.py
│   │       │   ├── projects.py
│   │       │   ├── proposals.py
│   │       │   ├── scope_analyzer.py
│   │       │   ├── scope_items.py
│   │       │   └── users.py
│   │       └── router.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── client.py
│   │   ├── client_request.py
│   │   ├── enums.py
│   │   ├── project.py
│   │   ├── proposal.py
│   │   ├── scope_item.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── client.py
│   │   ├── client_request.py
│   │   ├── dashboard.py
│   │   ├── project.py
│   │   ├── proposal.py
│   │   ├── scope_analyzer.py
│   │   ├── scope_item.py
│   │   └── user.py
│   └── services/
│       ├── __init__.py
│       └── scope_analyzer/
│           ├── __init__.py
│           ├── ai_analyzer.py
│           ├── analyzer.py
│           ├── indicators.py
│           ├── models.py
│           ├── rules_analyzer.py
│           └── service.py
├── apps/
│   └── web/
│       └── src/
│           ├── api/
│           ├── components/
│           ├── hooks/
│           ├── pages/
│           └── store/
├── docs/
│   ├── Build_Prompts.md
│   └── MVP_Specification.md
├── jest.config.js
├── jest.setup.js
├── package.json
├── packages/
│   ├── api/
│   │   ├── package.json
│   │   └── src/
│   │       ├── app.ts
│   │       ├── index.ts
│   │       ├── middleware/
│   │       ├── routes/
│   │       └── server.ts
│   ├── auth/
│   │   ├── src/
│   │   └── tests/
│   ├── client-requests/
│   │   ├── src/
│   │   └── tests/
│   ├── clients/
│   │   ├── src/
│   │   └── tests/
│   ├── dashboard/
│   │   ├── src/
│   │   └── tests/
│   ├── database/
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── index.ts
│   │   │   └── seed.ts
│   │   └── tests/
│   ├── projects/
│   │   ├── src/
│   │   └── tests/
│   ├── proposals/
│   │   ├── src/
│   │   └── tests/
│   ├── scope-analyzer/
│   │   ├── src/
│   │   └── tests/
│   │       └── fixtures/
│   ├── scope-items/
│   │   ├── src/
│   │   └── tests/
│   ├── shared/
│   │   ├── package.json
│   │   └── src/
│   │       ├── errors/
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       ├── utils/
│   │       │   └── index.ts
│   │       └── validation/
│   │           └── index.ts
│   └── users/
│       ├── src/
│       └── tests/
├── pytest.ini
├── README.md
├── requirements.txt
├── scripts/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── integration/
│   │   └── __init__.py
│   └── unit/
│       ├── __init__.py
│       ├── test_auth.py
│       ├── test_client_requests.py
│       ├── test_clients.py
│       ├── test_dashboard.py
│       ├── test_health.py
│       ├── test_projects.py
│       ├── test_proposals.py
│       ├── test_scope_analyzer.py
│       ├── test_scope_items.py
│       └── test_users.py
└── tsconfig.json
```

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start PostgreSQL

```bash
# Using Docker:
docker run -d \
  --name freelancer-shield-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=freelancer_shield \
  -p 5432:5432 \
  postgres:16
```

### 5. Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Access the API

- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/unit/test_auth.py -v
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get access token |
| GET | `/api/v1/auth/me` | Get current user info |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |

## Modules To Be Added

The following modules will be added incrementally:

- [ ] **Users** - Profile management
- [ ] **Clients** - Client CRUD
- [ ] **Projects** - Project CRUD with stats
- [ ] **Scope Items** - Define project scope
- [ ] **Client Requests** - Log and track communications
- [ ] **Scope Analyzer** - AI-powered scope creep detection ⭐
- [ ] **Proposals** - Generate proposals for out-of-scope work
- [ ] **Dashboard** - Aggregate stats and alerts

## License

MIT
