# Phase 3 User CRUD State Management Implementation Guide

## Overview

This guide covers the complete Phase 3 state management implementation for user CRUD operations. It includes three custom React hooks, comprehensive validation utilities, handler functions, and error boundaries.

**Files Created:**
- `/frontends/nextjs/src/hooks/useUsers.ts` - User list state management
- `/frontends/nextjs/src/hooks/useUserForm.ts` - Form state management
- `/frontends/nextjs/src/hooks/useUserActions.ts` - Individual user operations
- `/frontends/nextjs/src/lib/validation/user-validation.ts` - Validation utilities
- `/frontends/nextjs/src/lib/admin/user-page-handlers.ts` - Handler functions
- `/frontends/nextjs/src/components/admin/UserListErrorBoundary.tsx` - Error boundary
- `/frontends/nextjs/src/components/admin/UserFormErrorBoundary.tsx` - Error boundary

---

## Architecture & Data Flow

### State Management Hierarchy

```
┌─────────────────────────────────────────────┐
│         React Component (Page)              │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  useUsers Hook                        │  │
│  │  - List state & pagination            │  │
│  │  - Search/filter logic                │  │
│  │  - Handlers: fetchUsers, searchUsers  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  useUserForm Hook                     │  │
│  │  - Form data & validation errors      │  │
│  │  - Handlers: setField, submitCreate   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  useUserActions Hook                  │  │
│  │  - Handlers: deleteUser, updateRole   │  │
│  │  - Loading & error states             │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Handler Functions                    │  │
│  │  - createUserListHandlers()           │  │
│  │  - createUserFormHandlers()           │  │
│  │  - Orchestrates hooks & navigation    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │   API Endpoints      │
        ├──────────────────────┤
        │ GET /api/.../users   │
        │ POST /api/.../users  │
        │ PUT /api/.../users   │
        │ DELETE /api/.../users│
        └──────────────────────┘
```

### Data Flow Example: Fetching Users

```
User clicks "Refresh"
            ↓
handleRefresh()
            ↓
useUsers.handlers.refetchUsers()
            ↓
fetchUsers(page, limit, search, role)
            ↓
Build query string with filters
            ↓
fetch(`/api/v1/.../users?skip=0&take=10`)
            ↓
Parse response (success/error)
            ↓
setState() - Update local state
            ↓
Component re-renders with new data
```

---

## Hook Implementations

### 1. useUsers Hook

**Purpose:** Manages user list state, pagination, search, and filtering

**State:**
```typescript
interface UseUsersState {
  users: User[]              // List of users
  loading: boolean           // API call in progress
  error: string | null       // Error message
  pagination: {
    page: number            // Current page (1-based)
    limit: number           // Items per page
    total: number           // Total items
    totalPages: number      // Calculated from total/limit
  }
  search: string            // Current search term
  roleFilter: string | null // Filter by role
  refetching: boolean       // Refetch in progress
}
```

**Handlers:**
- `fetchUsers(page?, limit?, search?, role?)` - Fetch users with filters
- `refetchUsers()` - Refetch with current filters
- `searchUsers(term)` - Search with 300ms debounce
- `filterByRole(role)` - Filter by role
- `changePage(newPage)` - Go to page
- `changeLimit(newLimit)` - Change items per page
- `reset()` - Clear all state

