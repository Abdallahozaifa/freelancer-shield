# Codebase Context: freelancer-shield

> Auto-generated: Tue Dec  9 19:54:19 EST 2025
> This file is read by Cursor and Claude CLI for context

## File Structure
```
./app/core/config.py
./app/core/security.py
./app/core/__init__.py
./app/__init__.py
./app/models/user.py
./app/models/enums.py
./app/models/subscription.py
./app/models/client.py
./app/models/__init__.py
./app/models/proposal.py
./app/models/scope_item.py
./app/models/base.py
./app/models/project.py
./app/models/client_request.py
./app/schemas/auth.py
./app/schemas/user.py
./app/schemas/billing.py
./app/schemas/client.py
./app/schemas/__init__.py
./app/schemas/proposal.py
./app/schemas/dashboard.py
./app/schemas/scope_item.py
./app/schemas/scope_analyzer.py
./app/schemas/project.py
./app/schemas/client_request.py
./app/db/session.py
./app/db/__init__.py
./app/api/v1/endpoints/scope_items.py
./app/api/v1/endpoints/auth.py
./app/api/v1/endpoints/billing.py
./app/api/v1/endpoints/users.py
./app/api/v1/endpoints/client_requests.py
./app/api/v1/endpoints/health.py
./app/api/v1/endpoints/__init__.py
./app/api/v1/endpoints/dashboard.py
./app/api/v1/endpoints/clients.py
./app/api/v1/endpoints/scope_analyzer.py
./app/api/v1/endpoints/projects.py
./app/api/v1/endpoints/proposals.py
./app/api/v1/__init__.py
./app/api/v1/router.py
./app/api/deps.py
./app/api/__init__.py
./app/main.py
./app/services/stripe_service.py
./app/services/scope_analyzer/service.py
./app/services/scope_analyzer/models.py
./app/services/scope_analyzer/analyzer.py
./app/services/scope_analyzer/rules_analyzer.py
./app/services/scope_analyzer/__init__.py
```

## Git Status
```
?? .claude/
?? .cursorrules
?? scripts/
```

## Recent Changes
```
7830ead add files
8b3af22 add files
ce8e12b add files
9c91dca add files
bed5966 add files
01ca0c1 add files
45d6735 add files
93c3b1e add files
0ecef3c add files
7cdf360 add files
```

## Frontend Dependencies
```json
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@react-oauth/google": "^0.12.2",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "clsx": "^2.1.1",
    "date-fns": "^3.2.0",
    "lucide-react": "^0.312.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.66.1",
    "react-router-dom": "^6.22.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.25.76",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@tanstack/react-query-devtools": "^5.17.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^4.0.14",
    "@vitest/ui": "^4.0.14",
    "autoprefixer": "^10.4.17",
    "jsdom": "^27.2.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
```

## Backend Dependencies
```
# Core Framework
fastapi==0.109.2
uvicorn[standard]==0.27.1
python-multipart==0.0.9

# Database
sqlalchemy==2.0.25
asyncpg==0.29.0
alembic==1.13.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.2
google-auth>=2.22.0
google-auth-oauthlib>=1.0.0
google-auth-httplib2>=0.1.0

# Validation & Settings
pydantic==2.6.1
pydantic-settings==2.1.0
email-validator==2.1.0.post1

# HTTP Client (for AI API calls)
httpx==0.26.0

# Email
aiosmtplib==3.0.1

# Payments
stripe==7.0.0

# Testing
pytest==7.4.4
pytest-asyncio==0.23.4
pytest-cov==4.1.0

# Development
python-dotenv==1.0.1
```

