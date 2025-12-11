# QA Test Report

**Generated:** 2025-12-11T05:51:23.565Z
**Framework:** react-vite + fastapi
**Frontend URL:** https://scopeguard.fly.dev
**API URL:** https://scopeguard.fly.dev/api/v1
**Authentication:** ❌ Not authenticated


---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 106 |
| Passed | 48 |
| Failed | 22 |
| Skipped | 36 |
| **Pass Rate** | 69% |

---

## Discovery Summary

| Category | Count |
|----------|-------|
| API Endpoints | 84 |
| Data Models | 6 |
| UI Routes | 23 |
| Protected Routes | 0 |

---

## Test Results by Phase

### Authentication

Passed: 0 | Failed: 2

**Failed:**
- ❌ Login - Method not allowed - check API base path (405)
- ❌ Register - Method not allowed - check API base path (405)

### Public API Tests

Passed: 10 | Failed: 19

**Failed:**
- ❌ POST /{project_id}/scope - Method not allowed - check API base path (405)
- ❌ POST /scope-analyzer/analyze/{request_id} - Method not allowed - check API base path (405)
- ❌ POST /scope-analyzer/analyze-project/{project_id} - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/proposals - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/proposals/{proposal_id}/send - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/proposals/{proposal_id}/accept - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/proposals/{proposal_id}/decline - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/requests/{request_id}/create-proposal - Method not allowed - check API base path (405)
- ❌ POST /{project_id}/requests - Method not allowed - check API base path (405)
- ❌ PUT /settings - Method not allowed - check API base path (405)
- ❌ POST /clients/{client_id}/invite - Method not allowed - check API base path (405)
- ❌ POST /invoices/{invoice_id}/view - Method not allowed - check API base path (405)
- ❌ POST /messages - Method not allowed - check API base path (405)
- ❌ PUT /messages/{message_id}/read - Method not allowed - check API base path (405)
- ❌ POST /contracts/{contract_id}/sign - Method not allowed - check API base path (405)
- ❌ POST /google/token - Method not allowed - check API base path (405)
- ❌ DELETE /{project_id} - Method not allowed - check API base path (405)
- ❌ PUT /{client_id} - Method not allowed - check API base path (405)
- ❌ DELETE /{client_id} - Method not allowed - check API base path (405)

**Passed:**
- ✅ GET /{project_id}/scope/progress (71ms)
- ✅ GET /{project_id}/proposals/stats (77ms)
- ✅ GET /{project_id}/proposals/{proposal_id} (75ms)
- ✅ GET /{project_id}/requests/{request_id} (75ms)
- ✅ GET /invoices (73ms)
- ✅ GET /files (76ms)
- ✅ GET /messages (72ms)
- ✅ GET /contracts (73ms)
- ✅ GET /{project_id} (73ms)
- ✅ GET /{client_id} (75ms)

### Protected API Tests

Passed: 0 | Failed: 0

**Skipped:** 5 tests (No authentication token)

### CRUD Flows

Passed: 0 | Failed: 0

**Skipped:** 31 tests (No authentication token)

### Public UI Tests

Passed: 38 | Failed: 1

**Failed:**
- ❌ Page Load: * - Server not reachable

**Passed:**
- ✅ Page Load: /privacy (73ms)
- ✅ Page Load: /support (72ms)
- ✅ Page Load: /dashboard (73ms)
- ✅ Page Load: /profile (75ms)
- ✅ Page Load: /clients (72ms)
- ✅ Page Load: /clients/:id (75ms)
- ✅ Page Load: /projects (70ms)
- ✅ Page Load: /projects/new (75ms)
- ✅ Page Load: /projects/:id (72ms)
- ✅ Page Load: /projects/:id/edit (74ms)
- ✅ Page Load: /projects/:id/scope/new (72ms)
- ✅ Page Load: /projects/:id/scope/edit (71ms)
- ✅ Page Load: /projects/:id/requests/new (72ms)
- ✅ Page Load: /projects/:id/requests/edit (76ms)
- ✅ Page Load: /projects/:id/proposals/new (73ms)
- ✅ Page Load: /projects/:id/proposals/edit (75ms)
- ✅ Page Load: /scope-items (71ms)
- ✅ Page Load: /requests (75ms)
- ✅ Page Load: /proposals (74ms)
- ✅ Page Load: /portal (72ms)
- ✅ Page Load: /settings (74ms)
- ✅ Page Load: /settings/billing (72ms)
- ✅ Navigation: clients section (86ms)
- ✅ Navigation: projects section (74ms)
- ✅ Navigation: settings section (74ms)
- ✅ Form: /profile (70ms)
- ✅ Form: /projects/new (73ms)
- ✅ Form: /projects/:id/edit (76ms)
- ✅ Form: /projects/:id/scope/new (73ms)
- ✅ Form: /projects/:id/scope/edit (72ms)
- ✅ Form: /projects/:id/requests/new (73ms)
- ✅ Form: /projects/:id/requests/edit (74ms)
- ✅ Form: /projects/:id/proposals/new (72ms)
- ✅ Form: /projects/:id/proposals/edit (71ms)
- ✅ Form: /settings (75ms)
- ✅ Form: /settings/billing (75ms)
- ✅ Login Form Validation (75ms)
- ✅ Registration Form (73ms)

---

## Recommendations

### Fixes Needed

1. **Login** [Authentication]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **Register** [Authentication]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/scope** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /scope-analyzer/analyze/{request_id}** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /scope-analyzer/analyze-project/{project_id}** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/proposals** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/proposals/{proposal_id}/send** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/proposals/{proposal_id}/accept** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/proposals/{proposal_id}/decline** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/requests/{request_id}/create-proposal** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /{project_id}/requests** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **PUT /settings** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /clients/{client_id}/invite** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /invoices/{invoice_id}/view** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).
1. **POST /messages** [Public API Tests]
   - Method not allowed. Check API base path (may need /api/v1 prefix).


---

## Test Configuration

```json
{
  "baseUrl": "{{BASE_URL}}",
  "apiUrl": "{{API_URL}}",
  "timeout": 30000,
  "retries": 1,
  "parallel": false,
  "auth": {
    "type": "jwt",
    "tokenHeader": "Authorization: Bearer {token}",
    "loginEndpoint": "POST /login",
    "credentials": {
      "email": "{{TEST_EMAIL}}",
      "password": "{{TEST_PASSWORD}}"
    },
    "credentialFields": [
      "email"
    ]
  },
  "apiBasePath": "/api/v1"
}
```

---

*Generated by DevLoop QA - Autonomous Test Runner*