**Usage Example:**
```typescript
'use client'

import { useUsers } from '@/hooks/useUsers'
import { useEffect } from 'react'

export function UserListPage() {
  const { users, loading, error, pagination, handlers } = useUsers()

  // Fetch initial list
  useEffect(() => {
    void handlers.fetchUsers(1, 10)
  }, [handlers])

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => void handlers.searchUsers(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>{/* ... */}</tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => void handlers.changePage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        <span>{pagination.page} of {pagination.totalPages}</span>
        <button
          onClick={() => void handlers.changePage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

**Key Features:**
- Debounced search (300ms delay)
- Persistent current filters for refetch
- Proper error handling with user messages
- Supports pagination, search, and role filtering simultaneously

---

### 2. useUserForm Hook

**Purpose:** Manages form state for creating and editing users

**State:**
```typescript
interface UseUserFormState {
  formData: UserFormData        // Form field values
  errors: UserFormErrors        // Validation errors by field
  loading: boolean              // API call in progress
  submitError: string | null    // Form submission error
  isValid: boolean              // No errors and required fields filled
  isDirty: boolean              // Has changes from initial data
}
```

**Form Data:**
```typescript
interface UserFormData {
  username: string         // Required, 3-50 chars, alphanumeric + underscore
  email: string            // Required, valid email
  role: string             // Required, one of: public/user/moderator/admin/god/supergod
  bio: string              // Optional, max 500 chars
  profilePicture: string   // Optional, valid URL
}
```

**Handlers:**
- `setField(name, value)` - Update single field and clear its error
- `validateField(field)` - Validate single field
- `validateForm()` - Validate entire form
- `submitCreate(data?)` - Create new user
- `submitUpdate(userId, data?)` - Update existing user
- `reset()` - Reset to initial data

**Usage Example:**
```typescript
'use client'

import { useUserForm } from '@/hooks/useUserForm'
import { useRouter } from 'next/navigation'

