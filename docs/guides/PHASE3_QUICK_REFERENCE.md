# Phase 3 User CRUD - Quick Reference Card

## Import Shortcuts

```typescript
// All hooks in one import
import { useUsers, useUserForm, useUserActions } from '@/hooks'

// Validation utilities
import { validateUserForm, validateUsername } from '@/lib/validation/user-validation'

// Handlers
import { createUserListHandlers, createUserFormHandlers } from '@/lib/admin/user-page-handlers'

// Error boundaries
import { UserListErrorBoundary, UserFormErrorBoundary } from '@/components/admin'
```

---

## Hook API Reference

### useUsers()
```typescript
const { users, loading, error, pagination, search, roleFilter, refetching, handlers } = useUsers()

handlers.fetchUsers(page, limit, search, role)    // Fetch with filters
handlers.refetchUsers()                             // Refetch current filters
handlers.searchUsers(term)                          // Search (debounced 300ms)
handlers.filterByRole(role)                         // Filter by role
handlers.changePage(page)                           // Go to page
handlers.changeLimit(limit)                         // Change items per page
handlers.reset()                                    // Reset all
```

### useUserForm()
```typescript
const { formData, errors, loading, submitError, isValid, isDirty, handlers } = useUserForm({
  initialData: user,
  onSuccess: (user) => {},
  onError: (error) => {}
})

handlers.setField(name, value)                      // Update field
handlers.setErrors(errors)                          // Set errors
handlers.validateForm()                             // Validate all
handlers.validateField(field)                       // Validate one
handlers.submitCreate(data)                         // Create
handlers.submitUpdate(userId, data)                 // Update
handlers.reset()                                    // Reset
```

### useUserActions()
```typescript
const { loading, error, operationInProgress, affectedUserId, handlers } = useUserActions({
  onSuccess: (action, user) => {},
  onError: (action, error) => {}
})

handlers.deleteUser(userId, force)                  // Delete (force=true confirms)
handlers.updateUserRole(userId, newRole)           // Update role
handlers.updateUserStatus(userId, status)          // Update status
handlers.clearError()                               // Clear error
```

---

## Validation Reference

```typescript
import {
  validateUsername,          // Required, 3-50 chars, alphanumeric+_
  validateUserEmail,         // Required, valid email, max 254 chars
  validateRole,              // Required, valid role
  validateBio,               // Optional, max 500 chars
  validateProfilePictureUrl, // Optional, valid URL
  validateUserForm,          // Validate all fields
  hasValidationErrors,       // Check if errors exist
  getRoleDisplayName,        // "admin" -> "Administrator"
} from '@/lib/validation/user-validation'

const usernameError = validateUsername('john_doe') // Returns error string or ''
const errors = validateUserForm(formData)           // Returns { field: error }
```

---

## Handler Reference

### List Handlers
```typescript
const handlers = createUserListHandlers(users, actions, {
  router,
  onNotify: (message, type) => {},      // type: 'success'|'error'|'info'|'warning'
  onConfirmDelete: (message) => Promise.resolve(confirm(message))
})

handlers.handleSearch(term)              // Debounced search
handlers.handleFilterChange(role)        // Filter by role
handlers.handlePageChange(page)          // Go to page
handlers.handleLimitChange(limit)        // Change items per page
handlers.handleCreate()                  // Navigate to create form
handlers.handleEdit(userId)              // Navigate to edit form
handlers.handleDelete(userId, userName)  // Delete with confirmation
handlers.handleRoleChange(userId, role)  // Update role
handlers.handleRefresh()                 // Refetch list
```

### Form Handlers
```typescript
const handlers = createUserFormHandlers(form, {
  router,
  isEdit: boolean,
  userId: string,
  onNotify: (message, type) => {}
})

handlers.handleFieldChange(field, value) // Update field
handlers.handleFieldBlur(field)          // Validate on blur
handlers.handleSubmit()                  // Validate and submit
handlers.handleCancel()                  // Go back
handlers.handleReset()                   // Reset form
```

---

## Form Fields

```typescript
interface UserFormData {
  username: string         // Required: alphanumeric + underscore, 3-50 chars
  email: string            // Required: valid email
  role: string             // Required: public|user|moderator|admin|god|supergod
  bio: string              // Optional: max 500 chars
  profilePicture: string   // Optional: valid URL
}
```

---

## Common Patterns

