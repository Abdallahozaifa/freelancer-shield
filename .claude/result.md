# Fix Results: Restore Request 500 Error

## Issue
PATCH `/api/v1/projects/{project_id}/requests/{request_id}` returned 500 Internal Server Error when restoring a request from the History tab.

## Root Cause Analysis

### First Fix Attempt (Pydantic Schema)
Initially fixed `app/schemas/client_request.py` to make `classification` Optional:
```python
classification: Optional[ScopeClassification] = None  # Changed from non-Optional
```

**Result**: This only fixed the response serialization, not the actual database operation.

### Real Root Cause
The **database column** `classification` in `client_requests` table has a `NOT NULL` constraint (defined in `app/models/client_request.py` line 76).

When frontend sends `{ status: 'new', classification: null }` to restore:
1. Pydantic accepts it (schema allows null)
2. Endpoint tries to UPDATE with `classification=NULL`
3. Database rejects with: `null value in column "classification" violates not-null constraint`

## Final Fix Applied
Changed `app/api/v1/endpoints/client_requests.py` in `update_client_request_endpoint`:

```python
# Handle null classification - database doesn't allow NULL, so convert to PENDING
if "classification" in update_data and update_data["classification"] is None:
    update_data["classification"] = ScopeClassification.PENDING
```

This converts `null` classification to `PENDING` (which means "not yet analyzed") before the database update.

## Deployment
- Deployed at: 2025-12-10T01:17:34Z
- App URL: https://scopeguard.fly.dev/
- Health check passing

## Verification
- No new 500 errors in production logs after deployment
- Old IntegrityError from 01:06:46Z was before the fix
- App is running and health checks are passing

## Files Modified
1. `app/schemas/client_request.py` - Made classification Optional in response schema
2. `app/api/v1/endpoints/client_requests.py` - Convert null classification to PENDING

## Test
To verify the fix:
1. Login to https://scopeguard.fly.dev/
2. Go to a project's Requests tab
3. Switch to History tab
4. Click "Restore" on an archived request
5. Should restore without 500 error, classification set to "pending"