export function UserFormPage({ userId }: { userId?: string }) {
  const router = useRouter()
  const { formData, errors, loading, handlers } = useUserForm({
    initialData: userId ? { /* fetch user */ } : undefined,
    onSuccess: (user) => {
      showToast(`User ${user.username} saved!`)
      router.push('/admin/users')
    },
    onError: (error) => {
      showToast(error, 'error')
    }
  })

  const handleSubmit = async () => {
    if (!handlers.validateForm()) {
      return // Form has errors
    }

    if (userId) {
      await handlers.submitUpdate(userId)
    } else {
      await handlers.submitCreate()
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}>
      <input
        value={formData.username}
        onChange={(e) => handlers.setField('username', e.target.value)}
        onBlur={() => handlers.validateField('username')}
      />
      {errors.username && <span className="text-red-500">{errors.username}</span>}

      <input
        value={formData.email}
        onChange={(e) => handlers.setField('email', e.target.value)}
        onBlur={() => handlers.validateField('email')}
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

**Key Features:**
- Real-time validation feedback (on blur, not on change)
- Detects form changes (isDirty)
- Handles validation errors with field-level display
- Conflict errors for duplicate username/email
- Automatic form reset after successful submission
- Supports both create and update operations

---

### 3. useUserActions Hook

**Purpose:** Manages individual user operations (delete, role changes, etc.)

**State:**
```typescript
interface UseUserActionsState {
  loading: boolean                    // Operation in progress
  error: string | null                // Error message
  operationInProgress: 'delete' | 'updateRole' | 'updateStatus' | 'none'
  affectedUserId: string | null       // Which user is being modified
}
```

**Handlers:**
- `deleteUser(userId, force)` - Delete user (requires force=true confirmation)
- `updateUserRole(userId, newRole)` - Change user role
- `updateUserStatus(userId, status)` - Change user status
- `clearError()` - Clear error message

**Usage Example:**
```typescript
'use client'

import { useUserActions } from '@/hooks/useUserActions'

export function UserActionsMenu({ userId, userName }: Props) {
  const { loading, error, handlers } = useUserActions({
    onSuccess: (action, user) => {
      if (action === 'deleteUser') {
        showToast('User deleted')
      } else {
        showToast(`User updated`)
      }
      // Refresh user list
    },
    onError: (action, error) => {
      showToast(error, 'error')
    }
  })

  const handleDelete = async () => {
    if (!confirm(`Delete ${userName}? This cannot be undone.`)) {
      return
    }
    await handlers.deleteUser(userId, true) // force=true confirms action
  }

  const handleRoleChange = async (newRole: string) => {
    await handlers.updateUserRole(userId, newRole)
  }

  return (
    <div>
      <button onClick={handleDelete} disabled={loading}>
        Delete
      </button>

      <select
        onChange={(e) => void handleRoleChange(e.target.value)}
        disabled={loading}
      >
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </select>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}
```

**Key Features:**
- Tracks which operation is in progress
- Tracks which user is affected
- Requires explicit confirmation for deletions (force parameter)
- Role validation against valid role list
- Detailed error handling for different HTTP status codes

---

## Validation System

### Validation Rules

**Username:**
- Required
- 3-50 characters
- Alphanumeric + underscore only
- Cannot start/end with underscore
- No consecutive underscores

**Email:**
- Required
- Valid email format (RFC 5321)
- Max 254 characters

**Role:**
- Required
- One of: `public`, `user`, `moderator`, `admin`, `god`, `supergod`

**Bio:**
- Optional
- Max 500 characters

**Profile Picture:**
- Optional
- Valid URL (http://, https://, or data: URI)
- Max 2048 characters for http/https

### Validation Functions

```typescript
import {
  validateUsername,
  validateUserEmail,
  validateRole,
  validateBio,
  validateProfilePictureUrl,
  validateUserForm,
} from '@/lib/validation/user-validation'

// Validate single field
const usernameError = validateUsername('john_doe')
if (usernameError) {
  console.error(usernameError)
}

// Validate entire form
const errors = validateUserForm({
  username: 'john_doe',
  email: 'john@example.com',
  role: 'admin',
  bio: 'Software developer',
  profilePicture: 'https://example.com/avatar.jpg'
})

// Check if has errors
if (hasValidationErrors(errors)) {
  // Show errors
}

// Format for display
const displayName = getRoleDisplayName('admin') // "Administrator"
```

### Validation Timing

**Best Practice:**
- **On Change:** Update form data only (don't validate)
- **On Blur:** Validate field and show error
- **On Submit:** Validate entire form, prevent submission if invalid

**Bad Practice:**
- Don't validate on every keystroke (excessive feedback)
- Don't show errors before user leaves field (frustrating UX)

---

## Handler Functions

### createUserListHandlers

Creates all event handlers for the user list page.

```typescript
import { createUserListHandlers } from '@/lib/admin/user-page-handlers'
import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'
import { useUserActions } from '@/hooks/useUserActions'

export function UserListPage() {
  const router = useRouter()
  const users = useUsers()
  const actions = useUserActions()

  const handlers = createUserListHandlers(users, actions, {
    router,
    onNotify: (message, type) => showToast(message, type),
    onConfirmDelete: (message) => confirm(message),
  })

  return (
    <div>
      <input
        placeholder="Search users..."
        onChange={(e) => handlers.handleSearch(e.target.value)}
      />

      <select onChange={(e) => void handlers.handleFilterChange(e.target.value || null)}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>

      <button onClick={handlers.handleCreate}>
        Create User
      </button>

      <button onClick={() => void handlers.handleRefresh()}>
        Refresh
      </button>

      <UserTable
        users={users.users}
        loading={users.loading}
        onEdit={handlers.handleEdit}
        onDelete={handlers.handleDelete}
        onRoleChange={handlers.handleRoleChange}
      />

      <Pagination
        page={users.pagination.page}
        totalPages={users.pagination.totalPages}
        onPageChange={handlers.handlePageChange}
        limit={users.pagination.limit}
        onLimitChange={handlers.handleLimitChange}
      />
    </div>
  )
}
```

**Handler Methods:**
- `handleSearch(term)` - Debounced search (300ms)
- `handleFilterChange(role)` - Filter by role
- `handlePageChange(page)` - Go to page
- `handleLimitChange(limit)` - Change items per page
- `handleCreate()` - Navigate to create form
- `handleEdit(userId)` - Navigate to edit form
- `handleDelete(userId, userName?)` - Delete with confirmation
- `handleRoleChange(userId, newRole, userName?)` - Update role
- `handleRefresh()` - Refetch current list

### createUserFormHandlers

Creates all event handlers for the user form page.

```typescript
import { createUserFormHandlers } from '@/lib/admin/user-page-handlers'
import { useRouter } from 'next/navigation'
import { useUserForm } from '@/hooks/useUserForm'

export function UserFormPage({ userId }: { userId?: string }) {
  const router = useRouter()
  const form = useUserForm()

  const handlers = createUserFormHandlers(form, {
    router,
    isEdit: !!userId,
    userId,
    onNotify: (message, type) => showToast(message, type),
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handlers.handleSubmit() }}>
      <FormField
        label="Username"
        value={form.formData.username}
        error={form.errors.username}
        onChange={(e) => handlers.handleFieldChange('username', e.target.value)}
        onBlur={() => handlers.handleFieldBlur('username')}
      />

      <FormField
        label="Email"
        type="email"
        value={form.formData.email}
        error={form.errors.email}
        onChange={(e) => handlers.handleFieldChange('email', e.target.value)}
        onBlur={() => handlers.handleFieldBlur('email')}
      />

      <SelectField
        label="Role"
        value={form.formData.role}
        error={form.errors.role}
        options={[
          { value: 'user', label: 'User' },
          { value: 'moderator', label: 'Moderator' },
          { value: 'admin', label: 'Administrator' },
        ]}
        onChange={(e) => handlers.handleFieldChange('role', e.target.value)}
        onBlur={() => handlers.handleFieldBlur('role')}
      />

      <TextAreaField
        label="Bio (optional)"
        value={form.formData.bio}
        error={form.errors.bio}
        onChange={(e) => handlers.handleFieldChange('bio', e.target.value)}
        onBlur={() => handlers.handleFieldBlur('bio')}
      />

      <div className="flex gap-2">
        <button type="submit" disabled={form.loading}>
          {form.loading ? 'Saving...' : 'Save'}
        </button>

        <button type="button" onClick={handlers.handleCancel}>
          Cancel
        </button>

        {form.isDirty && (
          <button type="button" onClick={handlers.handleReset}>
            Reset
          </button>
        )}
      </div>

      {form.submitError && (
        <div className="text-red-500">{form.submitError}</div>
      )}
    </form>
  )
}
```

**Handler Methods:**
- `handleFieldChange(field, value)` - Update field value
- `handleFieldBlur(field)` - Validate field on blur
- `handleSubmit()` - Validate and submit form
- `handleCancel()` - Go back (with unsaved changes warning)
- `handleReset()` - Reset form to initial data

---

## Error Handling

### Error Boundary Components

Catch component rendering errors and provide recovery UI.

**UserListErrorBoundary:**
```typescript
<UserListErrorBoundary onReset={() => window.location.reload()}>
  <UserListPage />
</UserListErrorBoundary>
```

**UserFormErrorBoundary:**
```typescript
<UserFormErrorBoundary
  onReset={() => form.reset()}
  onNavigateBack={() => router.back()}
>
  <UserFormPage />
</UserFormErrorBoundary>
```

### API Error Handling

```typescript
const { message, userFriendly } = handleApiError(error, 'user creation')

// message: Full technical error
// userFriendly: User-friendly message for UI

// Examples:
// HTTP 404 → "The resource was not found. It may have been deleted."
// HTTP 403 → "You do not have permission to perform this action."
// HTTP 409 → "This username or email already exists. Please try another."
// HTTP 422 → "The data you provided is invalid. Please check your input."
```

---

## Integration Examples

### Complete User List Page

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'
import { useUserActions } from '@/hooks/useUserActions'
import { createUserListHandlers } from '@/lib/admin/user-page-handlers'
import { UserListErrorBoundary } from '@/components/admin/UserListErrorBoundary'
import { useEffect, useState } from 'react'

function UserListContent() {
  const router = useRouter()
  const users = useUsers()
  const actions = useUserActions()
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' }>()

  const handlers = createUserListHandlers(users, actions, {
    router,
    onNotify: (message, type) => {
      setNotification({ message, type })
      setTimeout(() => setNotification(undefined), 5000)
    },
    onConfirmDelete: (msg) => Promise.resolve(confirm(msg)),
  })

  // Initial fetch
  useEffect(() => {
    void handlers.handleRefresh()
  }, [handlers])

  return (
    <div>
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search users..."
          onChange={(e) => handlers.handleSearch(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
        />

        <select
          onChange={(e) => void handlers.handleFilterChange(e.target.value || null)}
          className="rounded border px-3 py-2"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>

        <button
          onClick={handlers.handleCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create User
        </button>

        <button
          onClick={() => void handlers.handleRefresh()}
          disabled={users.refetching}
          className="rounded bg-gray-600 px-4 py-2 text-white"
        >
          {users.refetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {users.loading && <div>Loading users...</div>}
      {users.error && <div className="text-red-500">Error: {users.error}</div>}

      {users.users.length === 0 && !users.loading && (
        <div className="text-gray-500">No users found</div>
      )}

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Created</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                <select
                  value={user.role}
                  onChange={(e) =>
                    void handlers.handleRoleChange(user.id!, e.target.value, user.username)
                  }
                  disabled={actions.loading}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border px-4 py-2">
                {new Date(Number(user.createdAt)).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handlers.handleEdit(user.id!)}
                  className="mr-2 text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handlers.handleDelete(user.id!, user.username)}
                  disabled={actions.loading}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => void handlers.handlePageChange(users.pagination.page - 1)}
          disabled={users.pagination.page === 1}
          className="rounded bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {users.pagination.page} of {users.pagination.totalPages} (Total: {users.pagination.total})
        </span>

        <button
          onClick={() => void handlers.handlePageChange(users.pagination.page + 1)}
          disabled={users.pagination.page === users.pagination.totalPages}
          className="rounded bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>

        <select
          value={users.pagination.limit}
          onChange={(e) => void handlers.handleLimitChange(Number(e.target.value))}
          className="rounded border px-3 py-2"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  )
}

export function UserListPage() {
  return (
    <UserListErrorBoundary>
      <UserListContent />
    </UserListErrorBoundary>
  )
}
```

### Complete User Form Page

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useUserForm } from '@/hooks/useUserForm'
import { createUserFormHandlers } from '@/lib/admin/user-page-handlers'
import { UserFormErrorBoundary } from '@/components/admin/UserFormErrorBoundary'
import { useEffect, useState } from 'react'

interface UserFormPageProps {
  userId?: string
}

function UserFormContent({ userId }: UserFormPageProps) {
  const router = useRouter()
  const isEdit = !!userId
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' }>()

  const form = useUserForm({
    onSuccess: (user) => {
      setNotification({ message: `User ${user.username} saved!`, type: 'success' })
      setTimeout(() => router.push('/admin/users'), 1500)
    },
    onError: (error) => {
      setNotification({ message: error, type: 'error' })
    },
  })

  const handlers = createUserFormHandlers(form, {
    router,
    isEdit,
    userId,
    onNotify: (message, type) => {
      setNotification({ message, type })
    },
  })

  // Load user data if editing
  useEffect(() => {
    if (isEdit && userId) {
      // Fetch user and set form data
      // TODO: Implement
    }
  }, [isEdit, userId])

  return (
    <div className="mx-auto max-w-md">
      <h1>{isEdit ? 'Edit User' : 'Create User'}</h1>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); void handlers.handleSubmit() }}>
        <div className="mb-4">
          <label className="block font-medium">Username *</label>
          <input
            type="text"
            value={form.formData.username}
            onChange={(e) => handlers.handleFieldChange('username', e.target.value)}
            onBlur={() => handlers.handleFieldBlur('username')}
            className="w-full rounded border px-3 py-2"
          />
          {form.errors.username && (
            <span className="text-sm text-red-600">{form.errors.username}</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium">Email *</label>
          <input
            type="email"
            value={form.formData.email}
            onChange={(e) => handlers.handleFieldChange('email', e.target.value)}
            onBlur={() => handlers.handleFieldBlur('email')}
            className="w-full rounded border px-3 py-2"
          />
          {form.errors.email && (
            <span className="text-sm text-red-600">{form.errors.email}</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium">Role *</label>
          <select
            value={form.formData.role}
            onChange={(e) => handlers.handleFieldChange('role', e.target.value)}
            onBlur={() => handlers.handleFieldBlur('role')}
            className="w-full rounded border px-3 py-2"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Administrator</option>
            <option value="god">God</option>
            <option value="supergod">Super Administrator</option>
          </select>
          {form.errors.role && (
            <span className="text-sm text-red-600">{form.errors.role}</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium">Bio</label>
          <textarea
            value={form.formData.bio}
            onChange={(e) => handlers.handleFieldChange('bio', e.target.value)}
            onBlur={() => handlers.handleFieldBlur('bio')}
            className="w-full rounded border px-3 py-2"
            rows={4}
          />
          {form.errors.bio && (
            <span className="text-sm text-red-600">{form.errors.bio}</span>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="submit"
            disabled={form.loading}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {form.loading ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={handlers.handleCancel}
            className="rounded bg-gray-600 px-4 py-2 text-white"
          >
            Cancel
          </button>

          {form.isDirty && (
            <button
              type="button"
              onClick={handlers.handleReset}
              className="rounded bg-gray-400 px-4 py-2 text-white"
            >
              Reset
            </button>
          )}
        </div>

        {form.submitError && (
          <div className="rounded bg-red-50 p-3 text-red-600">
            {form.submitError}
          </div>
        )}
      </form>
    </div>
  )
}

export function UserFormPage({ params }: { params: { userId?: string } }) {
  return (
    <UserFormErrorBoundary>
      <UserFormContent userId={params.userId} />
    </UserFormErrorBoundary>
  )
}
```

---

## Best Practices

### 1. Error Handling Strategy

```typescript
// BAD: Showing technical errors to users
<div>{error}</div> // "HTTP 422: Unprocessable Entity"

// GOOD: Transform to user-friendly messages
const { userFriendly } = handleApiError(error)
<div>{userFriendly}</div> // "Please fix validation errors"
```

### 2. Loading States

```typescript
// BAD: Showing just a boolean
{loading && <div>Loading...</div>}

// GOOD: Show which specific operation is in progress
{operationInProgress === 'delete' && affectedUserId === userId && (
  <div>Deleting user...</div>
)}
```

### 3. Form Validation Timing

```typescript
// BAD: Validate on every keystroke
onChange={(e) => {
  handlers.setField('username', e.target.value)
  handlers.validateField('username') // Too aggressive
}}

// GOOD: Validate on blur
onBlur={() => handlers.validateField('username')}
```

### 4. Preventing Race Conditions

```typescript
// BAD: Multiple simultaneous requests
const handleDelete = async () => {
  await deleteUser(id) // No loading state
  await refetch() // Could race with another operation
}

// GOOD: Track operation state
const { loading, operationInProgress } = useUserActions()

const handleDelete = async () => {
  if (loading) return // Prevent duplicate requests
  await deleteUser(id) // Sets loading=true
  // loading is false before refetch starts
}
```

### 5. Search Debouncing

The `useUsers` hook automatically debounces search with 300ms delay. Don't add extra debouncing in the component:

```typescript
// BAD: Double debouncing
const debouncedSearch = useCallback(debounce((term) => {
  handlers.searchUsers(term) // Already debounced internally!
}, 300), [])

// GOOD: Call directly
onChange={(e) => handlers.searchUsers(e.target.value)}
```

### 6. Cleanup on Unmount

```typescript
'use client'

import { useEffect } from 'react'

export function UserListPage() {
  const { reset } = useUsers().handlers

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      reset()
    }
  }, [reset])

  // ...
}
```

---

## Common Patterns

### Fetching with Defaults

```typescript
const { users, loading, pagination, handlers } = useUsers()

useEffect(() => {
  // Fetch with sensible defaults
  void handlers.fetchUsers(1, 10, '', null)
}, [handlers])
```

### Showing Pagination

```typescript
<div>
  <button
    onClick={() => void handlers.changePage(pagination.page - 1)}
    disabled={pagination.page <= 1 || loading}
  >
    Previous
  </button>

  <span>
    Page {pagination.page} / {pagination.totalPages}
  </span>

  <button
    onClick={() => void handlers.changePage(pagination.page + 1)}
    disabled={pagination.page >= pagination.totalPages || loading}
  >
    Next
  </button>
</div>
```

### Inline Role Editing

```typescript
<select
  value={user.role}
  onChange={(e) => void handlers.handleRoleChange(user.id!, e.target.value)}
  disabled={actions.loading || actions.affectedUserId === user.id}
>
  <option value="user">User</option>
  <option value="moderator">Moderator</option>
  <option value="admin">Admin</option>
</select>
```

### Form with Required Indicators

```typescript
<label>
  Username
  <span className="text-red-500">*</span>
</label>
<input
  required
  value={formData.username}
  onChange={(e) => handlers.handleFieldChange('username', e.target.value)}
  onBlur={() => handlers.handleFieldBlur('username')}
/>
{errors.username && <span className="text-red-500">{errors.username}</span>}
```

---

## Testing Guide

### Unit Tests for Validation

```typescript
import { validateUsername, validateUserEmail } from '@/lib/validation/user-validation'

describe('User Validation', () => {
  describe('validateUsername', () => {
    it('accepts valid usernames', () => {
      expect(validateUsername('john_doe')).toBe('')
      expect(validateUsername('jane123')).toBe('')
    })

    it('rejects invalid usernames', () => {
      expect(validateUsername('ab')).toContain('at least 3 characters')
      expect(validateUsername('john-doe')).toContain('alphanumeric')
    })
  })

  describe('validateUserEmail', () => {
    it('accepts valid emails', () => {
      expect(validateUserEmail('user@example.com')).toBe('')
    })

    it('rejects invalid emails', () => {
      expect(validateUserEmail('invalid')).toContain('valid email')
      expect(validateUserEmail('')).toContain('required')
    })
  })
})
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useUsers } from '@/hooks/useUsers'

describe('useUsers', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useUsers())

    expect(result.current.users).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches users', async () => {
    const { result } = renderHook(() => useUsers())

    await act(async () => {
      await result.current.handlers.fetchUsers(1, 10)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.users).toBeDefined()
  })

  it('debounces search', async () => {
    const { result } = renderHook(() => useUsers())
    const spy = jest.spyOn(result.current.handlers, 'fetchUsers')

    await act(async () => {
      result.current.handlers.searchUsers('test')
    })

    // Wait for debounce
    await new Promise((r) => setTimeout(r, 350))

    expect(spy).toHaveBeenCalledWith(1, 10, 'test', null)
  })
})
```

---

## API Contract

The hooks expect the API to follow this contract:

**GET /api/v1/{tenant}/{package}/users**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "bio": "Software developer",
      "profilePicture": "https://example.com/avatar.jpg",
      "createdAt": 1704067200000
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**POST /api/v1/{tenant}/{package}/users**
```json
{
  "success": true,
  "data": {
    "id": "user_456",
    "username": "jane_doe",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": 1704067200000
  }
}
```

**Error Response (Validation)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "username": "Username must be at least 3 characters",
      "email": "Please enter a valid email address"
    }
  }
}
```

---

## Summary

This implementation provides:

✅ **Complete state management** for user CRUD operations
✅ **Real-time validation** with field-level error display
✅ **Debounced search** to prevent excessive API calls
✅ **Pagination and filtering** with persistent state
✅ **Error boundaries** for graceful error handling
✅ **TypeScript support** with full type safety
✅ **Best practices** following React patterns
✅ **Comprehensive handlers** orchestrating hooks and navigation

The architecture is modular, testable, and follows React best practices for state management, validation, and error handling.