### Basic List Page
```typescript
'use client'
import { useUsers, useUserActions } from '@/hooks'
import { createUserListHandlers } from '@/lib/admin/user-page-handlers'
import { useRouter } from 'next/navigation'

export function UserListPage() {
  const router = useRouter()
  const users = useUsers()
  const actions = useUserActions()

  const handlers = createUserListHandlers(users, actions, {
    router,
    onNotify: (msg, type) => showToast(msg, type),
    onConfirmDelete: (msg) => confirm(msg)
  })

  useEffect(() => {
    void handlers.handleRefresh()
  }, [])

  return (
    <div>
      <input onChange={(e) => handlers.handleSearch(e.target.value)} />
      {users.users.map(user => (
        <div key={user.id}>
          {user.username}
          <button onClick={() => handlers.handleEdit(user.id)}>Edit</button>
          <button onClick={() => handlers.handleDelete(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

### Basic Form Page
```typescript
'use client'
import { useUserForm } from '@/hooks'
import { createUserFormHandlers } from '@/lib/admin/user-page-handlers'
import { useRouter } from 'next/navigation'

export function UserFormPage({ userId }: { userId?: string }) {
  const router = useRouter()
  const form = useUserForm({
    onSuccess: () => { showToast('Saved!'); router.push('/admin/users') }
  })

  const handlers = createUserFormHandlers(form, {
    router,
    isEdit: !!userId,
    userId,
    onNotify: (msg, type) => showToast(msg, type)
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handlers.handleSubmit() }}>
      <input
        value={form.formData.username}
        onChange={(e) => handlers.handleFieldChange('username', e.target.value)}
        onBlur={() => handlers.handleFieldBlur('username')}
      />
      {form.errors.username && <span>{form.errors.username}</span>}

      <button type="submit" disabled={form.loading}>Save</button>
      <button onClick={handlers.handleCancel}>Cancel</button>
    </form>
  )
}
```

---

## Error Handling

```typescript
// Transform API errors to user messages
import { handleApiError } from '@/lib/admin/user-page-handlers'

try {
  await deleteUser(id)
} catch (error) {
  const { message, userFriendly } = handleApiError(error, 'user deletion')
  console.error(message)        // Technical error
  showToast(userFriendly)       // User-friendly message
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Search fires too many API calls | Search is already debounced at 300ms |
| Form errors show while typing | Use onBlur for validation, not onChange |
| Can't delete user | Delete requires `force=true` parameter |
| Pagination doesn't work | Ensure API returns `meta.total` |
| Validation not working | Import from `@/lib/validation/user-validation` |

---

## File Locations

| Feature | File |
|---------|------|
| List Hook | `/frontends/nextjs/src/hooks/useUsers.ts` |
| Form Hook | `/frontends/nextjs/src/hooks/useUserForm.ts` |
| Actions Hook | `/frontends/nextjs/src/hooks/useUserActions.ts` |
| Validation | `/frontends/nextjs/src/lib/validation/user-validation.ts` |
| Handlers | `/frontends/nextjs/src/lib/admin/user-page-handlers.ts` |
| List Boundary | `/frontends/nextjs/src/components/admin/UserListErrorBoundary.tsx` |
| Form Boundary | `/frontends/nextjs/src/components/admin/UserFormErrorBoundary.tsx` |
| Full Guide | `/docs/PHASE3_USER_CRUD_STATE_MANAGEMENT.md` |

---

## Type Safety

```typescript
// All types are exported and can be imported
import type {
  UseUsersReturn,
  UseUserFormReturn,
  UseUserActionsReturn,
  UserFormData,
  UserFormErrors
} from '@/hooks'
```

---

## Features Checklist

✅ User list with pagination
✅ Form state management
✅ Real-time validation
✅ Debounced search (300ms)
✅ Role filtering
✅ Individual user operations
✅ Error boundaries
✅ Unsaved changes detection
✅ Comprehensive error handling
✅ Full TypeScript support
✅ 500+ lines of documentation

---

## Next Steps

1. Create form field components (TextInput, Select, etc.)
2. Create table components for user list
3. Implement toast notification system
4. Connect to your API endpoints
5. Add unit and integration tests
6. Deploy to production

---

## Support

See `/docs/PHASE3_USER_CRUD_STATE_MANAGEMENT.md` for:
- Detailed API reference
- Architecture diagrams
- Complete integration examples
- Best practices guide
- Testing patterns
- Common issues & solutions
