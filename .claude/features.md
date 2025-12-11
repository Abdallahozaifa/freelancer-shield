# ScopeGuard Features - QA Test Matrix

> Auto-generated feature list for automated QA testing
> Last updated: 2024

## Frontend Routes

### Public Routes (No Auth Required)
| Route | Description | Priority |
|-------|-------------|----------|
| `/` | Landing page | HIGH |
| `/login` | User login | HIGH |
| `/register` | User registration | HIGH |
| `/forgot-password` | Password reset request | MEDIUM |
| `/reset-password` | Password reset form | MEDIUM |
| `/privacy` | Privacy policy | LOW |
| `/support` | Support page | LOW |

### Protected Routes (Auth Required)
| Route | Description | Priority |
|-------|-------------|----------|
| `/dashboard` | Main dashboard | HIGH |
| `/profile` | User profile | MEDIUM |
| `/clients` | Client list | HIGH |
| `/clients/:id` | Client detail | HIGH |
| `/projects` | Project list | HIGH |
| `/projects/new` | Create project | HIGH |
| `/projects/:id` | Project detail (tabs: overview, scope, requests, proposals) | HIGH |
| `/projects/:id/edit` | Edit project | MEDIUM |
| `/projects/:id/scope/add` | Add scope item | HIGH |
| `/projects/:id/requests/add` | Add client request | HIGH |
| `/projects/:id/requests/edit` | Edit client request | HIGH |
| `/projects/:id/proposals/add` | Create proposal | HIGH |
| `/projects/:id/proposals/:proposalId` | View proposal | HIGH |
| `/settings/billing` | Billing & subscription | MEDIUM |

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| POST | `/register` | Register new user | HIGH |
| POST | `/login` | User login | HIGH |
| POST | `/google` | Google OAuth | MEDIUM |
| GET | `/me` | Get current user | HIGH |
| POST | `/forgot-password` | Request password reset | MEDIUM |
| POST | `/reset-password` | Reset password | MEDIUM |

### Projects (`/api/v1/projects`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/` | List projects | HIGH |
| POST | `/` | Create project | HIGH |
| GET | `/{id}` | Get project | HIGH |
| PATCH | `/{id}` | Update project | HIGH |
| DELETE | `/{id}` | Delete project | MEDIUM |

### Clients (`/api/v1/clients`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/` | List clients | HIGH |
| POST | `/` | Create client | HIGH |
| GET | `/{id}` | Get client | HIGH |
| PUT | `/{id}` | Update client | HIGH |
| DELETE | `/{id}` | Delete client | MEDIUM |

### Client Requests (`/api/v1/projects/{project_id}/requests`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/` | List requests | HIGH |
| POST | `/` | Create request | HIGH |
| GET | `/{id}` | Get request | HIGH |
| PATCH | `/{id}` | Update request | HIGH |
| DELETE | `/{id}` | Delete request | MEDIUM |
| POST | `/{id}/classify` | Classify request (AI) | HIGH |
| POST | `/{id}/restore` | Restore request | MEDIUM |

### Scope Items (`/api/v1/projects/{project_id}/scope`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/` | List scope items | HIGH |
| POST | `/` | Create scope item | HIGH |
| GET | `/{id}` | Get scope item | HIGH |
| PATCH | `/{id}` | Update scope item | HIGH |
| DELETE | `/{id}` | Delete scope item | MEDIUM |

### Proposals (`/api/v1/projects/{project_id}/proposals`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/` | List proposals | HIGH |
| POST | `/` | Create proposal | HIGH |
| GET | `/{id}` | Get proposal | HIGH |
| PATCH | `/{id}` | Update proposal | MEDIUM |
| DELETE | `/{id}` | Delete proposal | MEDIUM |
| POST | `/{id}/send` | Send proposal to client | HIGH |
| POST | `/{id}/accept` | Accept proposal | HIGH |
| POST | `/{id}/decline` | Decline proposal | HIGH |

### Billing (`/api/v1/billing`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/subscription` | Get subscription | HIGH |
| GET | `/limits` | Get usage limits | HIGH |
| POST | `/checkout` | Create checkout session | MEDIUM |
| POST | `/portal` | Create billing portal | MEDIUM |
| POST | `/cancel` | Cancel subscription | MEDIUM |
| POST | `/webhook` | Stripe webhook | HIGH |

### Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/summary` | Dashboard summary stats | HIGH |
| GET | `/alerts` | Active alerts | HIGH |
| GET | `/activity` | Recent activity | MEDIUM |
| GET | `/project-health` | Project health metrics | MEDIUM |

## Critical User Flows

### Flow 1: User Registration & Login
1. Visit `/register`
2. Fill form, submit
3. Redirect to `/dashboard`
4. Logout
5. Visit `/login`
6. Login successfully
7. Verify on `/dashboard`

### Flow 2: Create Project with Scope
1. Login
2. Go to `/projects/new`
3. Create project
4. Add scope items
5. Verify scope tab shows items

### Flow 3: Client Request & Classification
1. Login, go to project
2. Go to Requests tab
3. Add new request
4. Request gets classified (in-scope/out-of-scope)
5. Edit request (modal on desktop)
6. Verify changes saved

### Flow 4: Proposal Creation
1. Login, go to project with out-of-scope request
2. Go to Proposals tab
3. Create new proposal
4. Add line items
5. Send proposal
6. Verify proposal status

### Flow 5: Billing Flow
1. Login
2. Go to `/settings/billing`
3. View current subscription
4. Access Stripe portal

## Test Account Requirements

### QA Test Account
- Email: `qa@scopeguard.test`
- Password: `QATest123!`
- Role: Standard user
- Needs: At least 1 client, 1 project with scope items

### Admin Test Account (if applicable)
- Email: `admin@scopeguard.test`
- Password: `AdminTest123!`
- Role: Admin

## Environment Variables for Testing
```bash
# Production API
SCOPEGUARD_API=https://scopeguard.fly.dev/api/v1

# Test credentials
SCOPEGUARD_TEST_EMAIL=qa@scopeguard.test
SCOPEGUARD_TEST_PASSWORD=QATest123!

# For visual verification
ANTHROPIC_API_KEY=<your-key>
```

## Priority Legend
- **HIGH**: Core functionality, must pass
- **MEDIUM**: Important features, should pass
- **LOW**: Nice-to-have, can be deferred
