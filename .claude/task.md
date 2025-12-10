# Task: Fix Edit Request - Show Modal on Desktop

## Problem
The Edit Request page (`/projects/{id}/requests/edit?request={id}`) shows the mobile full-page version on desktop. Desktop should display a modal/popup instead.

**URL:** `/projects/d63bdc1f-c412-40fd-ad7a-1b69b443f051/requests/edit?request=ce77737f-b7ae-436e-9aad-24ffdc8041b3`

## Expected Behavior
- **Mobile:** Full page (current behavior) ✓
- **Desktop:** Modal/popup overlay on the Client Requests page ✗

## Files to Check
- [ ] frontend/src/pages/requests/EditRequest.tsx (or similar)
- [ ] frontend/src/components/requests/EditRequestModal.tsx (if exists)
- [ ] frontend/src/pages/projects/ClientRequests.tsx (parent page)
- [ ] Check how other edit flows work (e.g., edit client, edit project)

## Likely Issue
- Missing responsive conditional: should render modal on `lg:` breakpoint
- Or: using route-based navigation instead of modal state on desktop
- Or: modal component exists but isn't being used

## Solution Pattern
```tsx
// On desktop, edit should be a modal triggered from the table
// On mobile, navigate to full page

const handleEdit = (request) => {
  if (window.innerWidth >= 1024) {
    setEditModalOpen(true)
    setSelectedRequest(request)
  } else {
    navigate(`/projects/${projectId}/requests/edit?request=${request.id}`)
  }
}
```

## Verify
- Open on desktop (>1024px): Edit button should open modal
- Open on mobile (<768px): Edit should navigate to full page
- Modal should have same fields: Request Summary, Original Message, Source

## Success Criteria
- [ ] Desktop shows edit modal overlay
- [ ] Mobile still shows full page
- [ ] Save Changes works in both views
- [ ] Cancel closes modal / navigates back
