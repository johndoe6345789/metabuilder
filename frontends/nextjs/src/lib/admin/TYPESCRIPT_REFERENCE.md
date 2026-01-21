# Package Admin State Management - TypeScript Reference Sheet

Quick TypeScript type reference for all package management types.

## Error Types

```typescript
// Error codes
enum PackageErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  ALREADY_INSTALLED = 'ALREADY_INSTALLED',
  ALREADY_UNINSTALLED = 'ALREADY_UNINSTALLED',
  MISSING_DEPENDENCIES = 'MISSING_DEPENDENCIES',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  INVALID_PACKAGE_ID = 'INVALID_PACKAGE_ID',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Structured error
interface PackageError extends Error {
  code: PackageErrorCode
  statusCode?: number
  details?: Record<string, unknown>
}
```

## Package Types

```typescript
// Package status
type PackageStatus = 'all' | 'installed' | 'available' | 'disabled'

// Package information
interface PackageInfo {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: string
  icon: string
  screenshots: string[]
  tags: string[]
  dependencies: string[]
  createdAt: number
  updatedAt: number
  downloadCount: number
  rating: number
  status: 'installed' | 'available' | 'disabled'
  enabled: boolean
  installedAt?: number
}

// Paginated response
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
```

## Hook Return Types

### usePackages

```typescript
interface UsePackagesReturn {
  state: {
    packages: PackageInfo[]
    total: number
    page: number
    limit: number
    search: string
    statusFilter: PackageStatus
    isLoading: boolean
    isRefetching: boolean
    error: PackageError | null
  }

  handlers: {
    fetchPackages: (
      page?: number,
      limit?: number,
      search?: string,
      status?: PackageStatus
    ) => Promise<void>

    refetchPackages: () => Promise<void>

    searchPackages: (term: string) => void

    filterByStatus: (status: PackageStatus) => Promise<void>

    changePage: (page: number) => Promise<void>

    changeLimit: (limit: number) => Promise<void>
  }

  pagination: {
    page: number
    limit: number
    total: number
    pageCount: number
  }
}
```

### usePackageActions

```typescript
interface UsePackageActionsReturn {
  state: {
    isLoading: boolean
    operationInProgress: Set<string>
    error: PackageError | null
  }

  handlers: {
    installPackage: (packageId: string) => Promise<PackageInfo>

    uninstallPackage: (packageId: string) => Promise<void>

    enablePackage: (packageId: string) => Promise<PackageInfo>

    disablePackage: (packageId: string) => Promise<PackageInfo>
  }

  isOperationInProgress: (packageId: string) => boolean
}
```

### usePackageDetails

```typescript
interface UsePackageDetailsReturn {
  state: {
    selectedPackage: PackageInfo | null
    isOpen: boolean
    isLoading: boolean
    error: PackageError | null
  }

  handlers: {
    openDetails: (packageId: string) => Promise<void>

    closeDetails: () => void

    refreshDetails: () => Promise<void>
  }
}
```

## Handler Factory

```typescript
// Create page handlers
function createPackagePageHandlers(deps: {
  usePackages: UsePackagesReturn
  usePackageActions: UsePackageActionsReturn
  usePackageDetails: UsePackageDetailsReturn
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>
  showToast: (options: ToastOptions) => void
}): PackagePageHandlers

// Result type
interface PackagePageHandlers {
  // List handlers
  handleSearch: (term: string) => void
  handleFilterChange: (status: PackageStatus) => Promise<void>
  handlePageChange: (page: number) => Promise<void>
  handleLimitChange: (limit: number) => Promise<void>

  // Modal handlers
  handleShowDetails: (packageId: string) => Promise<void>
  handleCloseModal: () => void

  // List action handlers
  handleInstall: (packageId: string) => Promise<void>
  handleUninstall: (packageId: string) => Promise<void>
  handleEnable: (packageId: string) => Promise<void>
  handleDisable: (packageId: string) => Promise<void>

  // Modal action handlers
  handleInstallFromModal: (packageId: string) => Promise<void>
  handleUninstallFromModal: (packageId: string) => Promise<void>
  handleEnableFromModal: (packageId: string) => Promise<void>
  handleDisableFromModal: (packageId: string) => Promise<void>
}
```

## Dialog Options

```typescript
interface ConfirmationOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning'
  onConfirm: () => Promise<void>
  onCancel?: () => void
}

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
```

## Utility Function Types

```typescript
// Error utilities
function parseErrorCode(error: unknown): PackageErrorCode
function getErrorMessage(error: PackageError | Error | null): string
function isRetryableError(error: PackageError | Error | null): boolean

// Display formatters
function formatPackageStatus(status: string): string
function formatPackageCategory(category: string): string
function formatVersion(version: string): string
function formatDate(timestamp: number): string
function formatDateTime(timestamp: number): string
function formatNumber(num: number): string
function formatRating(rating: number): string
function getPlaceholderIconUrl(packageId: string): string
function truncateText(text: string, maxLength: number): string

// Search and sort
function filterPackagesBySearch(
  packages: PackageInfo[],
  searchTerm: string
): PackageInfo[]

function sortPackages(
  packages: PackageInfo[],
  sortBy: 'name' | 'rating' | 'downloads' | 'date',
  ascending?: boolean
): PackageInfo[]

// Package state checks
function canInstallPackage(pkg: PackageInfo): boolean
function canUninstallPackage(pkg: PackageInfo): boolean
function canEnablePackage(pkg: PackageInfo): boolean
function canDisablePackage(pkg: PackageInfo): boolean
function getAvailableActions(
  pkg: PackageInfo
): Array<'install' | 'uninstall' | 'enable' | 'disable'>

// Validation
function validatePackageData(pkg: Partial<PackageInfo>): string[]

// State manipulation
function mergePackageUpdate(
  packages: PackageInfo[],
  updated: PackageInfo
): PackageInfo[]

// Dependencies
function formatDependencies(dependencies: string[]): string
function areDependenciesMet(
  dependencies: string[],
  installedPackageIds: Set<string>
): boolean
function getMissingDependencies(
  dependencies: string[],
  installedPackageIds: Set<string>
): string[]
```

