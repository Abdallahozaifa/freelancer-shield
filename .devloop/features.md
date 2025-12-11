# Project Audit Report

**Generated:** 2025-12-11T19:51:44.324Z
**Project:** /Users/hozaifaabdalla/Desktop/freelancer-project-shield/freelancer-shield

---

## Framework Discovery

| Component | Detected |
|-----------|----------|
| Frontend | react-vite |
| Backend | fastapi |
| Database | postgresql |
| Package Manager | npm |
| Monorepo | No |

---

## Authentication

| Property | Value |
|----------|-------|
| Type | jwt |
| Login Endpoint | POST /login |
| Register Endpoint | POST /register |
| OAuth Providers | google |
| Credential Fields | email |

---

## API Summary

| Metric | Count |
|--------|-------|
| Total Endpoints | 90 |
| Schemas | 0 |
| Base Path | /api/v1 |

### Endpoints by Method

- **GET**: 33
- **PATCH**: 6
- **POST**: 37
- **DELETE**: 9
- **PUT**: 5

---

## Data Models

| Metric | Count |
|--------|-------|
| Entities | 6 |
| Relationships | 0 |
| Enums | 7 |

### Entities

- **PortalSettings** (0 fields)
- **ClientPortalAccess** (0 fields)
- **PortalInvoice** (0 fields)
- **PortalFile** (0 fields)
- **PortalMessage** (0 fields)
- **BaseModel** (0 fields)

---

## UI Routes

| Metric | Count |
|--------|-------|
| Total Routes | 24 |
| Protected Routes | 0 |
| Layouts | 0 |

---

## Generated Tests Summary

| Test Type | Count |
|-----------|-------|
| Auth Tests | 2 |
| API Tests | 40 |
| UI Tests | 40 |
| Flow Tests | 31 |
| **Total** | **113** |

---

