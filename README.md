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
.
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── api
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── endpoints
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           ├── client_requests.py
│   │           ├── clients.py
│   │           ├── dashboard.py
│   │           ├── health.py
│   │           ├── projects.py
│   │           ├── proposals.py
│   │           ├── scope_analyzer.py
│   │           ├── scope_items.py
│   │           └── users.py
│   ├── core
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── security.py
│   ├── db
│   │   ├── __init__.py
│   │   └── session.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── client.py
│   │   ├── client_request.py
│   │   ├── enums.py
│   │   ├── project.py
│   │   ├── proposal.py
│   │   ├── scope_item.py
│   │   └── user.py
│   ├── schemas
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
│   └── services
│       ├── __init__.py
│       └── scope_analyzer
│           ├── __init__.py
│           ├── ai_analyzer.py
│           ├── analyzer.py
│           ├── indicators.py
│           ├── models.py
│           ├── rules_analyzer.py
│           └── service.py
├── apps
│   └── web
│       ├── .env
│       ├── index.html
│       ├── package-lock.json
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── public
│       │   └── shield.svg
│       └── src
│           ├── App.tsx
│           ├── index.css
│           ├── main.tsx
│           ├── api
│           │   ├── __tests__/api.test.ts
│           │   ├── auth.ts
│           │   ├── client.ts
│           │   ├── clients.ts
│           │   ├── dashboard.ts
│           │   ├── index.ts
│           │   ├── projects.ts
│           │   ├── proposals.ts
│           │   ├── requests.ts
│           │   └── scope.ts
│           ├── components
│           │   ├── ui
│           │   │   ├── Alert.tsx
│           │   │   ├── Avatar.tsx
│           │   │   ├── Badge.tsx
│           │   │   ├── Button.tsx
│           │   │   ├── Card.tsx
│           │   │   ├── Dropdown.tsx
│           │   │   ├── EmptyState.tsx
│           │   │   ├── Input.tsx
│           │   │   ├── Loading.tsx
│           │   │   ├── Modal.tsx
│           │   │   ├── ProfilePage.tsx
│           │   │   ├── ProgressBar.tsx
│           │   │   ├── Select.tsx
│           │   │   ├── Skeleton.tsx
│           │   │   ├── Spinner.tsx
│           │   │   ├── Table.tsx
│           │   │   ├── Tabs.tsx
│           │   │   ├── Textarea.tsx
│           │   │   ├── Toast.tsx
│           │   │   └── index.ts
│           │   └── Breadcrumb.tsx
│           ├── hooks
│           │   ├── __tests__
│           │   │   ├── useClients.test.tsx
│           │   │   ├── useProjects.test.tsx
│           │   │   ├── useRequests.test.tsx
│           │   │   └── useScope.test.tsx
│           │   ├── index.ts
│           │   ├── useApi.ts
│           │   ├── useAuth.ts
│           │   ├── useClients.ts
│           │   ├── useProjects.ts
│           │   ├── useRequests.ts
│           │   └── useScope.ts
│           ├── layouts
│           │   ├── AppLayout.tsx
│           │   ├── Header.tsx
│           │   ├── MobileNav.tsx
│           │   ├── PageHeader.tsx
│           │   ├── Sidebar.tsx
│           │   └── index.ts
│           ├── pages
│           │   ├── index.ts
│           │   ├── auth
│           │   │   ├── LoginPage.tsx
│           │   │   ├── ProfilePage.tsx
│           │   │   ├── RegisterPage.tsx
│           │   │   └── index.ts
│           │   ├── clients
│           │   │   ├── ClientDetailPage.tsx
│           │   │   ├── ClientFormModal.tsx
│           │   │   ├── ClientsPage.tsx
│           │   │   ├── DeleteClientModal.tsx
│           │   │   └── index.ts
│           │   └── projects
│           │       ├── __tests__
│           │       │   ├── ProjectDetailPage.test.tsx
│           │       │   └── ProjectsPage.test.tsx
│           │       ├── requests
│           │       │   ├── __tests__
│           │       │   │   ├── RequestCard.test.tsx
│           │       │   │   ├── RequestClassificationBadge.test.tsx
│           │       │   │   ├── RequestFormModal.test.tsx
│           │       │   │   ├── RequestStats.test.tsx
│           │       │   │   └── RequestsTab.test.tsx
│           │       │   ├── AnalysisPanel.tsx
│           │       │   ├── CreateProposalFromRequest.tsx
│           │       │   ├── RequestCard.tsx
│           │       │   ├── RequestClassificationBadge.tsx
│           │       │   ├── RequestFormModal.tsx
│           │       │   ├── RequestStats.tsx
│           │       │   ├── RequestsPage.tsx
│           │       │   ├── RequestsTab.tsx
│           │       │   ├── ScopeCreepAlert.tsx
│           │       │   └── index.ts
│           │       ├── scope
│           │       │   ├── __tests__
│           │       │   │   ├── DeleteScopeItemModal.test.tsx
│           │       │   │   ├── ScopeDragDrop.test.tsx
│           │       │   │   ├── ScopeItemCard.test.tsx
│           │       │   │   ├── ScopeItemForm.test.tsx
│           │       │   │   ├── ScopeProgressCard.test.tsx
│           │       │   │   └── ScopeTab.test.tsx
│           │       │   ├── DeleteScopeItemModal.tsx
│           │       │   ├── ScopeDragDrop.tsx
│           │       │   ├── ScopeItemCard.tsx
│           │       │   ├── ScopeItemForm.tsx
│           │       │   ├── ScopeItemsPage.tsx
│           │       │   ├── ScopeProgressCard.tsx
│           │       │   ├── ScopeTab.tsx
│           │       │   └── index.ts
│           │       ├── ProjectDetailPage.tsx
│           │       ├── ProjectFormModal.tsx
│           │       ├── ProjectHealthGauge.tsx
│           │       ├── ProjectNewPage.tsx
│           │       ├── ProjectStatusBadge.tsx
│           │       ├── ProjectsPage.tsx
│           │       └── index.ts
│           ├── stores
│           │   ├── authStore.ts
│           │   ├── index.ts
│           │   └── uiStore.ts
│           ├── test/setup.ts
│           ├── types/index.ts
│           └── utils
│               ├── cn.ts
│               ├── format.ts
│               └── index.ts
├── docs
│   ├── Build_Prompts.md
│   └── MVP_Specification.md
├── packages
│   ├── api (package.json, src/app.ts, index.ts, server.ts, middleware/, routes/)
│   ├── auth (src/, tests/)
│   ├── client-requests (src/, tests/)
│   ├── clients (src/, tests/)
│   ├── dashboard (src/, tests/)
│   ├── database (package.json, prisma/schema.prisma, src/client.ts, index.ts, seed.ts, tests/)
│   ├── projects (src/, tests/)
│   ├── proposals (src/, tests/)
│   ├── scope-analyzer (src/, tests/, fixtures/)
│   ├── scope-items (src/, tests/)
│   ├── shared (package.json, src/errors/index.ts, src/index.ts, src/types/index.ts, src/utils/index.ts, src/validation/index.ts)
│   └── users (src/, tests/)
├── scripts
├── tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── integration/__init__.py
│   └── unit
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
├── .env
├── .gitignore
├── README.md
├── alembic.ini
├── jest.config.js
├── jest.setup.js
├── package.json
├── pytest.ini
├── requirements.txt
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
