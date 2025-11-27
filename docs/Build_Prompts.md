# Module Build Prompts for Freelancer Project Shield
## Ready-to-Use Claude Prompts

---

# PROMPT 1: M01-Database Module

Copy this entire prompt into a new Claude conversation:

```
Build the M01-database module for Freelancer Project Shield - a freelancer tool that detects scope creep.

## Overview
This module defines all database schemas and provides the Prisma client for the entire application.

## Tech Stack
- PostgreSQL database
- Prisma ORM
- TypeScript

## Directory Structure to Create
```
M01-database/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── client.ts          # Prisma client singleton
│   ├── seed.ts            # Seed data for development
│   └── index.ts           # Export everything
├── tests/
│   └── schema.test.ts     # Database tests
├── package.json
├── tsconfig.json
└── README.md
```

## Schema Requirements

Create these models with proper relationships:

### User
- id (uuid, primary key)
- email (unique)
- passwordHash
- name
- createdAt, updatedAt
- Relations: has many Clients, has many Projects

### Client
- id (uuid)
- userId (foreign key to User)
- name, email, company, notes
- createdAt, updatedAt
- Relations: belongs to User, has many Projects

### Project
- id (uuid)
- userId, clientId (foreign keys)
- name, description
- status (enum: DRAFT, ACTIVE, COMPLETED, ARCHIVED)
- budget (decimal)
- startDate, endDate
- Relations: has many ScopeItems, ClientRequests, Proposals

### ScopeItem
- id (uuid)
- projectId (foreign key)
- title, description, category
- estimatedHours (decimal)
- isCompleted (boolean)
- order (int for drag-drop reordering)
- Relations: can be linked to ClientRequests

### ClientRequest
- id (uuid)
- projectId (foreign key)
- linkedScopeId (optional foreign key to ScopeItem)
- content (the request text)
- source (enum: MANUAL, EMAIL, SLACK, FORM)
- classification (enum: PENDING, IN_SCOPE, OUT_OF_SCOPE, CLARIFICATION_NEEDED, REVISION)
- confidence (decimal 0-1)
- reasoning (AI explanation)
- status (enum: NEW, REVIEWED, ACCEPTED, CONVERTED_TO_PROPOSAL, DECLINED)
- estimatedHours
- Relations: can have one Proposal

### Proposal
- id (uuid)
- projectId (foreign key)
- requestId (optional unique foreign key - one proposal per request)
- title, description
- price (decimal)
- estimatedHours
- status (enum: DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED)
- sentAt, respondedAt

## Test Cases to Implement

```typescript
describe('Database Schema', () => {
  beforeAll(async () => { /* connect to test db */ })
  afterAll(async () => { /* disconnect */ })
  beforeEach(async () => { /* clean tables */ })

  describe('User operations', () => {
    test('should create a user with valid data')
    test('should enforce unique email constraint')
    test('should auto-generate uuid for id')
    test('should set createdAt automatically')
  })

  describe('Client operations', () => {
    test('should create a client linked to user')
    test('should enforce userId foreign key')
    test('should cascade delete clients when user deleted')
  })

  describe('Project operations', () => {
    test('should create project with client and user')
    test('should default status to DRAFT')
    test('should handle null budget')
  })

  describe('ScopeItem operations', () => {
    test('should create scope items for project')
    test('should track completion status')
    test('should maintain order for sorting')
  })

  describe('ClientRequest operations', () => {
    test('should create request linked to project')
    test('should optionally link to scope item')
    test('should store classification results')
    test('should default classification to PENDING')
  })

  describe('Proposal operations', () => {
    test('should create proposal for project')
    test('should link to client request (unique)')
    test('should enforce one proposal per request')
  })

  describe('Referential integrity', () => {
    test('should prevent deleting user with projects')
    test('should cascade delete scope items with project')
    test('should set requestId null when request deleted')
  })
})
```

## Seed Data

Create seed.ts that generates:
- 2 test users
- 3 clients per user
- 2 projects per client
- 5 scope items per project
- 10 client requests (mix of classifications)
- 3 proposals

## Deliverables

1. Complete Prisma schema with all enums and relations
2. client.ts exporting a singleton Prisma client
3. seed.ts with realistic test data
4. All test cases passing
5. package.json with scripts: `db:push`, `db:seed`, `db:reset`, `test`
6. README with setup instructions

## Constraints

- Use strict TypeScript
- All decimal fields should use @db.Decimal(10, 2) for money, @db.Decimal(5, 1) for hours
- Add proper indexes for foreign keys
- Use uuid for all primary keys
- Include proper onDelete behaviors (CASCADE vs SET NULL)
```