## Legacy Feature Matrix

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| {clientId} | - | ✓ | ⚠️ Partial |
| {projectId} | - | ✓ | ⚠️ Partial |
| {token} | - | ✓ | ⚠️ Partial |
| Activity | - | ✓ | ⚠️ Partial |
| Alerts | - | ✓ | ⚠️ Partial |
| AnalysisPanel | ✓ | - | ⚠️ Partial |
| Analyze | - | ✓ | ⚠️ Partial |
| AnalyzeProject | - | ✓ | ⚠️ Partial |
| Auth | - | ✓ | ⚠️ Partial |
| Billing | ✓ | - | ⚠️ Partial |
| Cancel | - | ✓ | ⚠️ Partial |
| Client | ✓ | - | ⚠️ Partial |
| ClientFormModal | ✓ | - | ⚠️ Partial |
| Clients | ✓ | ✓ | ✅ Complete |
| CompleteOnboarding | - | ✓ | ⚠️ Partial |
| Contracts | - | ✓ | ⚠️ Partial |
| CreateCheckoutSession | - | ✓ | ⚠️ Partial |
| CreatePortalSession | - | ✓ | ⚠️ Partial |
| CreateProposalFromRequest | ✓ | - | ⚠️ Partial |
| Dashboard | ✓ | ✓ | ✅ Complete |
| DashboardPage_copy | ✓ | - | ⚠️ Partial |
| DeleteClientModal | ✓ | - | ⚠️ Partial |
| DeleteScopeItemModal | ✓ | - | ⚠️ Partial |
| Files | - | ✓ | ⚠️ Partial |
| ForgotPassword | ✓ | ✓ | ✅ Complete |
| Google | - | ✓ | ⚠️ Partial |
| Invoices | - | ✓ | ⚠️ Partial |
| Landing | ✓ | - | ⚠️ Partial |
| Limits | - | ✓ | ⚠️ Partial |
| Login | ✓ | ✓ | ✅ Complete |
| Me | - | ✓ | ⚠️ Partial |
| Messages | - | ✓ | ⚠️ Partial |
| Onboarding | ✓ | - | ⚠️ Partial |
| Portal | ✓ | - | ⚠️ Partial |
| Privacy | ✓ | - | ⚠️ Partial |
| Profile | ✓ | ✓ | ✅ Complete |
| Project | ✓ | - | ⚠️ Partial |
| ProjectFormModal | ✓ | - | ⚠️ Partial |
| ProjectHealthGauge | ✓ | - | ⚠️ Partial |
| Projects | ✓ | ✓ | ✅ Complete |
| ProjectStatusBadge | ✓ | - | ⚠️ Partial |
| Proposal | ✓ | - | ⚠️ Partial |
| ProposalCard | ✓ | - | ⚠️ Partial |
| ProposalFormModal | ✓ | - | ⚠️ Partial |
| ProposalResponseModal | ✓ | - | ⚠️ Partial |
| ProposalRow | ✓ | - | ⚠️ Partial |
| Proposals | ✓ | - | ⚠️ Partial |
| ProposalsTab | ✓ | - | ⚠️ Partial |
| ProposalStats | ✓ | - | ⚠️ Partial |
| ProposalStatusBadge | ✓ | - | ⚠️ Partial |
| PublicRequest | ✓ | - | ⚠️ Partial |
| Reactivate | - | ✓ | ⚠️ Partial |
| Register | ✓ | ✓ | ✅ Complete |
| Request | ✓ | - | ⚠️ Partial |
| RequestCard | ✓ | - | ⚠️ Partial |
| RequestClassificationBadge | ✓ | - | ⚠️ Partial |
| RequestEditModal | ✓ | - | ⚠️ Partial |
| RequestFormModal | ✓ | - | ⚠️ Partial |
| Requests | ✓ | ✓ | ✅ Complete |
| RequestsTab | ✓ | - | ⚠️ Partial |
| RequestStats | ✓ | - | ⚠️ Partial |
| ResetPassword | ✓ | ✓ | ✅ Complete |
| ScopeCreepAlert | ✓ | - | ⚠️ Partial |
| ScopeDragDrop | ✓ | - | ⚠️ Partial |
| ScopeItem | ✓ | - | ⚠️ Partial |
| ScopeItemCard | ✓ | - | ⚠️ Partial |
| ScopeItemForm | ✓ | - | ⚠️ Partial |
| ScopeItems | ✓ | - | ⚠️ Partial |
| ScopeProgressCard | ✓ | - | ⚠️ Partial |
| ScopeTab | ✓ | - | ⚠️ Partial |
| SendProposalModal | ✓ | - | ⚠️ Partial |
| Settings | ✓ | ✓ | ✅ Complete |
| Subscription | - | ✓ | ⚠️ Partial |
| Summary | - | ✓ | ⚠️ Partial |
| Support | ✓ | - | ⚠️ Partial |
| VerifyResetToken | - | ✓ | ⚠️ Partial |
| Webhook | - | ✓ | ⚠️ Partial |

---

## API Endpoints