## Key Types
```typescript
// Enums
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type RequestSource = 'email' | 'chat' | 'call' | 'meeting' | 'other';
export type ScopeClassification = 'in_scope' | 'out_of_scope' | 'clarification_needed' | 'revision' | 'pending';
export type RequestStatus = 'new' | 'analyzed' | 'addressed' | 'proposal_sent' | 'declined';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

// Models
export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  is_active: boolean;
  picture?: string | null;
  auth_provider?: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  project_count: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ClientCreate {
  name: string;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
}

export interface ClientUpdate {
  name?: string;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  client_name: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  hourly_rate: number | null;
  estimated_hours: number | null;
  scope_item_count: number;
  completed_scope_count: number;
  out_of_scope_request_count: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ProjectCreate {
  client_id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  hourly_rate?: number | null;
  estimated_hours?: number | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  hourly_rate?: number | null;
  estimated_hours?: number | null;
}

export interface ScopeItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order: number;
  is_completed: boolean;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeItemCreate {
  title: string;
  description?: string | null;
  order?: number;
  is_completed?: boolean;
  estimated_hours?: number | null;
}

export interface ScopeItemUpdate {
  title?: string;
  description?: string | null;
  order?: number;
  is_completed?: boolean;
  estimated_hours?: number | null;
}

export interface ClientRequest {
  id: string;
  project_id: string;
  linked_scope_item_id: string | null;
  linked_scope_item_title: string | null;
  title: string;
  content: string;
  source: RequestSource;
  status: RequestStatus;
  classification: ScopeClassification | null;
  confidence: number | null;
  analysis_reasoning: string | null;
  suggested_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRequestCreate {
  title: string;
  content: string;
  source?: RequestSource;
}

export interface ClientRequestUpdate {
  title?: string;
  content?: string;
  source?: RequestSource;
  status?: RequestStatus;
  classification?: ScopeClassification | null;
  linked_scope_item_id?: string | null;
}

export interface Proposal {
  id: string;
  project_id: string;
  source_request_id: string | null;
  title: string;
  description: string;
  status: ProposalStatus;
  amount: number;
  estimated_hours: number | null;
  sent_at: string | null;
  responded_at: string | null;
  source_request_title: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ProposalCreate {
  title: string;
  description: string;
  amount: number;
  estimated_hours?: number | null;
  source_request_id?: string | null;
}

export interface ProposalUpdate {
  title?: string;
  description?: string;
  status?: ProposalStatus;
  amount?: number;
  estimated_hours?: number | null;
}

// Dashboard types
export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  total_clients: number;
  total_requests: number;
  out_of_scope_requests: number;
  pending_requests: number;
  total_proposals: number;
  pending_proposals: number;
  accepted_proposals: number;
  total_revenue_protected: number;
  // Additional fields used by dashboard
  revenue_protected: number;
  proposals_accepted: number;
  completed_scope_items: number;
}

export interface Alert {
  id: string;
  type: 'scope_creep' | 'pending_request' | 'proposal_expiring' | 'milestone_overdue';
  severity: 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  project_id: string;
  project_name: string;
  related_id: string | null;
  created_at: string;
}

export interface ProjectHealth {
  project_id: string;
  project_name: string;
  status: ProjectStatus;
  scope_completion_percentage: number;
  scope_items_total: number;
  scope_items_completed: number;
  total_requests: number;
  in_scope_requests: number;
  out_of_scope_requests: number;
  pending_analysis: number;
  scope_creep_ratio: number;
  budget: number | null;
  proposals_sent: number;
  proposals_accepted: number;
  revenue_protected: number;
  health_score: number;
}

export interface RecentActivity {
  type: 'request_created' | 'request_analyzed' | 'proposal_sent' | 'proposal_accepted' | 'scope_completed';
  message: string;
  project_id: string;
  project_name: string;
  timestamp: string;
}

// Scope Analysis types
export interface ScopeAnalysisRequest {
  content: string;
  title?: string;
}

export interface ScopeAnalysisResult {
  classification: ScopeClassification;
  confidence: number;
  reasoning: string;
  suggested_action: string;
  matched_scope_items: string[];
  indicators: ScopeIndicator[];
}

export interface ScopeIndicator {
  type: string;
  description: string;
  weight: number;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  detail: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  business_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  is_new_user: boolean;
}

// Password Reset types
export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  email?: string;
}
```