---

# PROMPT 2: M02-Auth Module

Copy this entire prompt into a new Claude conversation (after M01 is complete):

```
Build the M02-auth module for Freelancer Project Shield.

## Prerequisites
- M01-database module is complete
- Import Prisma client from '../M01-database/src/client'

## Overview
Handle user authentication: registration, login, JWT tokens, and route protection middleware.

## Directory Structure
```
M02-auth/
├── src/
│   ├── auth.service.ts      # Business logic
│   ├── auth.controller.ts   # Express route handlers
│   ├── auth.middleware.ts   # JWT verification middleware
│   ├── auth.routes.ts       # Express router
│   ├── auth.types.ts        # TypeScript interfaces
│   ├── jwt.utils.ts         # Token generation/validation
│   ├── validation.ts        # Input validation schemas
│   └── index.ts
├── tests/
│   ├── auth.service.test.ts
│   ├── auth.controller.test.ts
│   └── auth.middleware.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### POST /api/auth/register
Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Success Response (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

Error Responses:
- 400: Validation error (weak password, invalid email)
- 409: Email already exists

### POST /api/auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Success Response (200):
```json
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt-token"
}
```

Error: 401 for invalid credentials

### GET /api/auth/me
Headers: `Authorization: Bearer <token>`

Success Response (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

Error: 401 for invalid/missing token

## Service Functions

```typescript
// auth.service.ts
interface AuthService {
  register(email: string, password: string, name: string): Promise<{ user: User; token: string }>
  login(email: string, password: string): Promise<{ user: User; token: string }>
  validateToken(token: string): Promise<User>
  hashPassword(password: string): Promise<string>
  comparePasswords(plain: string, hash: string): Promise<boolean>
}
```

## Middleware

```typescript
// auth.middleware.ts
// Attaches user to request if valid token
// Returns 401 if no token or invalid token

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
  }
}

function authMiddleware(req, res, next): void
```

## Validation Rules

- Email: valid email format
- Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
- Name: min 2 characters, max 100

## Security Requirements

- Use bcrypt with cost factor 12 for password hashing
- JWT tokens expire in 7 days
- Never return passwordHash in any response
- Validate all inputs before processing
- Use constant-time comparison for passwords

## Test Cases

```typescript
describe('Auth Service', () => {
  test('hashPassword should return different hash than input')
  test('hashPassword should generate unique hashes for same password')
  test('comparePasswords should return true for matching')
  test('comparePasswords should return false for non-matching')
  test('register should create user and return token')
  test('register should throw for duplicate email')
  test('login should return token for valid credentials')
  test('login should throw for invalid password')
  test('login should throw for non-existent user')
  test('validateToken should return user for valid token')
  test('validateToken should throw for expired token')
  test('validateToken should throw for malformed token')
})

describe('Auth Controller', () => {
  test('POST /register returns 201 with user and token')
  test('POST /register returns 400 for invalid email')
  test('POST /register returns 400 for weak password')
  test('POST /register returns 409 for duplicate email')
  test('POST /login returns 200 with token')
  test('POST /login returns 401 for wrong password')
  test('GET /me returns user data with valid token')
  test('GET /me returns 401 without token')
})

describe('Auth Middleware', () => {
  test('should attach user to request with valid token')
  test('should call next() with valid token')
  test('should return 401 without Authorization header')
  test('should return 401 with malformed token')
  test('should return 401 with expired token')
})
```

## Environment Variables

```
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

## Deliverables

1. All source files with full TypeScript types
2. All 12+ test cases passing
3. Input validation using Zod or Joi
4. Proper error handling with custom error classes
5. README with API documentation and usage examples
```

---

# PROMPT 3: M08-Scope Analyzer (CORE MODULE)

This is the core differentiator - can be built in parallel with M01/M02:

```
Build the M08-scope-analyzer module for Freelancer Project Shield.

## Overview
This is the CORE differentiator of the product - an AI-powered analyzer that determines if a client request falls within the agreed project scope.

## Key Insight
This module is a PURE FUNCTION with NO database dependencies. It takes scope + request as input and returns classification. This allows it to be built and tested completely independently.

## Directory Structure
```
M08-scope-analyzer/
├── src/
│   ├── analyzer.service.ts    # Main service with analyze function
│   ├── ai-analyzer.ts         # OpenAI implementation
│   ├── rules-analyzer.ts      # Rule-based fallback (no API needed)
│   ├── analyzer.factory.ts    # Returns appropriate implementation
│   ├── types.ts               # All TypeScript interfaces
│   ├── prompts.ts             # AI prompt templates
│   └── index.ts
├── tests/
│   ├── analyzer.test.ts       # Main test suite
│   ├── rules.test.ts          # Rule-based engine tests
│   ├── fixtures/              # Test data
│   │   ├── web-project.json
│   │   ├── design-project.json
│   │   └── requests.json
│   └── mocks/
│       └── openai.mock.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Core Types

```typescript
// types.ts

interface ScopeItem {
  title: string;
  description: string | null;
  category: string | null;
}

interface AnalysisInput {
  projectDescription: string;
  scopeItems: ScopeItem[];
  requestContent: string;
}

type ScopeClassification = 
  | 'IN_SCOPE'           // Clearly within agreed scope
  | 'OUT_OF_SCOPE'       // New work not in scope
  | 'CLARIFICATION_NEEDED'  // Ambiguous, needs discussion
  | 'REVISION'           // Change to existing scope item

interface AnalysisResult {
  classification: ScopeClassification;
  confidence: number;        // 0.0 to 1.0
  reasoning: string;         // Human-readable explanation
  matchedScopeItemIndex: number | null;  // Which scope item is most relevant
  suggestedAction: 'accept' | 'propose' | 'clarify';
  scopeCreepIndicators: string[];  // Detected red flag phrases
}

interface AnalyzerConfig {
  useAI: boolean;
  openAIApiKey?: string;
  model?: string;
  confidenceThreshold?: number;
}
```

## Main Service Interface

```typescript
// analyzer.service.ts

class ScopeAnalyzer {
  constructor(config: AnalyzerConfig)
  
  async analyze(input: AnalysisInput): Promise<AnalysisResult>
  
  // Batch analysis for multiple requests
  async analyzeBatch(
    projectDescription: string,
    scopeItems: ScopeItem[],
    requests: string[]
  ): Promise<AnalysisResult[]>
}
```

## Rule-Based Implementation (MVP/Fallback)

Implement keyword matching for when AI is not available:

```typescript
// rules-analyzer.ts

const SCOPE_CREEP_INDICATORS = [
  'also', 'additionally', 'one more thing', 'quick addition',
  'while you\'re at it', 'can you also', 'small favor',
  'shouldn\'t take long', 'real quick', 'easy change',
  'just add', 'throw in', 'one more', 'by the way'
];

const CLARIFICATION_INDICATORS = [
  'does this include', 'what about', 'how will', 'can you explain',
  'is it possible', 'would it be', 'clarify'
];

const REVISION_INDICATORS = [
  'change', 'update', 'modify', 'revise', 'different',
  'instead', 'swap', 'replace', 'redo'
];

function analyzeWithRules(input: AnalysisInput): AnalysisResult {
  // 1. Check for scope creep indicator phrases
  // 2. Check if request mentions any scope item keywords
  // 3. Calculate confidence based on matches
  // 4. Return classification
}
```

## AI Implementation

```typescript
// ai-analyzer.ts

const SYSTEM_PROMPT = `You are a scope analysis assistant for freelancers. 
Your job is to protect freelancers from unpaid work by identifying when client 
requests fall outside the agreed project scope.

Be vigilant for "scope creep" - requests disguised as small asks that actually 
represent significant additional work. Common patterns:
- "Can you also..." 
- "While you're at it..."
- "This should be quick..."
- "Just one more thing..."

These phrases often precede out-of-scope requests.`;

const ANALYSIS_PROMPT = `
PROJECT DESCRIPTION:
{projectDescription}

AGREED SCOPE ITEMS:
{scopeItems}

CLIENT REQUEST:
"{requestContent}"

Analyze if this request falls within the agreed scope.

Respond in this exact JSON format:
{
  "classification": "IN_SCOPE" | "OUT_OF_SCOPE" | "CLARIFICATION_NEEDED" | "REVISION",
  "confidence": 0.0-1.0,
  "reasoning": "Clear explanation of your analysis",
  "matchedScopeItemIndex": number or null,
  "suggestedAction": "accept" | "propose" | "clarify",
  "scopeCreepIndicators": ["list", "of", "detected", "phrases"]
}
`;

async function analyzeWithAI(
  input: AnalysisInput, 
  apiKey: string
): Promise<AnalysisResult>
```

## Test Cases

```typescript
describe('Scope Analyzer', () => {
  // Test fixture: Web development project
  const webProject = {
    description: 'Build a 5-page marketing website with contact form',
    scopeItems: [
      { title: 'Homepage', description: 'Hero section, features, testimonials', category: 'design' },
      { title: 'About page', description: 'Company history and team', category: 'design' },
      { title: 'Services page', description: 'List of 4 services', category: 'design' },
      { title: 'Contact page', description: 'Contact form with name, email, message', category: 'development' },
      { title: 'Blog page', description: 'List of latest 5 blog posts', category: 'development' }
    ]
  };

  describe('IN_SCOPE classification', () => {
    test('should classify "Can you add team photos to the about page?" as IN_SCOPE', async () => {
      const result = await analyzer.analyze({
        ...webProject,
        requestContent: 'Can you add team photos to the about page?'
      });
      expect(result.classification).toBe('IN_SCOPE');
      expect(result.matchedScopeItemIndex).toBe(1); // About page
      expect(result.suggestedAction).toBe('accept');
    });

    test('should classify "Lets finalize the homepage hero text" as IN_SCOPE')
    test('should match request to correct scope item')
    test('should have high confidence for clear in-scope requests')
  });

  describe('OUT_OF_SCOPE classification', () => {
    test('should classify "Can you also build us an e-commerce store?" as OUT_OF_SCOPE', async () => {
      const result = await analyzer.analyze({
        ...webProject,
        requestContent: 'Can you also build us an e-commerce store?'
      });
      expect(result.classification).toBe('OUT_OF_SCOPE');
      expect(result.scopeCreepIndicators).toContain('also');
      expect(result.suggestedAction).toBe('propose');
    });

    test('should classify "Add a live chat widget" as OUT_OF_SCOPE')
    test('should classify "We need a members-only area" as OUT_OF_SCOPE')
    test('should detect "shouldn\'t take long" as scope creep indicator')
    test('should detect "quick addition" as scope creep indicator')
    test('should detect "while you\'re at it" as scope creep indicator')
  });

  describe('CLARIFICATION_NEEDED classification', () => {
    test('should classify "Does the contact form include file uploads?" as CLARIFICATION_NEEDED')
    test('should classify "What animations will the homepage have?" as CLARIFICATION_NEEDED')
    test('should suggest "clarify" action for ambiguous requests')
  });

  describe('REVISION classification', () => {
    test('should classify "Can we change the color scheme?" as REVISION')
    test('should classify "I want to update the services list" as REVISION')
    test('should link to relevant scope item when revision is detected')
  });

  describe('Confidence scoring', () => {
    test('should return confidence > 0.8 for clear out-of-scope requests')
    test('should return confidence < 0.6 for ambiguous requests')
    test('should increase confidence when multiple indicators present')
  });

  describe('Scope creep detection', () => {
    test('should detect multiple scope creep indicators in one request')
    test('should return empty indicators array for legitimate requests')
  });

  describe('Batch analysis', () => {
    test('should analyze multiple requests efficiently')
    test('should maintain consistent classification across batch')
  });
});

describe('Rules Engine', () => {
  test('should work without API key')
  test('should detect all scope creep indicator phrases')
  test('should match request keywords to scope items')
  test('should calculate confidence based on match strength')
});
```

## Test Fixtures

```json
// fixtures/requests.json
{
  "inScope": [
    "Can you finalize the homepage hero section?",
    "Please add the team photos we discussed",
    "Update the contact form styling"
  ],
  "outOfScope": [
    "Can you also build us a mobile app?",
    "We need to add a payment system",
    "Quick addition - add a blog CMS",
    "While you're at it, create our logo",
    "This should be easy - add user accounts"
  ],
  "clarification": [
    "Does the website include SEO?",
    "What happens after someone submits the form?",
    "Will there be animations?"
  ],
  "revision": [
    "Can we change the colors to blue?",
    "I want to update the about page copy",
    "Let's swap the homepage layout"
  ]
}
```

## Deliverables

1. Complete analyzer with both AI and rules-based implementations
2. Factory function to select implementation based on config
3. All 20+ test cases passing (can test rules engine without API)
4. Mock OpenAI responses for testing AI path
5. README with usage examples and accuracy notes
```

---

# Build Order Summary

1. **Day 1**: M01-database, M02-auth (in parallel: M08-scope-analyzer)
2. **Day 2**: M03-users, M04-clients, F01-ui-components
3. **Day 3**: M05-projects, M06-scope-items
4. **Day 4**: M07-client-requests (integrate M08)
5. **Day 5**: M09-proposals, M10-dashboard
6. **Day 6-8**: Frontend pages (F02-F06)
7. **Day 9-10**: Integration tests, deployment

---

# Tips for Building with Claude

1. **One module per conversation** - Start fresh for each module
2. **Paste the full prompt** - Include all context
3. **Request file-by-file if needed** - Ask Claude to generate one file at a time
4. **Run tests immediately** - Verify each module before moving on
5. **Save generated code** - Copy to your local repo after each session

Good luck building! 🚀