## Hook Options

```typescript
// usePackages options
interface UsePackagesOptions {
  initialLimit?: number            // Default: 10
  debounceMs?: number             // Default: 300
  onSuccess?: (data: PackageInfo[]) => void
  onError?: (error: PackageError) => void
  refetchInterval?: number | null // Default: null
  refetchOnFocus?: boolean        // Default: true
}

// usePackageActions options
interface UsePackageActionsOptions {
  onSuccess?: (
    pkg: PackageInfo,
    operation: 'install' | 'uninstall' | 'enable' | 'disable'
  ) => void
  onError?: (error: PackageError, packageId: string) => void
}

// usePackageDetails options
interface UsePackageDetailsOptions {
  onSuccess?: (pkg: PackageInfo) => void
  onError?: (error: PackageError) => void
}
```

## Common Patterns

### Extract State and Handlers

```typescript
const { state, handlers, pagination } = usePackages()
const { state: actionState, handlers: actionHandlers } = usePackageActions()
```

### Check Loading States

```typescript
if (state.isLoading) {
  // Initial load - hide content
}

if (state.isRefetching) {
  // Background refetch - keep content visible
}

if (actionState.isLoading) {
  // Any action in progress
}

if (actionHandlers.isOperationInProgress('pkg_id')) {
  // Specific package operation
}
```

### Handle Errors

```typescript
if (state.error) {
  const message = getErrorMessage(state.error)
  console.error(message)

  if (isRetryableError(state.error)) {
    // Show retry button
  }
}
```

### Check Package Capabilities

```typescript
if (canInstallPackage(pkg)) {
  // Show install button
}

const actions = getAvailableActions(pkg)
// Filter UI based on available actions
```

### Format Display Values

```typescript
<span>{formatPackageStatus(pkg.status)}</span>
<span>{formatDate(pkg.createdAt)}</span>
<span>{formatNumber(pkg.downloadCount)} downloads</span>
<span>{formatRating(pkg.rating)} stars</span>
```

## API Integration

```typescript
// Your API should return these types

// GET /api/admin/packages
Response<PaginatedResponse<PackageInfo>>

// GET /api/admin/packages/:id
Response<PackageInfo>

// POST /api/admin/packages/:id/install
Response<PackageInfo>

// POST /api/admin/packages/:id/uninstall
Response<void>

// POST /api/admin/packages/:id/enable
Response<PackageInfo>

// POST /api/admin/packages/:id/disable
Response<PackageInfo>

// Error response
Response<{
  message: string
  code: PackageErrorCode
  statusCode: number
  details?: Record<string, unknown>
}>
```

## Imports

```typescript
// Hooks
import {
  usePackages,
  usePackageActions,
  usePackageDetails,
} from '@/hooks'

// Types
import type {
  PackageInfo,
  PackageStatus,
  PackageError,
  UsePackagesReturn,
  UsePackageActionsReturn,
  UsePackageDetailsReturn,
  PackagePageHandlers,
  ConfirmationOptions,
  ToastOptions,
  PaginatedResponse,
} from '@/lib/types/package-admin-types'

import { PackageErrorCode } from '@/lib/types/package-admin-types'

// Handlers & Utilities
import {
  createPackagePageHandlers,
  getErrorMessage,
  isRetryableError,
  formatPackageStatus,
  canInstallPackage,
  getAvailableActions,
  // ... etc
} from '@/lib/admin'
```

## TypeScript Strict Mode

All types are fully compatible with TypeScript strict mode:

```typescript
// ✅ Fully typed
const { state, handlers } = usePackages()
// state is never PackageListState
// handlers is never PackageListHandlers

// ✅ Error handling
if (state.error) {
  // state.error is definitely PackageError | null
  // Can safely access .code and .message
}

// ✅ Operation tracking
if (handlers.isOperationInProgress(packageId)) {
  // Safely check operation status
}

// ✅ Loading states
if (state.isLoading) {
  // Can't access state.packages without null check
} else {
  // state.packages is definitely PackageInfo[]
}
```

## Discriminated Unions (Status)

```typescript
// Use type guards for status-specific logic
function handlePackage(pkg: PackageInfo) {
  if (pkg.status === 'available') {
    // Show install button
  } else if (pkg.status === 'installed') {
    // Show enable/disable/uninstall buttons
  } else if (pkg.status === 'disabled') {
    // Show enable button only
  }
}

// Or use discriminated union
type PackageStatusBranch =
  | { status: 'available'; canInstall: true }
  | { status: 'installed'; canEnable: boolean; canDisable: boolean }
  | { status: 'disabled'; canEnable: true }
```

## Generic Helpers

```typescript
// Create error with code
function createError<T extends PackageErrorCode>(
  code: T,
  message: string
): PackageError {
  const error = new Error(message) as PackageError
  error.code = code
  error.name = 'PackageError'
  return error
}

// Transform package data
function transformPackage<T extends Partial<PackageInfo>>(
  data: T
): PackageInfo {
  // Type-safe transformation
  return data as PackageInfo
}
```

---

**Note**: All types follow MetaBuilder conventions and are fully compatible with React 18+ and TypeScript 5+.