## API Endpoints
```python
app/api/v1/endpoints/scope_items.py:@router.get(
app/api/v1/endpoints/scope_items.py:@router.post(
app/api/v1/endpoints/scope_items.py:@router.get(
app/api/v1/endpoints/scope_items.py:@router.patch(
app/api/v1/endpoints/scope_items.py:@router.delete(
app/api/v1/endpoints/scope_items.py:@router.post(
app/api/v1/endpoints/auth.py:@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
app/api/v1/endpoints/auth.py:@router.post("/login", response_model=Token)
app/api/v1/endpoints/auth.py:@router.post("/google", response_model=GoogleAuthResponse)
app/api/v1/endpoints/auth.py:@router.post("/google/token", response_model=GoogleAuthResponse)
app/api/v1/endpoints/auth.py:@router.get("/me", response_model=UserResponse)
app/api/v1/endpoints/auth.py:@router.post("/forgot-password", response_model=ForgotPasswordResponse)
app/api/v1/endpoints/auth.py:@router.post("/reset-password", response_model=ResetPasswordResponse)
app/api/v1/endpoints/auth.py:@router.post("/verify-reset-token", response_model=VerifyResetTokenResponse)
app/api/v1/endpoints/billing.py:@router.get("/subscription", response_model=SubscriptionResponse)
app/api/v1/endpoints/billing.py:@router.get("/limits", response_model=PlanLimits)
app/api/v1/endpoints/billing.py:@router.post("/create-checkout-session", response_model=CreateCheckoutResponse)
app/api/v1/endpoints/billing.py:@router.post("/create-portal-session", response_model=CreatePortalResponse)
app/api/v1/endpoints/billing.py:@router.post("/cancel")
app/api/v1/endpoints/billing.py:@router.post("/reactivate")
app/api/v1/endpoints/billing.py:@router.post("/webhook")
app/api/v1/endpoints/users.py:@router.get("/profile", response_model=UserProfile)
app/api/v1/endpoints/users.py:@router.patch("/profile", response_model=UserProfile)
app/api/v1/endpoints/client_requests.py:@router.get(
app/api/v1/endpoints/client_requests.py:@router.post(
app/api/v1/endpoints/client_requests.py:@router.get(
app/api/v1/endpoints/client_requests.py:@router.patch(
app/api/v1/endpoints/client_requests.py:@router.delete(
app/api/v1/endpoints/client_requests.py:@router.post(
app/api/v1/endpoints/health.py:@router.get("")
app/api/v1/endpoints/dashboard.py:@router.get("", response_model=DashboardResponse)
app/api/v1/endpoints/dashboard.py:@router.get("/summary", response_model=DashboardSummary)
app/api/v1/endpoints/dashboard.py:@router.get("/alerts", response_model=list[Alert])
app/api/v1/endpoints/dashboard.py:@router.get("/activity", response_model=list[RecentActivity])
app/api/v1/endpoints/dashboard.py:@router.get("/projects/{project_id}/health", response_model=ProjectHealth)
app/api/v1/endpoints/clients.py:@router.get("", response_model=ClientList)
app/api/v1/endpoints/clients.py:@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
app/api/v1/endpoints/clients.py:@router.get("/{client_id}", response_model=ClientResponse)
app/api/v1/endpoints/clients.py:@router.put("/{client_id}", response_model=ClientResponse)
app/api/v1/endpoints/clients.py:@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
```

## Current Task
# Task: Fix Restore Request 500 Error

## Problem
On the Client Requests → History tab, clicking "Restore" button triggers a PATCH request that returns 500 Internal Server Error.

**Endpoint:** `PATCH /api/v1/projects/{project_id}/requests/{request_id}`
**Error:** 500 Internal Server Error

## Files to Check
- [ ] backend/app/api/v1/endpoints/requests.py (or similar - find the PATCH route)
- [ ] backend/app/services/request_service.py (if exists)
- [ ] backend/app/models/request.py (check the model)

## Debug Steps
1. Find the PATCH endpoint for requests
2. Check what "restore" does - likely changes a status field (e.g., from "archived" or "history" back to "active")
3. Look for:
   - Missing field in the update schema
   - Database constraint violation
   - Null pointer on a relationship
   - Missing error handling
4. Check the server logs: `fly logs -a scopeguard` or local logs

## Likely Fixes
- Schema mismatch between frontend payload and backend expectation
- Status enum doesn't include the restore target value
- Foreign key or relationship issue when restoring

## Verify
```bash
# Run backend tests
cd backend && pytest -v -k request

# Test the endpoint manually
curl -X PATCH http://localhost:8000/api/v1/projects/{project_id}/requests/{request_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

## Success Criteria
- [ ] Restore button works without 500 error
- [ ] Request moves from History tab back to appropriate tab
- [ ] No backend errors in logs
