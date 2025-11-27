# Freelancer Project Shield - MVP Specification
## Modular Architecture for Claude-Assisted Development

---

# Table of Contents

1. [Product Overview](#product-overview)
2. [Architecture Overview](#architecture-overview)
3. [Module Breakdown](#module-breakdown)
4. [Module Specifications](#module-specifications)
5. [Data Models](#data-models)
6. [API Contracts](#api-contracts)
7. [Build Order & Dependencies](#build-order)
8. [Testing Strategy](#testing-strategy)

---

# Product Overview

## Vision
The first freelancer tool that actively detects scope creep and turns it into revenue.

## Core Value Proposition
- Automatically flag when client requests fall outside original scope
- One-click generation of paid proposals for out-of-scope work
- Visual tracking of scope vs. actual work delivered
- Payment protection alerts when work exceeds paid milestones

## Target User
Freelancers (developers, designers, writers, consultants) who charge fixed project rates and struggle with scope creep.

## MVP Scope
- Web application (React frontend, Node.js backend)
- Core features only: Projects, Scope Tracking, Scope Detection, Proposals
- No mobile app in MVP
- No integrations in MVP (Slack, email later)

---

# Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  UI Components  │  State Management  │  API Client  │  Router   │
└────────┬────────┴────────┬───────────┴──────┬───────┴─────┬─────┘
         │                 │                  │             │
         ▼                 ▼                  ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                      │
├─────────────────────────────────────────────────────────────────┤
│  Auth Middleware  │  Rate Limiting  │  Request Validation       │
└────────┬──────────┴────────┬────────┴──────────┬────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐
│   Module 1  │    │   Module 2  │    │      Module N       │
│    Auth     │    │   Projects  │    │   Scope Detection   │
└──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘
       │                  │                      │
       ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand (state)
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT tokens, bcrypt
- **Testing**: Jest, React Testing Library, Supertest
- **AI**: OpenAI API for scope detection (can be mocked for MVP)

---

# Module Breakdown

## Overview
The application is divided into 10 independent modules. Each module:
- Has its own folder structure
- Has defined inputs/outputs (API contracts)
- Can be built and tested in isolation
- Has no circular dependencies

```
modules/
├── M01-database/           # Schema & migrations
├── M02-auth/               # User authentication
├── M03-users/              # User profile management
├── M04-clients/            # Client management
├── M05-projects/           # Project CRUD
├── M06-scope-items/        # Scope line items
├── M07-client-requests/    # Log client requests
├── M08-scope-analyzer/     # AI scope detection
├── M09-proposals/          # Generate upsell proposals
├── M10-dashboard/          # Analytics & alerts
└── frontend/
    ├── F01-ui-components/  # Shared UI components
    ├── F02-auth-pages/     # Login/Register
    ├── F03-project-pages/  # Project management UI
    ├── F04-scope-pages/    # Scope tracking UI
    ├── F05-proposal-pages/ # Proposal generation UI
    └── F06-dashboard/      # Dashboard UI
```

## Dependency Graph

```
M01-database
    │
    ├── M02-auth ──────────────────────┐
    │       │                          │
    │       ▼                          │
    ├── M03-users                      │
    │       │                          │
    │       ▼                          │
    ├── M04-clients                    │
    │       │                          │
    │       ▼                          │
    ├── M05-projects ◄─────────────────┤
    │       │                          │
    │       ▼                          │
    ├── M06-scope-items                │
    │       │                          │
    │       ▼                          │
    ├── M07-client-requests            │
    │       │                          │
    │       ▼                          │
    ├── M08-scope-analyzer             │
    │       │                          │
    │       ▼                          │
    ├── M09-proposals                  │
    │       │                          │
    │       ▼                          │
    └── M10-dashboard                  │
                                       │
Frontend modules depend on ────────────┘
their corresponding backend modules
```

---

# Module Specifications

---

## M01: Database Module

### Purpose
Define data models and database schema. All other modules depend on this.

### Files to Create
```
M01-database/
├── prisma/
│   └── schema.prisma       # Database schema
├── migrations/             # Auto-generated
├── seed.ts                 # Seed data for testing
├── client.ts               # Prisma client export
└── README.md
```

### Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  clients       Client[]
  projects      Project[]
}

model Client {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  name          String
  email         String?
  company       String?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
}

model Project {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  clientId      String
  client        Client    @relation(fields: [clientId], references: [id])
  name          String
  description   String?
  status        ProjectStatus @default(ACTIVE)
  budget        Decimal?  @db.Decimal(10, 2)
  startDate     DateTime?
  endDate       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  scopeItems      ScopeItem[]
  clientRequests  ClientRequest[]
  proposals       Proposal[]
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

model ScopeItem {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  title         String
  description   String?
  category      String?   // e.g., "design", "development", "content"
  estimatedHours Decimal? @db.Decimal(5, 1)
  isCompleted   Boolean   @default(false)
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  linkedRequests ClientRequest[]
}

model ClientRequest {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  linkedScopeId String?
  linkedScope   ScopeItem? @relation(fields: [linkedScopeId], references: [id])
  
  content       String    // The actual request text
  source        RequestSource @default(MANUAL)
  
  // Scope analysis results
  classification ScopeClassification @default(PENDING)
  confidence    Decimal?  @db.Decimal(3, 2)  // 0.00 to 1.00
  reasoning     String?   // AI explanation
  
  // Status
  status        RequestStatus @default(NEW)
  estimatedHours Decimal? @db.Decimal(5, 1)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  proposal      Proposal?
}

enum RequestSource {
  MANUAL
  EMAIL
  SLACK
  FORM
}

enum ScopeClassification {
  PENDING
  IN_SCOPE
  OUT_OF_SCOPE
  CLARIFICATION_NEEDED
  REVISION
}

enum RequestStatus {
  NEW
  REVIEWED
  ACCEPTED
  CONVERTED_TO_PROPOSAL
  DECLINED
}

model Proposal {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  requestId     String?   @unique
  request       ClientRequest? @relation(fields: [requestId], references: [id])
  
  title         String
  description   String
  price         Decimal   @db.Decimal(10, 2)
  estimatedHours Decimal? @db.Decimal(5, 1)
  
  status        ProposalStatus @default(DRAFT)
  sentAt        DateTime?
  respondedAt   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum ProposalStatus {
  DRAFT
  SENT
  ACCEPTED
  DECLINED
  EXPIRED
}
```

### Test Cases
```typescript
// M01-database/tests/schema.test.ts
describe('Database Schema', () => {
  test('should create a user')
  test('should create a client linked to user')
  test('should create a project linked to client')
  test('should create scope items for a project')
  test('should create client requests')
  test('should link requests to scope items')
  test('should create proposals from requests')
  test('should enforce referential integrity')
  test('should cascade delete appropriately')
})
```

### Build Instructions for Claude
```
PROMPT: "Create the M01-database module for Freelancer Project Shield.

Include:
1. Prisma schema exactly as specified above
2. A seed.ts file that creates sample data for testing
3. A client.ts that exports a configured Prisma client
4. All test cases listed above using Jest
5. README with setup instructions

The module should be completely standalone and testable."
```

---

## M02: Auth Module

### Purpose
Handle user registration, login, JWT token management, and password security.

### Files to Create
```
M02-auth/
├── src/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.middleware.ts
│   ├── auth.routes.ts
│   ├── auth.types.ts
│   └── jwt.utils.ts
├── tests/
│   └── auth.test.ts
└── README.md
```

### API Contract

#### POST /api/auth/register
```typescript
// Request
{
  email: string;      // valid email format
  password: string;   // min 8 chars, 1 uppercase, 1 number
  name: string;       // min 2 chars
}

// Response 201
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;  // JWT token
}

// Response 400
{
  error: "VALIDATION_ERROR";
  message: string;
  fields?: Record<string, string>;
}

// Response 409
{
  error: "EMAIL_EXISTS";
  message: "An account with this email already exists";
}
```

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
}

// Response 200
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// Response 401
{
  error: "INVALID_CREDENTIALS";
  message: "Invalid email or password";
}
```

#### GET /api/auth/me
```typescript
// Headers: Authorization: Bearer <token>

// Response 200
{
  id: string;
  email: string;
  name: string;
}

// Response 401
{
  error: "UNAUTHORIZED";
  message: "Invalid or expired token";
}
```

### Test Cases
```typescript
// M02-auth/tests/auth.test.ts
describe('Auth Module', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data')
    test('should return 400 for invalid email format')
    test('should return 400 for weak password')
    test('should return 409 for duplicate email')
    test('should hash password before storing')
    test('should return valid JWT token')
  })
  
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials')
    test('should return 401 for wrong password')
    test('should return 401 for non-existent email')
    test('should return valid JWT token')
  })
  
  describe('GET /api/auth/me', () => {
    test('should return user data with valid token')
    test('should return 401 without token')
    test('should return 401 with expired token')
    test('should return 401 with invalid token')
  })
  
  describe('Auth Middleware', () => {
    test('should attach user to request with valid token')
    test('should reject requests without token')
    test('should reject requests with malformed token')
  })
})
```

### Build Instructions for Claude
```
PROMPT: "Create the M02-auth module for Freelancer Project Shield.

Dependencies: M01-database (import prisma client from there)

Include:
1. auth.service.ts with register, login, validateToken functions
2. auth.controller.ts with Express route handlers
3. auth.middleware.ts for protecting routes
4. jwt.utils.ts for token generation/validation
5. auth.routes.ts exporting Express router
6. auth.types.ts with TypeScript interfaces
7. All test cases using Jest and Supertest
8. README with API documentation

Security requirements:
- Use bcrypt for password hashing (cost factor 12)
- JWT tokens expire in 7 days
- Validate all inputs
- Never expose password hash in responses"
```

---

## M03: Users Module

### Purpose
User profile management (view, update profile).

### API Contract

#### GET /api/users/profile
```typescript
// Headers: Authorization: Bearer <token>

// Response 200
{
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
```

#### PATCH /api/users/profile
```typescript
// Request
{
  name?: string;
  email?: string;
}

// Response 200
{
  id: string;
  email: string;
  name: string;
}
```

### Test Cases
```typescript
describe('Users Module', () => {
  test('should get current user profile')
  test('should update user name')
  test('should update user email')
  test('should return 409 if email already taken')
  test('should require authentication')
})
```

---

## M04: Clients Module

### Purpose
CRUD operations for freelancer's clients.

### API Contract

#### GET /api/clients
```typescript
// Response 200
{
  clients: Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    projectCount: number;
    createdAt: string;
  }>;
}
```

#### POST /api/clients
```typescript
// Request
{
  name: string;
  email?: string;
  company?: string;
  notes?: string;
}

// Response 201
{
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
}
```

#### GET /api/clients/:id
#### PATCH /api/clients/:id
#### DELETE /api/clients/:id

### Test Cases
```typescript
describe('Clients Module', () => {
  test('should list all clients for user')
  test('should not show other users clients')
  test('should create a new client')
  test('should get single client by id')
  test('should update client')
  test('should delete client')
  test('should return 404 for non-existent client')
  test('should include project count in list')
})
```

---

## M05: Projects Module

### Purpose
CRUD operations for projects.

### API Contract

#### GET /api/projects
```typescript
// Query params: ?status=ACTIVE&clientId=xxx

// Response 200
{
  projects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    client: { id: string; name: string };
    budget: number | null;
    scopeItemCount: number;
    completedScopeCount: number;
    outOfScopeRequestCount: number;
    startDate: string | null;
    endDate: string | null;
  }>;
}
```

#### POST /api/projects
```typescript
// Request
{
  clientId: string;
  name: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

// Response 201
{ ...project }
```

#### GET /api/projects/:id
```typescript
// Response 200 - Full project with scope items
{
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  client: { id: string; name: string; email: string };
  scopeItems: Array<ScopeItem>;
  recentRequests: Array<ClientRequest>;
  stats: {
    totalScopeItems: number;
    completedScopeItems: number;
    inScopeRequests: number;
    outOfScopeRequests: number;
    pendingRequests: number;
  };
}
```

### Test Cases
```typescript
describe('Projects Module', () => {
  test('should list all projects for user')
  test('should filter by status')
  test('should filter by client')
  test('should create project with client')
  test('should get project with full details')
  test('should update project')
  test('should change project status')
  test('should delete project')
  test('should return 404 for non-existent project')
  test('should calculate scope stats correctly')
})
```

---

## M06: Scope Items Module

### Purpose
Define and manage the original scope of a project.

### API Contract

#### GET /api/projects/:projectId/scope
```typescript
// Response 200
{
  scopeItems: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    estimatedHours: number | null;
    isCompleted: boolean;
    order: number;
    linkedRequestCount: number;
  }>;
  summary: {
    total: number;
    completed: number;
    totalEstimatedHours: number;
  };
}
```

#### POST /api/projects/:projectId/scope
```typescript
// Request
{
  title: string;
  description?: string;
  category?: string;
  estimatedHours?: number;
}

// Response 201
{ ...scopeItem }
```

#### PATCH /api/projects/:projectId/scope/:scopeId
#### DELETE /api/projects/:projectId/scope/:scopeId

#### POST /api/projects/:projectId/scope/reorder
```typescript
// Request
{
  items: Array<{ id: string; order: number }>;
}
```

#### PATCH /api/projects/:projectId/scope/:scopeId/complete
```typescript
// Response 200
{ ...scopeItem, isCompleted: true }
```

### Test Cases
```typescript
describe('Scope Items Module', () => {
  test('should list scope items for project')
  test('should create scope item')
  test('should update scope item')
  test('should delete scope item')
  test('should mark scope item as complete')
  test('should reorder scope items')
  test('should calculate summary stats')
  test('should not access other users scope items')
})
```

---

## M07: Client Requests Module

### Purpose
Log and manage client requests/communications.

### API Contract

#### GET /api/projects/:projectId/requests
```typescript
// Query: ?classification=OUT_OF_SCOPE&status=NEW

// Response 200
{
  requests: Array<{
    id: string;
    content: string;
    source: RequestSource;
    classification: ScopeClassification;
    confidence: number | null;
    reasoning: string | null;
    status: RequestStatus;
    linkedScope: { id: string; title: string } | null;
    proposal: { id: string; status: ProposalStatus } | null;
    createdAt: string;
  }>;
}
```

#### POST /api/projects/:projectId/requests
```typescript
// Request
{
  content: string;
  source?: RequestSource;
  autoAnalyze?: boolean;  // If true, triggers scope analysis
}

// Response 201
{ ...request }
```

#### PATCH /api/projects/:projectId/requests/:requestId
```typescript
// Request - Manual classification override
{
  classification?: ScopeClassification;
  linkedScopeId?: string;
  status?: RequestStatus;
}
```

#### POST /api/projects/:projectId/requests/:requestId/analyze
```typescript
// Trigger AI analysis on existing request

// Response 200
{
  classification: ScopeClassification;
  confidence: number;
  reasoning: string;
  suggestedScopeItem: { id: string; title: string } | null;
}
```

### Test Cases
```typescript
describe('Client Requests Module', () => {
  test('should list requests for project')
  test('should filter by classification')
  test('should create request manually')
  test('should update request classification')
  test('should link request to scope item')
  test('should trigger analysis on request')
  test('should not access other users requests')
})
```

---

## M08: Scope Analyzer Module

### Purpose
AI-powered analysis to determine if a request is in-scope or out-of-scope.

### Design
This is a **pure function** module - given project scope and a request, return classification.

### API Contract (Internal Service)

```typescript
// scope-analyzer.service.ts

interface AnalysisInput {
  projectDescription: string;
  scopeItems: Array<{
    title: string;
    description: string | null;
    category: string | null;
  }>;
  requestContent: string;
}

interface AnalysisResult {
  classification: ScopeClassification;
  confidence: number;      // 0.0 to 1.0
  reasoning: string;       // Human-readable explanation
  matchedScopeItemIndex: number | null;  // Index of most relevant scope item
  suggestedAction: 'accept' | 'propose' | 'clarify';
}

async function analyzeRequest(input: AnalysisInput): Promise<AnalysisResult>
```

### Implementation Options

#### Option A: OpenAI API (Production)
```typescript
const prompt = `
You are a scope analysis assistant for freelancers.

PROJECT DESCRIPTION:
${input.projectDescription}

AGREED SCOPE ITEMS:
${input.scopeItems.map((s, i) => `${i+1}. ${s.title}: ${s.description}`).join('\n')}

CLIENT REQUEST:
"${input.requestContent}"

Analyze if this request falls within the agreed scope.

Respond in JSON:
{
  "classification": "IN_SCOPE" | "OUT_OF_SCOPE" | "CLARIFICATION_NEEDED" | "REVISION",
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "matchedScopeItemIndex": number or null,
  "suggestedAction": "accept" | "propose" | "clarify"
}
`;
```

#### Option B: Rule-Based (MVP/Testing)
```typescript
function analyzeRequestSimple(input: AnalysisInput): AnalysisResult {
  const requestLower = input.requestContent.toLowerCase();
  
  // Check for scope creep indicators
  const outOfScopeIndicators = [
    'also', 'additionally', 'one more thing', 'quick addition',
    'while you\'re at it', 'can you also', 'small favor',
    'shouldn\'t take long', 'real quick', 'easy change'
  ];
  
  const clarificationIndicators = [
    'what about', 'how will', 'can you explain', 'does this include'
  ];
  
  const revisionIndicators = [
    'change', 'update', 'modify', 'revise', 'different'
  ];
  
  // Simple keyword matching for MVP
  // Returns classification based on indicators found
}
```

### Test Cases
```typescript
describe('Scope Analyzer Module', () => {
  const sampleProject = {
    description: 'Build a 5-page marketing website',
    scopeItems: [
      { title: 'Homepage design', description: 'Hero, features, CTA' },
      { title: 'About page', description: 'Team bios and history' },
      { title: 'Contact form', description: 'Name, email, message fields' },
    ]
  };
  
  describe('IN_SCOPE classification', () => {
    test('should classify "Can you add the team photos to about page" as IN_SCOPE')
    test('should classify "Lets finalize the hero section copy" as IN_SCOPE')
    test('should match to correct scope item')
  })
  
  describe('OUT_OF_SCOPE classification', () => {
    test('should classify "Can you also build us a blog" as OUT_OF_SCOPE')
    test('should classify "We need an e-commerce section too" as OUT_OF_SCOPE')
    test('should classify "Quick addition - add a chat widget" as OUT_OF_SCOPE')
    test('should detect "shouldn\'t take long" as scope creep indicator')
  })
  
  describe('CLARIFICATION_NEEDED classification', () => {
    test('should classify "Does the homepage include animations?" as CLARIFICATION_NEEDED')
    test('should classify "What CMS will you use?" as CLARIFICATION_NEEDED')
  })
  
  describe('REVISION classification', () => {
    test('should classify "Can we change the color scheme" as REVISION')
    test('should classify "I want to update the copy on homepage" as REVISION')
  })
  
  describe('Confidence scores', () => {
    test('should have high confidence for clear out-of-scope requests')
    test('should have lower confidence for ambiguous requests')
  })
})
```

### Build Instructions for Claude
```
PROMPT: "Create the M08-scope-analyzer module for Freelancer Project Shield.

This is a PURE FUNCTION module with no database dependencies.

Include:
1. scope-analyzer.service.ts with the main analyzeRequest function
2. Two implementations:
   - analyzeWithAI() using OpenAI API
   - analyzeWithRules() using keyword matching (for testing/MVP)
3. A factory function that returns the appropriate implementation
4. Comprehensive test cases covering all classification types
5. Mock responses for testing without API calls

The module should be completely standalone and testable without database."
```

---

## M09: Proposals Module

### Purpose
Generate and manage proposals for out-of-scope work.

### API Contract

#### GET /api/projects/:projectId/proposals
```typescript
// Response 200
{
  proposals: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    estimatedHours: number | null;
    status: ProposalStatus;
    request: { id: string; content: string } | null;
    createdAt: string;
    sentAt: string | null;
  }>;
}
```

#### POST /api/projects/:projectId/proposals
```typescript
// Request - Manual creation
{
  title: string;
  description: string;
  price: number;
  estimatedHours?: number;
}

// Response 201
{ ...proposal }
```

#### POST /api/projects/:projectId/requests/:requestId/create-proposal
```typescript
// Request - Generate from out-of-scope request
{
  price: number;
  estimatedHours?: number;
  customTitle?: string;
  customDescription?: string;
}

// Response 201 - Auto-generates title/description from request
{
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedHours: number | null;
  status: 'DRAFT';
  request: { id: string; content: string };
}
```

#### PATCH /api/projects/:projectId/proposals/:proposalId
```typescript
// Request
{
  title?: string;
  description?: string;
  price?: number;
  status?: ProposalStatus;
}
```

#### POST /api/projects/:projectId/proposals/:proposalId/send
```typescript
// Marks as sent (future: actually sends email)

// Response 200
{ ...proposal, status: 'SENT', sentAt: string }
```

### Test Cases
```typescript
describe('Proposals Module', () => {
  test('should list proposals for project')
  test('should create proposal manually')
  test('should generate proposal from out-of-scope request')
  test('should auto-generate title from request content')
  test('should update proposal')
  test('should mark proposal as sent')
  test('should link proposal to request')
  test('should update request status when proposal created')
})
```

---

## M10: Dashboard Module

### Purpose
Aggregate stats and alerts across all projects.

### API Contract

#### GET /api/dashboard
```typescript
// Response 200
{
  summary: {
    activeProjects: number;
    totalClients: number;
    pendingRequests: number;
    outOfScopeThisMonth: number;
    proposalsSentThisMonth: number;
    proposalsAcceptedThisMonth: number;
    revenueRecoveredThisMonth: number;  // Sum of accepted proposals
  };
  
  alerts: Array<{
    type: 'OUT_OF_SCOPE' | 'SCOPE_CREEP_PATTERN' | 'PAYMENT_DUE';
    severity: 'low' | 'medium' | 'high';
    message: string;
    projectId: string;
    projectName: string;
    requestId?: string;
  }>;
  
  recentActivity: Array<{
    type: 'request' | 'proposal' | 'classification';
    message: string;
    projectId: string;
    timestamp: string;
  }>;
}
```

#### GET /api/dashboard/projects/:projectId/health
```typescript
// Response 200
{
  scopeHealth: {
    score: number;  // 0-100
    totalItems: number;
    completedItems: number;
    percentComplete: number;
  };
  requestHealth: {
    total: number;
    inScope: number;
    outOfScope: number;
    pending: number;
    outOfScopePercentage: number;
  };
  financialHealth: {
    budget: number | null;
    proposalsSent: number;
    proposalsAccepted: number;
    additionalRevenue: number;
  };
  alerts: Array<Alert>;
}
```

### Test Cases
```typescript
describe('Dashboard Module', () => {
  test('should return summary stats')
  test('should generate out-of-scope alerts')
  test('should calculate revenue recovered')
  test('should return recent activity')
  test('should calculate project health score')
  test('should only include users own data')
})
```

---

# Frontend Modules

## F01: UI Components

### Shared Components to Build
```typescript
// Each component should be built with Storybook stories

components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── Button.stories.tsx
├── Input/
├── Select/
├── Modal/
├── Card/
├── Badge/
├── Alert/
├── Table/
├── EmptyState/
├── LoadingSpinner/
├── ProgressBar/
├── Tabs/
└── Toast/
```

### Build Instructions for Claude
```
PROMPT: "Create the F01-ui-components module.

Build these React components with TypeScript and Tailwind CSS:
1. Button (variants: primary, secondary, danger, ghost; sizes: sm, md, lg)
2. Input (with label, error state, helper text)
3. Modal (with header, body, footer slots)
4. Card (with header, body variants)
5. Badge (for status indicators)
6. Alert (success, warning, error, info)
7. ProgressBar (with percentage label)
8. EmptyState (icon, title, description, action)

Each component should:
- Be fully typed with TypeScript
- Have unit tests with React Testing Library
- Be accessible (ARIA labels, keyboard navigation)
- Use Tailwind CSS for styling"
```

---

## F02-F06: Feature Pages

Each frontend feature module follows the same structure:

```
F03-project-pages/
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectList.tsx
│   └── ProjectForm.tsx
├── hooks/
│   └── useProjects.ts
├── pages/
│   ├── ProjectsPage.tsx
│   └── ProjectDetailPage.tsx
├── api/
│   └── projects.api.ts
└── tests/
    └── projects.test.tsx
```

---

# Build Order

Build modules in this exact order to satisfy dependencies:

```
PHASE 1: Foundation
├── M01-database       (Day 1)
├── M02-auth           (Day 1)
└── F01-ui-components  (Day 1-2)

PHASE 2: Core Entities
├── M03-users          (Day 2)
├── M04-clients        (Day 2)
├── M05-projects       (Day 3)
└── M06-scope-items    (Day 3)

PHASE 3: Core Features
├── M07-client-requests (Day 4)
├── M08-scope-analyzer  (Day 4)
└── M09-proposals       (Day 5)

PHASE 4: Dashboard & Polish
├── M10-dashboard      (Day 5)
└── Frontend Pages     (Day 6-8)

PHASE 5: Integration
├── End-to-end tests   (Day 9)
└── Deployment setup   (Day 10)
```

---

# Testing Strategy

## Unit Tests (Per Module)
- Each module has its own test file
- Mock external dependencies
- Test all success and error cases
- Target: 80% coverage

## Integration Tests
```typescript
// tests/integration/scope-flow.test.ts
describe('Scope Detection Flow', () => {
  test('create project → add scope → log request → analyze → create proposal')
})

// tests/integration/auth-flow.test.ts  
describe('Auth Flow', () => {
  test('register → login → access protected route → logout')
})
```

## E2E Tests (Playwright)
```typescript
// tests/e2e/freelancer-workflow.spec.ts
describe('Freelancer Workflow', () => {
  test('full workflow: create client, project, scope, handle out-of-scope request')
})
```

---

# Claude Build Prompts

Use these prompts to build each module with Claude:

## Template Prompt
```
Build module [MODULE_NAME] for Freelancer Project Shield.

## Context
[Paste relevant section from this spec]

## Dependencies
- Imports from: [list modules]
- Exports to: [list modules]

## Requirements
1. TypeScript with strict mode
2. Express for routes
3. Prisma for database
4. Jest for testing
5. All API contracts must match spec exactly

## Deliverables
1. All source files as specified
2. All test cases passing
3. README with setup instructions

## Constraints
- No external state - all state in database
- All functions must be typed
- All errors must be handled
- All inputs must be validated
```

---

# Summary

This MVP spec provides:

1. **10 Backend Modules** - Each independently buildable and testable
2. **6 Frontend Modules** - Matching backend with shared components
3. **Clear API Contracts** - Exact request/response formats
4. **Comprehensive Test Cases** - For every module
5. **Build Order** - Respecting dependencies
6. **Claude Prompts** - Ready to use for each module

Each module can be built in a single Claude session, tested in isolation, and integrated incrementally.

**Next Step**: Start with M01-database to establish the foundation.