| Method | Path | File |
|--------|------|------|
| GET | /profile | app/api/v1/endpoints/users.py |
| PATCH | /profile | app/api/v1/endpoints/users.py |
| PATCH | /complete-onboarding | app/api/v1/endpoints/users.py |
| GET | /{project_id}/scope | app/api/v1/endpoints/scope_items.py |
| POST | /{project_id}/scope | app/api/v1/endpoints/scope_items.py |
| GET | /{project_id}/scope/progress | app/api/v1/endpoints/scope_items.py |
| PATCH | /{project_id}/scope/{item_id} | app/api/v1/endpoints/scope_items.py |
| DELETE | /{project_id}/scope/{item_id} | app/api/v1/endpoints/scope_items.py |
| POST | /{project_id}/scope/reorder | app/api/v1/endpoints/scope_items.py |
| POST | /scope-analyzer/analyze | app/api/v1/endpoints/scope_analyzer.py |
| POST | /scope-analyzer/analyze/{request_id} | app/api/v1/endpoints/scope_analyzer.py |
| POST | /scope-analyzer/analyze-project/{project_id} | app/api/v1/endpoints/scope_analyzer.py |
| GET | /scope-analyzer/requests/{request_id} | app/api/v1/endpoints/scope_analyzer.py |
| GET | /{token} | app/api/v1/endpoints/public_requests.py |
| POST | /{token} | app/api/v1/endpoints/public_requests.py |
| GET | /{project_id}/proposals | app/api/v1/endpoints/proposals.py |
| POST | /{project_id}/proposals | app/api/v1/endpoints/proposals.py |
| POST | /{project_id}/requests/{request_id}/create-proposal | app/api/v1/endpoints/proposals.py |
| GET | /{project_id}/proposals/stats | app/api/v1/endpoints/proposals.py |
| GET | /{project_id}/proposals/{proposal_id} | app/api/v1/endpoints/proposals.py |
| PATCH | /{project_id}/proposals/{proposal_id} | app/api/v1/endpoints/proposals.py |
| POST | /{project_id}/proposals/{proposal_id}/send | app/api/v1/endpoints/proposals.py |
| POST | /{project_id}/proposals/{proposal_id}/accept | app/api/v1/endpoints/proposals.py |
| POST | /{project_id}/proposals/{proposal_id}/decline | app/api/v1/endpoints/proposals.py |
| DELETE | /{project_id}/proposals/{proposal_id} | app/api/v1/endpoints/proposals.py |
| GET | /{project_id} | app/api/v1/endpoints/projects.py |
| GET | /{project_id}/detail | app/api/v1/endpoints/projects.py |
| PATCH | /{project_id} | app/api/v1/endpoints/projects.py |
| DELETE | /{project_id} | app/api/v1/endpoints/projects.py |
| POST | /{project_id}/enable-public-requests | app/api/v1/endpoints/projects.py |
| POST | /{project_id}/disable-public-requests | app/api/v1/endpoints/projects.py |
| POST | /{project_id}/regenerate-public-token | app/api/v1/endpoints/projects.py |
| GET | /settings | app/api/v1/endpoints/portal.py |
| PUT | /settings | app/api/v1/endpoints/portal.py |
| GET | /clients | app/api/v1/endpoints/portal.py |
| POST | /clients/{client_id}/invite | app/api/v1/endpoints/portal.py |
| DELETE | /clients/{client_id}/access | app/api/v1/endpoints/portal.py |
| GET | /invoices | app/api/v1/endpoints/portal.py |
| POST | /invoices | app/api/v1/endpoints/portal.py |
| GET | /invoices/{invoice_id} | app/api/v1/endpoints/portal.py |
| PUT | /invoices/{invoice_id} | app/api/v1/endpoints/portal.py |
| DELETE | /invoices/{invoice_id} | app/api/v1/endpoints/portal.py |
| GET | /files | app/api/v1/endpoints/portal.py |
| POST | /files | app/api/v1/endpoints/portal.py |
| DELETE | /files/{file_id} | app/api/v1/endpoints/portal.py |
| GET | /messages | app/api/v1/endpoints/portal.py |
| POST | /messages | app/api/v1/endpoints/portal.py |
| PUT | /messages/{message_id}/read | app/api/v1/endpoints/portal.py |
| GET | /contracts | app/api/v1/endpoints/portal.py |
| POST | /contracts | app/api/v1/endpoints/portal.py |
| ... | ... | ... |

*Showing first 50 of 90 endpoints*

---

## Next Steps

1. Run `devloop qa` to execute all generated tests
2. Run `devloop qa --api-only` for API tests only
3. Run `devloop qa --ui-only` for UI tests only
4. Check `discovery.json` for full discovery data
5. Check `generated-tests.json` for test definitions

---

*Generated by DevLoop CLI*
