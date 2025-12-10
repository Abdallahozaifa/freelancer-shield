# Debug Loop Prompt

Use this prompt when a fix attempt has failed and you need to iterate:

---

Read .claude/task.md and .claude/errors.txt.

The previous fix attempt failed. Follow this process:

## Step 1: Analyze Production Logs
1. Read `.claude/errors.txt` for the actual error messages
2. Read `.claude/logs.txt` for full context around the errors
3. Identify the real root cause (not symptoms)

## Step 2: Identify the Issue
- What endpoint/function is failing?
- What is the exact error message?
- Is this a:
  - Pydantic validation error (schema mismatch)?
  - Database error (constraint violation, missing column)?
  - Import/module error?
  - Authentication/authorization error?
  - Business logic error?

## Step 3: Fix the Code
1. Locate the failing code in the codebase
2. Make the minimal fix required
3. Ensure you don't break other functionality

## Step 4: Deploy and Verify
1. Deploy: `fly deploy`
2. Wait for deployment to complete
3. Run: `./scripts/debug.sh` to fetch new logs
4. Check `.claude/errors.txt` for remaining errors

## Step 5: Loop or Complete
- If errors related to the original issue persist → Go to Step 1
- If no related errors → Write success to `.claude/result.md`

## Important
- Max 5 fix attempts before escalating
- Each fix should be targeted and minimal
- Document what you tried in `.claude/result.md`
- If stuck, document the blocker and ask for help

---

## Quick Reference

```bash
# Fetch fresh logs
./scripts/debug.sh

# Filter logs by endpoint
./scripts/debug.sh requests
./scripts/debug.sh auth

# Deploy and auto-verify
./scripts/quick.sh deploy-test

# Check specific error patterns
grep -i "pydantic" .claude/errors.txt
grep -i "500" .claude/errors.txt
grep -i "traceback" .claude/logs.txt
```

## Common Error Patterns

### Pydantic Validation Error
```
pydantic_core._pydantic_core.ValidationError
```
**Fix**: Check schema field types, ensure Optional fields are marked

### 500 Internal Server Error
```
HTTP/1.1 500 Internal Server Error
```
**Fix**: Check server logs for traceback, fix the root cause

### Database Error
```
sqlalchemy.exc.IntegrityError
```
**Fix**: Check constraints, foreign keys, unique constraints

### Import Error
```
ModuleNotFoundError
```
**Fix**: Check imports, file paths, __init__.py files
