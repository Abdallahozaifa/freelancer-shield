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
├── app/
│   ├── api/
│   │   ├── deps.py              # Shared dependencies (auth, etc.)
│   │   └── v1/
│   │       ├── router.py        # API router aggregator
│   │       └── endpoints/       # Endpoint modules
│   │           ├── auth.py      # Authentication endpoints
│   │           └── health.py    # Health check endpoint
│   ├── core/
│   │   ├── config.py            # Application settings
│   │   └── security.py          # Password hashing, JWT utilities
│   ├── db/
│   │   └── session.py           # Database connection & session
│   ├── models/                  # SQLAlchemy models
│   │   ├── base.py              # Base model with UUID & timestamps
│   │   ├── enums.py             # Shared enums
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── project.py
│   │   ├── scope_item.py
│   │   ├── client_request.py
│   │   └── proposal.py
│   ├── schemas/                 # Pydantic schemas
│   │   └── auth.py
│   ├── services/                # Business logic (to be added)
│   └── main.py                  # FastAPI application
├── tests/
│   ├── conftest.py              # Test fixtures
│   ├── unit/
│   │   ├── test_auth.py
│   │   └── test_health.py
│   └── integration/
├── alembic.ini                  # Alembic migrations config
├── requirements.txt
├── pytest.ini
├── .env.example
└── README.md
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
