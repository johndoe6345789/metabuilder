# Phase 3: Package CRUD State Management Implementation Guide

Complete implementation guide for React hooks and handlers for package management. This document covers all three custom hooks, page-level handlers, error handling, and integration patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Hook Implementations](#hook-implementations)
3. [Handler Functions](#handler-functions)
4. [Error Handling](#error-handling)
5. [State Management Patterns](#state-management-patterns)
6. [Integration Examples](#integration-examples)
7. [Testing Strategies](#testing-strategies)

---

## Architecture Overview

### Three-Layer State Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Component Layer (PackageListPage, PackageDetailModal)   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Page-Level Handlers (package-page-handlers.ts) │    │
│  │ - Coordinates all three hooks                   │    │
│  │ - Manages confirmations & toasts                │    │
│  │ - Implements workflows                          │    │
│  └─────────────────────────────────────────────────┘    │
│                      ↓                                    │
│  ┌──────────────────┬──────────────────┬────────────┐   │
│  │                  │                  │            │   │
│  ▼                  ▼                  ▼            ▼   │
│ usePackages   usePackageActions  usePackageDetails    │
│ - List state   - Operation state   - Modal state      │
│ - Pagination   - Loading tracking  - Details fetch    │
│ - Search       - Debouncing        - Selection        │
│ - Filtering    - Error tracking    - Refresh          │
│                                                       │
├─────────────────────────────────────────────────────┤
│ Utilities Layer (package-utils.ts)                  │
│ - Error parsing & formatting                        │
│ - Data transformation & validation                  │
│ - Display formatting                                │
│ - State helpers                                     │
├─────────────────────────────────────────────────────┤
│ Types Layer (package-admin-types.ts)                │
│ - Complete TypeScript types                         │
│ - Error codes & enum definitions                    │
│ - Interface specifications                          │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input
    ↓
Page Handler (handleInstall, etc.)
    ↓
Confirmation Dialog (with user approval)
    ↓
API Call (via usePackageActions)
    ↓
Error Handling & State Update
    ↓
Toast Notification & List Refetch
    ↓
UI Update (user sees result)
```

---

## Hook Implementations

### 1. usePackages Hook

**File**: `/frontends/nextjs/src/hooks/usePackages.ts`

**Purpose**: Manages package list state with pagination, search, and filtering.

#### Key Features

- **Pagination**: Page and limit management
- **Search**: Debounced search with customizable delay
- **Filtering**: Status-based filtering (all, installed, available, disabled)
- **Auto-refresh**: Optional interval-based refetching
- **Focus refetch**: Auto-refetch when window regains focus
- **Abort handling**: Proper cleanup of pending requests

#### Usage Example

```typescript
function PackageListPage() {
  const { state, handlers, pagination } = usePackages({
    initialLimit: 10,
    debounceMs: 300,
    refetchOnFocus: true,
    onSuccess: (packages) => {
      console.log('Packages loaded:', packages)
    },
    onError: (error) => {
      console.error('Failed to load packages:', error.message)
    },
  })

  return (
    <div>
      {/* Search Input */}
      <input
        type="text"
        value={state.search}
        onChange={(e) => handlers.searchPackages(e.target.value)}
        placeholder="Search packages..."
      />

      {/* Status Filter */}
      <select
        value={state.statusFilter}
        onChange={(e) =>
          handlers.filterByStatus(e.target.value as PackageStatus)
        }
      >
        <option value="all">All</option>
        <option value="installed">Installed</option>
        <option value="available">Available</option>
        <option value="disabled">Disabled</option>
      </select>

      {/* Loading State */}
      {state.isLoading && <LoadingSpinner />}

      {/* Error State */}
      {state.error && (
        <ErrorAlert error={state.error} onRetry={() => handlers.refetchPackages()} />
      )}

      {/* Package List */}
      {!state.isLoading && (
        <>
          <PackageList packages={state.packages} />

          {/* Pagination */}
          <Pagination
            current={pagination.page + 1}
            total={pagination.pageCount}
            onPageChange={(page) => handlers.changePage(page - 1)}
          />
        </>
      )}
    </div>
  )
}
```

#### State Structure

```typescript
interface PackageListState {
  packages: PackageInfo[]          // Current page packages
  total: number                    // Total package count
  page: number                     // Current page (0-based)
  limit: number                    // Items per page
  search: string                   // Current search term
  statusFilter: PackageStatus      // Current status filter
  isLoading: boolean              // Initial load
  isRefetching: boolean           // Refetch (keeps list visible)
  error: PackageError | null      // Last error
}
```

#### Handler Methods

| Method | Purpose | Behavior |
|--------|---------|----------|
| `fetchPackages(page, limit, search, status)` | Explicit fetch | Resets page to 0 for new search/filter |
| `refetchPackages()` | Refetch with current filters | Maintains current page position |
| `searchPackages(term)` | Debounced search | 300ms default delay, updates immediately for UI |
| `filterByStatus(status)` | Filter by status | Resets to page 0 |
| `changePage(page)` | Navigate pages | Validates bounds before change |
| `changeLimit(limit)` | Change page size | Resets to page 0 |

### 2. usePackageActions Hook

**File**: `/frontends/nextjs/src/hooks/usePackageActions.ts`

**Purpose**: Manages individual package operations (install, uninstall, enable, disable).

#### Key Features

- **Operation Tracking**: Prevents duplicate operations on same package
- **Loading State**: Tracks overall loading state
- **Error Handling**: Structured error responses with codes
- **Abort Control**: Can cancel pending operations per package
- **Callbacks**: Success and error callbacks with operation type

#### Usage Example

```typescript
function PackageActionButtons({ packageId, packageName }: Props) {
  const { handlers, state, isOperationInProgress } = usePackageActions({
    onSuccess: (pkg, operation) => {
      showToast({
        type: 'success',
        message: `${packageName} ${operation}ed successfully`,
      })
      refetchPackages()
    },
    onError: (error, id) => {
      showToast({
        type: 'error',
        message: getErrorMessage(error),
      })
    },
  })

  const isDisabled = isOperationInProgress(packageId) || state.isLoading

  return (
    <div className="space-x-2">
      <button
        disabled={isDisabled}
        onClick={() => handlers.installPackage(packageId)}
      >
        {isOperationInProgress(packageId) ? 'Installing...' : 'Install'}
      </button>

      <button
        disabled={isDisabled}
        onClick={() => handlers.uninstallPackage(packageId)}
      >
        {isOperationInProgress(packageId) ? 'Uninstalling...' : 'Uninstall'}
      </button>

      <button
        disabled={isDisabled}
        onClick={() => handlers.enablePackage(packageId)}
      >
        {isOperationInProgress(packageId) ? 'Enabling...' : 'Enable'}
      </button>
    </div>
  )
}
```

#### State Structure

```typescript
interface PackageActionsState {
  isLoading: boolean                      // Any operation loading
  operationInProgress: Set<string>        // Package IDs with active operations
  error: PackageError | null              // Last error
}
```

#### Handler Methods

| Method | Endpoint | Behavior |
|--------|----------|----------|
| `installPackage(id)` | `POST /api/admin/packages/:id/install` | Returns updated PackageInfo |
| `uninstallPackage(id)` | `POST /api/admin/packages/:id/uninstall` | Returns void |
| `enablePackage(id)` | `POST /api/admin/packages/:id/enable` | Returns updated PackageInfo |
| `disablePackage(id)` | `POST /api/admin/packages/:id/disable` | Returns updated PackageInfo |

#### Operation Prevention

```typescript
// Automatically prevents duplicate operations on same package
isOperationInProgress('pkg_id') // Returns true if operation in progress

// Can still perform operations on different packages
isOperationInProgress('pkg_id_1') // true
isOperationInProgress('pkg_id_2') // false - allowed to start
```

### 3. usePackageDetails Hook

**File**: `/frontends/nextjs/src/hooks/usePackageDetails.ts`

**Purpose**: Manages package detail modal state and data fetching.

#### Key Features

- **Modal State**: Open/close state management
- **Data Fetching**: Fetch individual package details
- **Loading**: Separate loading state for modal
- **Refresh**: Refresh data for currently selected package
- **Error Handling**: Structured error responses

#### Usage Example

```typescript
function PackageDetailModal() {
  const { state, handlers } = usePackageDetails({
    onSuccess: (pkg) => {
      console.log('Package details loaded:', pkg)
    },
  })

  if (!state.isOpen) {
    return null
  }

  return (
    <Modal open={state.isOpen} onClose={handlers.closeDetails}>
      {state.isLoading ? (
        <LoadingSpinner />
      ) : state.error ? (
        <ErrorAlert error={state.error} />
      ) : state.selectedPackage ? (
        <PackageDetails
          package={state.selectedPackage}
          onRefresh={handlers.refreshDetails}
        />
      ) : null}
    </Modal>
  )
}

// Show modal
function PackageListItem({ pkg }: Props) {
  const { handlers } = usePackageDetails()

  return (
    <button onClick={() => handlers.openDetails(pkg.id)}>
      View Details
    </button>
  )
}
```

#### State Structure

```typescript
interface PackageDetailsState {
  selectedPackage: PackageInfo | null   // Currently selected package
  isOpen: boolean                       // Modal open state
  isLoading: boolean                    // Loading state
  error: PackageError | null            // Last error
}
```

#### Handler Methods

| Method | Purpose | Behavior |
|--------|---------|----------|
| `openDetails(id)` | Open modal & fetch package | Sets isOpen=true, fetches data |
| `closeDetails()` | Close modal & cleanup | Clears selection, cancels pending |
| `refreshDetails()` | Refresh current package | Refetches currently selected package |

---

## Handler Functions

### Page-Level Handlers

**File**: `/frontends/nextjs/src/lib/admin/package-page-handlers.ts`

Combines all three hooks into unified workflow handlers.

#### Factory Function

```typescript
// Create handlers with dependencies
const handlers = createPackagePageHandlers({
  usePackages,
  usePackageActions,
  usePackageDetails,
  showConfirmation,
  showToast,
})
```

#### List Page Handlers

```typescript
// Search (debounced via usePackages)
handleSearch('react')

// Filter by status
await handleFilterChange('installed')

// Pagination
await handlePageChange(2)  // Page 2 (0-based)
await handleLimitChange(20)  // 20 items per page

// Show details modal
await handleShowDetails('pkg_id')

// Close modal
handleCloseModal()
```

#### Action Handlers (with Confirmation)

```typescript
// Install with confirmation dialog
await handleInstall('pkg_id')
// Shows: "Are you sure you want to install Package Name?"
// On confirm: Calls API, shows toast, refetches list

// Uninstall with danger confirmation
await handleUninstall('pkg_id')
// Shows: "Are you sure you want to uninstall Package Name? This cannot be undone."
// On confirm: Calls API, closes modal, shows toast, refetches list

// Enable with confirmation
await handleEnable('pkg_id')

// Disable with confirmation
await handleDisable('pkg_id')
```

#### Modal Action Handlers

```typescript
// Install from modal (same as list, but updates modal data after)
await handleInstallFromModal('pkg_id')

// Uninstall from modal (closes modal after)
await handleUninstallFromModal('pkg_id')

// Enable from modal (refreshes modal data)
await handleEnableFromModal('pkg_id')

// Disable from modal (refreshes modal data)
await handleDisableFromModal('pkg_id')
```

### Workflow Example

Complete install workflow with all steps:

```typescript
async function installWorkflow(packageId: string) {
  try {
    // 1. Show confirmation dialog
    const confirmed = await showConfirmation({
      title: 'Install Package',
      message: `Install ${packageName}?`,
      confirmLabel: 'Install',
      variant: 'default',
      onConfirm: async () => {
        // 2. Execute install API call
        await usePackageActions.handlers.installPackage(packageId)
      },
    })

    if (!confirmed) {
      return  // User cancelled
    }

    // 3. Refetch list to show updated status
    await usePackages.handlers.refetchPackages()

    // 4. Show success toast
    showToast({
      type: 'success',
      message: `${packageName} installed successfully`,
    })
  } catch (err) {
    // 5. Handle error and show error toast
    const error = err as PackageError
    showToast({
      type: 'error',
      message: getErrorMessage(error),
    })
  }
}
```

---

## Error Handling

### Error Types

```typescript
enum PackageErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',           // Network/connection issues
  ALREADY_INSTALLED = 'ALREADY_INSTALLED',   // Package already installed
  MISSING_DEPENDENCIES = 'MISSING_DEPENDENCIES',  // Dependencies not met
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',   // Package doesn't exist
  PERMISSION_DENIED = 'PERMISSION_DENIED',   // User lacks permission
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',     // Other packages depend on it
  INVALID_PACKAGE_ID = 'INVALID_PACKAGE_ID', // Invalid ID format
  SERVER_ERROR = 'SERVER_ERROR',             // 5xx server error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',           // Unknown error
}
```

### Error Handling Pattern

```typescript
interface PackageError extends Error {
  code: PackageErrorCode
  statusCode?: number
  details?: Record<string, unknown>
}

// Create from API response
function createPackageError(
  statusCode: number,
  response: Record<string, unknown>
): PackageError {
  const error = new Error(response.message) as PackageError
  error.code = response.code as PackageErrorCode
  error.statusCode = statusCode
  error.details = response.details
  return error
}

// Parse from HTTP response
async function parseApiError(response: Response): Promise<PackageError> {
  try {
    const data = await response.json()
    return createPackageError(response.status, data)
  } catch {
    const error = new Error(`HTTP ${response.status}`) as PackageError
    error.code = 'NETWORK_ERROR'
    error.statusCode = response.status
    return error
  }
}
```

### Error Display

```typescript
import { getErrorMessage, isRetryableError } from '@/lib/admin/package-utils'

function ErrorAlert({ error }: Props) {
  const message = getErrorMessage(error)
  const retryable = isRetryableError(error)

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">{message}</p>
      {retryable && (
        <button
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  )
}
```

### API Error Responses

Expected API error response format:

```json
{
  "success": false,
  "message": "This package is already installed",
  "code": "ALREADY_INSTALLED",
  "statusCode": 409,
  "details": {
    "packageId": "pkg_id",
    "installedAt": 1234567890
  }
}
```

---

## State Management Patterns

### Optimistic Updates (Optional)

For better UX, immediately update UI before API succeeds:

```typescript
// 1. Save original data
const originalPackage = usePackages.state.packages.find((p) => p.id === pkgId)

// 2. Optimistically update UI
setState((prev) => ({
  ...prev,
  packages: prev.packages.map((p) =>
    p.id === pkgId ? { ...p, status: 'installed' } : p
  ),
}))

try {
  // 3. Execute API call
  await usePackageActions.handlers.installPackage(pkgId)
} catch (error) {
  // 4. Revert on error
  setState((prev) => ({
    ...prev,
    packages: prev.packages.map((p) =>
      p.id === pkgId ? originalPackage : p
    ),
  }))

  // Show undo option
  showToast({
    type: 'error',
    message: 'Installation failed',
    action: { label: 'Undo', onClick: revert },
  })
}
```

### Debounced Search

Search is automatically debounced (300ms default) in `usePackages`:

```typescript
// These calls to searchPackages are debounced
handleSearch('r')   // Queued
handleSearch('re')  // Queued
handleSearch('rea') // Queued
handleSearch('reac')  // Queued
handleSearch('react') // 300ms after last call, API executes with 'react'
```

To customize debounce delay:

```typescript
const { handlers } = usePackages({
  debounceMs: 500,  // 500ms delay
})
```

### Loading State Separation

Different loading states for different operations:

```typescript
// usePackages
state.isLoading      // Initial list load (hide content)
state.isRefetching   // Background refetch (keep content visible)

// usePackageActions
state.isLoading      // Any operation (overall state)
isOperationInProgress('pkg_id')  // Specific package

// usePackageDetails
state.isLoading      // Modal content loading
```

### Concurrent Operations

Multiple operations can happen simultaneously:

```typescript
// Install on one package while uninstalling another
await installPackage('pkg_1')      // In progress
await uninstallPackage('pkg_2')    // Also in progress

// Check individual package status
isOperationInProgress('pkg_1')  // true
isOperationInProgress('pkg_2')  // true
isOperationInProgress('pkg_3')  // false
```

### State Cleanup

Automatic cleanup on unmount:

```typescript
// usePackages
- Clears debounce timer
- Aborts pending fetch request

// usePackageActions
- No cleanup needed (stateless operations)

// usePackageDetails
- Aborts pending detail fetch request
```

---

## Integration Examples

### Complete Package Management Page

```typescript
'use client'

import { useState } from 'react'
import { usePackages } from '@/hooks/usePackages'
import { usePackageActions } from '@/hooks/usePackageActions'
import { usePackageDetails } from '@/hooks/usePackageDetails'
import { createPackagePageHandlers } from '@/lib/admin/package-page-handlers'
import type { PackagePageHandlers } from '@/lib/types/package-admin-types'

function PackageManagementPage() {
  // Hooks
  const packagesHook = usePackages({
    initialLimit: 10,
    debounceMs: 300,
  })

  const actionsHook = usePackageActions()
  const detailsHook = usePackageDetails()

  // State for confirmations
  const [confirmation, setConfirmation] = useState<any>(null)
  const [toasts, setToasts] = useState<any[]>([])

  // Confirmation handler
  const showConfirmation = async (options: any) => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        onConfirm: async () => {
          await options.onConfirm()
          resolve(true)
          setConfirmation(null)
        },
        onCancel: () => {
          options.onCancel?.()
          resolve(false)
          setConfirmation(null)
        },
      })
    })
  }

  // Toast handler
  const showToast = (options: any) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, ...options }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  // Create page handlers
  const handlers = createPackagePageHandlers({
    usePackages: packagesHook,
    usePackageActions: actionsHook,
    usePackageDetails: detailsHook,
    showConfirmation,
    showToast,
  }) as PackagePageHandlers

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Package Management</h1>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={packagesHook.state.search}
          onChange={(e) => handlers.handleSearch(e.target.value)}
          placeholder="Search packages..."
          className="flex-1 px-4 py-2 border rounded"
        />

        <select
          value={packagesHook.state.statusFilter}
          onChange={(e) =>
            handlers.handleFilterChange(e.target.value as any)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="all">All</option>
          <option value="installed">Installed</option>
          <option value="available">Available</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Loading State */}
      {packagesHook.state.isLoading && (
        <div className="text-center py-8">Loading packages...</div>
      )}

      {/* Error State */}
      {packagesHook.state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
          {packagesHook.state.error.message}
        </div>
      )}

      {/* Package List */}
      {!packagesHook.state.isLoading && (
        <>
          <div className="space-y-4">
            {packagesHook.state.packages.map((pkg) => (
              <div key={pkg.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{pkg.name}</h3>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>

                <div className="space-x-2">
                  <button onClick={() => handlers.handleShowDetails(pkg.id)}>
                    Details
                  </button>

                  {pkg.status === 'available' && (
                    <button
                      onClick={() => handlers.handleInstall(pkg.id)}
                      disabled={actionsHook.isOperationInProgress(pkg.id)}
                    >
                      {actionsHook.isOperationInProgress(pkg.id)
                        ? 'Installing...'
                        : 'Install'}
                    </button>
                  )}

                  {pkg.status === 'installed' && (
                    <>
                      {pkg.enabled ? (
                        <button
                          onClick={() => handlers.handleDisable(pkg.id)}
                          disabled={actionsHook.isOperationInProgress(pkg.id)}
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handlers.handleEnable(pkg.id)}
                          disabled={actionsHook.isOperationInProgress(pkg.id)}
                        >
                          Enable
                        </button>
                      )}

                      <button
                        onClick={() => handlers.handleUninstall(pkg.id)}
                        disabled={actionsHook.isOperationInProgress(pkg.id)}
                      >
                        Uninstall
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              disabled={packagesHook.pagination.page === 0}
              onClick={() =>
                handlers.handlePageChange(packagesHook.pagination.page - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {packagesHook.pagination.page + 1} of{' '}
              {packagesHook.pagination.pageCount}
            </span>

            <button
              disabled={
                packagesHook.pagination.page >=
                packagesHook.pagination.pageCount - 1
              }
              onClick={() =>
                handlers.handlePageChange(packagesHook.pagination.page + 1)
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {detailsHook.state.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {detailsHook.state.selectedPackage?.name}
              </h2>

              <button onClick={handlers.handleCloseModal}>×</button>
            </div>

            {detailsHook.state.isLoading && <div>Loading...</div>}

            {detailsHook.state.error && (
              <div className="text-red-600">
                {detailsHook.state.error.message}
              </div>
            )}

            {detailsHook.state.selectedPackage && (
              <>
                <p className="text-gray-600 mb-4">
                  {detailsHook.state.selectedPackage.description}
                </p>

                <div className="space-x-2">
                  {detailsHook.state.selectedPackage.status === 'available' && (
                    <button
                      onClick={() =>
                        handlers.handleInstallFromModal(
                          detailsHook.state.selectedPackage!.id
                        )
                      }
                    >
                      Install
                    </button>
                  )}

                  {detailsHook.state.selectedPackage.status === 'installed' && (
                    <>
                      {detailsHook.state.selectedPackage.enabled ? (
                        <button
                          onClick={() =>
                            handlers.handleDisableFromModal(
                              detailsHook.state.selectedPackage!.id
                            )
                          }
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handlers.handleEnableFromModal(
                              detailsHook.state.selectedPackage!.id
                            )
                          }
                        >
                          Enable
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handlers.handleUninstallFromModal(
                            detailsHook.state.selectedPackage!.id
                          )
                        }
                      >
                        Uninstall
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded p-6 max-w-md">
            <h2 className="text-lg font-bold mb-2">{confirmation.title}</h2>
            <p className="text-gray-600 mb-4">{confirmation.message}</p>

            <div className="space-x-2 flex justify-end">
              <button onClick={confirmation.onCancel}>
                {confirmation.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={confirmation.onConfirm}
                className={confirmation.variant === 'danger' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
              >
                {confirmation.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded text-white ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PackageManagementPage
```

---

## Testing Strategies

### Unit Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { usePackages } from '@/hooks/usePackages'

describe('usePackages', () => {
  it('should fetch packages on mount', async () => {
    const { result } = renderHook(() => usePackages())

    expect(result.current.state.isLoading).toBe(true)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(result.current.state.packages).toBeDefined()
    expect(result.current.state.isLoading).toBe(false)
  })

  it('should debounce search', async () => {
    const { result } = renderHook(() => usePackages({ debounceMs: 100 }))

    act(() => {
      result.current.handlers.searchPackages('r')
      result.current.handlers.searchPackages('re')
      result.current.handlers.searchPackages('react')
    })

    // Only last call should trigger API
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150))
    })

    expect(result.current.state.search).toBe('react')
  })

  it('should handle pagination', async () => {
    const { result } = renderHook(() => usePackages({ initialLimit: 10 }))

    await act(async () => {
      await result.current.handlers.changePage(1)
    })

    expect(result.current.state.page).toBe(1)
  })
})
```

### Integration Testing

```typescript
describe('Package Management Workflow', () => {
  it('should install package with confirmation', async () => {
    // Setup mocks
    const installMock = jest.fn()
    const confirmationMock = jest.fn().mockResolvedValue(true)
    const toastMock = jest.fn()

    // Render page
    const { getByText } = render(
      <PackageManagementPage
        onConfirmation={confirmationMock}
        onToast={toastMock}
      />
    )

    // Click install
    const installButton = getByText('Install')
    fireEvent.click(installButton)

    // Verify confirmation shown
    expect(confirmationMock).toHaveBeenCalled()

    // Wait for refetch
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
        })
      )
    })
  })
})
```

---

## File Summary

### Files Created

| File | Purpose |
|------|---------|
| `/lib/types/package-admin-types.ts` | Complete TypeScript type definitions |
| `/hooks/usePackages.ts` | Package list state hook |
| `/hooks/usePackageActions.ts` | Package operations hook |
| `/hooks/usePackageDetails.ts` | Package detail modal hook |
| `/lib/admin/package-page-handlers.ts` | Page-level workflow handlers |
| `/lib/admin/package-utils.ts` | Utility functions & helpers |

### Key Exports

From `package-admin-types.ts`:
- All type definitions and enums
- Error codes and interfaces

From `usePackages.ts`:
- `usePackages` hook

From `usePackageActions.ts`:
- `usePackageActions` hook

From `usePackageDetails.ts`:
- `usePackageDetails` hook

From `package-page-handlers.ts`:
- `createPackagePageHandlers` factory function

From `package-utils.ts`:
- Error utilities: `getErrorMessage`, `isRetryableError`
- Display formatters: `formatPackageStatus`, `formatDate`, etc.
- Validation helpers: `canInstallPackage`, `getAvailableActions`, etc.

---

## API Contract

### List Endpoint

```
GET /api/admin/packages?page=0&limit=10&search=term&status=installed
```

Response:
```json
{
  "items": [{ PackageInfo }, ...],
  "total": 100,
  "page": 0,
  "limit": 10
}
```

### Detail Endpoint

```
GET /api/admin/packages/:packageId
```

Response: `PackageInfo`

### Action Endpoints

```
POST /api/admin/packages/:packageId/install
POST /api/admin/packages/:packageId/uninstall
POST /api/admin/packages/:packageId/enable
POST /api/admin/packages/:packageId/disable
```

All return: `PackageInfo` (except uninstall which returns void)

---

## Next Steps

1. Create API endpoints matching the contracts above
2. Create confirmation dialog component
3. Create toast notification component
4. Create UI components for package list and details
5. Integrate into admin pages
6. Add tests for all hooks and handlers
7. Deploy and monitor error tracking
