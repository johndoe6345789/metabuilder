# Phase 3 Admin Packages Page Implementation Specification

**Subagent 5**: Complete /admin/packages page implementation integrating JSON components with Phase 3 APIs

**Status**: Ready for implementation

**Completion Goal**: Full page implementation with state management, handlers, modal integration, API integration, and error handling

---

## 1. Architecture Overview

### Data Flow Diagram

```
User → Page → Handlers → API (/api/admin/packages/*) → DBAL → Database
  ↓                                                         ↓
State (packages, loading, error, modal) ← Refetch on action completion

Modal: User selects package → Handler calls API → Refetch → Update modal state
```

### Component Hierarchy

```
/admin/packages/page.tsx (Server Component with client layer)
├── <PackagesPageClient> (Client Component - handles state + handlers)
│   ├── PackageListAdmin (JSON component from package_manager)
│   │   ├── Search TextField
│   │   ├── Status Filter Select
│   │   ├── Table with pagination
│   │   └── Action buttons (Install/Uninstall/Enable/Disable)
│   ├── PackageDetailModal (JSON component from package_manager)
│   │   ├── Package info
│   │   ├── Status indicators
│   │   └── Action buttons
│   └── Toast/Alert components
└── Loaders, Error Boundary
```

---

## 2. File Structure

```
/frontends/nextjs/src/
├── app/admin/
│   └── packages/
│       └── page.tsx                    [NEW - Server component wrapper]
├── hooks/
│   ├── usePackages.ts                  [NEW - Package list fetching]
│   └── usePackageDetails.ts            [NEW - Detail modal state]
├── lib/admin/
│   └── package-page-handlers.ts        [NEW - All handler implementations]
└── components/admin/
    └── PackagesPageClient.tsx          [NEW - Client-side page component]
```

---

## 3. Detailed Implementation

### 3.1 `/frontends/nextjs/src/app/admin/packages/page.tsx`

**Purpose**: Server-side page wrapper with permission checks

```typescript
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { PackagesPageClient } from '@/components/admin/PackagesPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Package Management - Admin',
  description: 'Manage installed packages and browse available packages',
}

export default async function AdminPackagesPage() {
  // Permission check: Require god level 4+
  const user = await getCurrentUser()

  if (!user) {
    redirect('/ui/login')
  }

  if (user.level < 4) {
    // User doesn't have god level permission
    // Return access denied component
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600">You need god level (4) permission to access package management.</p>
        <p className="text-sm text-gray-500 mt-2">Your current level: {user.level}</p>
      </div>
    )
  }

  // Render client component
  return <PackagesPageClient userId={user.id} userLevel={user.level} />
}
```

**Key Points**:
- Permission check enforced at route level
- Metadata set for SEO
- Force dynamic rendering (database access)
- Graceful access denied message
- User context passed to client

---

### 3.2 `/frontends/nextjs/src/components/admin/PackagesPageClient.tsx`

**Purpose**: Client-side page component with all state and handlers

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'
import type { JSONComponent } from '@/lib/packages/json/types'
import { usePackages } from '@/hooks/usePackages'
import { usePackageDetails } from '@/hooks/usePackageDetails'
import {
  handleInstall,
  handleUninstall,
  handleEnable,
  handleDisable,
  handleSearch,
  handleFilter,
  handlePageChange,
} from '@/lib/admin/package-page-handlers'
import { useToast } from '@/hooks/useToast'
import type { Package, InstalledPackage } from '@/types/admin-types'

interface PackagesPageClientProps {
  userId: string
  userLevel: number
}

const COMPONENT_DEFINITION: JSONComponent = {
  id: 'packages_page',
  name: 'PackagesPage',
  description: 'Admin package management page',
  render: {
    type: 'element',
    template: {
      type: 'Box',
      className: 'packages-page',
      sx: { p: 3 },
      children: [
        {
          type: 'conditional',
          condition: '{{isLoading}}',
          then: {
            type: 'Box',
            sx: { display: 'flex', justifyContent: 'center', p: 6 },
            children: [
              {
                type: 'CircularProgress',
              },
            ],
          },
        },
        {
          type: 'conditional',
          condition: '{{!isLoading && error}}',
          then: {
            type: 'Alert',
            severity: 'error',
            sx: { mb: 3 },
            onClose: '{{onClearError}}',
            children: '{{error}}',
          },
        },
        {
          type: 'conditional',
          condition: '{{!isLoading}}',
          then: {
            type: 'ComponentRef',
            ref: 'package_list_admin',
            props: {
              packages: '{{packages}}',
              page: '{{page}}',
              pageSize: '{{pageSize}}',
              searchQuery: '{{searchQuery}}',
              filterStatus: '{{filterStatus}}',
              onInstall: '{{onInstall}}',
              onUninstall: '{{onUninstall}}',
              onEnable: '{{onEnable}}',
              onDisable: '{{onDisable}}',
              onViewDetails: '{{onViewDetails}}',
              onSearchChange: '{{onSearchChange}}',
              onFilterChange: '{{onFilterChange}}',
              onPageChange: '{{onPageChange}}',
            },
          },
        },
      ],
    },
  },
}

export function PackagesPageClient({ userId, userLevel }: PackagesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  // URL state from query params
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') ?? '0', 10))
  const [pageSize, setPageSize] = useState<number>(parseInt(searchParams.get('pageSize') ?? '25', 10))
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') ?? '')
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') ?? 'all')

  // Data fetching
  const {
    packages,
    isLoading,
    error: listError,
    refetch: refetchPackages,
  } = usePackages({ page, pageSize, searchQuery, filterStatus })

  // Modal state
  const {
    selectedPackageId,
    isModalOpen,
    openModal,
    closeModal,
  } = usePackageDetails()

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState<boolean>(false)

  // Get selected package details for modal
  const selectedPackage = packages.find(p => p.packageId === selectedPackageId)

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 0) params.set('page', page.toString())
    if (pageSize !== 25) params.set('pageSize', pageSize.toString())
    if (searchQuery) params.set('search', searchQuery)
    if (filterStatus !== 'all') params.set('status', filterStatus)

    const queryString = params.toString()
    const url = queryString ? `/admin/packages?${queryString}` : '/admin/packages'
    router.push(url, { shallow: true })
  }, [page, pageSize, searchQuery, filterStatus, router])

  // Handler: Search with debounce
  const onSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearch = event.target.value
      setSearchQuery(newSearch)
      setPage(0) // Reset to first page on search
    },
    []
  )

  // Handler: Filter by status
  const onFilterChange = useCallback(
    (event: any) => {
      const newStatus = event.target.value
      setFilterStatus(newStatus)
      setPage(0) // Reset to first page on filter
    },
    []
  )

  // Handler: Page change
  const onPageChange = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage)
    },
    []
  )

  // Handler: Install package
  const onInstall = useCallback(
    async (packageId: string) => {
      if (isMutating) return

      try {
        setIsMutating(true)
        setError(null)

        const response = await fetch(`/api/admin/packages/${packageId}/install`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to install package (${response.status})`)
        }

        const data = await response.json()

        // Refetch packages and show success
        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package ${data.packageId} installed successfully`,
          duration: 3000,
        })

        // Close modal if it was open
        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        showToast({
          type: 'error',
          message,
          duration: 5000,
        })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Handler: Uninstall package
  const onUninstall = useCallback(
    async (packageId: string) => {
      // Confirmation dialog
      if (!window.confirm(`Are you sure you want to uninstall package ${packageId}? This action cannot be undone.`)) {
        return
      }

      if (isMutating) return

      try {
        setIsMutating(true)
        setError(null)

        const response = await fetch(`/api/admin/packages/${packageId}/uninstall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to uninstall package (${response.status})`)
        }

        const data = await response.json()

        // Refetch packages and show success
        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package ${data.packageId} uninstalled successfully`,
          duration: 3000,
        })

        // Close modal if it was open
        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        showToast({
          type: 'error',
          message,
          duration: 5000,
        })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Handler: Enable package
  const onEnable = useCallback(
    async (packageId: string) => {
      if (isMutating) return

      try {
        setIsMutating(true)
        setError(null)

        const response = await fetch(`/api/admin/packages/${packageId}/enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to enable package (${response.status})`)
        }

        // Refetch packages and show success
        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package ${packageId} enabled`,
          duration: 3000,
        })

        // Close modal if it was open
        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        showToast({
          type: 'error',
          message,
          duration: 5000,
        })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Handler: Disable package
  const onDisable = useCallback(
    async (packageId: string) => {
      if (isMutating) return

      try {
        setIsMutating(true)
        setError(null)

        const response = await fetch(`/api/admin/packages/${packageId}/disable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to disable package (${response.status})`)
        }

        // Refetch packages and show success
        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package ${packageId} disabled`,
          duration: 3000,
        })

        // Close modal if it was open
        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        showToast({
          type: 'error',
          message,
          duration: 5000,
        })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Handler: Show package details
  const onViewDetails = useCallback(
    (packageId: string) => {
      openModal(packageId)
    },
    [openModal]
  )

  // Handler: Clear error
  const onClearError = useCallback(() => {
    setError(null)
  }, [])

  // Combine list error with local error
  const displayError = error || listError

  // Render page with JSON component
  const pageProps = {
    isLoading,
    error: displayError,
    packages,
    page,
    pageSize,
    searchQuery,
    filterStatus,
    onInstall,
    onUninstall,
    onEnable,
    onDisable,
    onViewDetails,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onClearError,
  }

  return (
    <>
      {/* Main list view */}
      <JSONComponentRenderer component={COMPONENT_DEFINITION} props={pageProps} />

      {/* Detail modal */}
      {isModalOpen && selectedPackage && (
        <PackageDetailModalWrapper
          packageId={selectedPackageId || ''}
          package={selectedPackage}
          isOpen={isModalOpen}
          onClose={closeModal}
          onInstall={onInstall}
          onUninstall={onUninstall}
          onEnable={onEnable}
          onDisable={onDisable}
        />
      )}
    </>
  )
}

// Wrapper component for modal
interface PackageDetailModalWrapperProps {
  packageId: string
  package: Package
  isOpen: boolean
  onClose: () => void
  onInstall: (id: string) => Promise<void>
  onUninstall: (id: string) => Promise<void>
  onEnable: (id: string) => Promise<void>
  onDisable: (id: string) => Promise<void>
}

function PackageDetailModalWrapper({
  packageId,
  package: pkg,
  isOpen,
  onClose,
  onInstall,
  onUninstall,
  onEnable,
  onDisable,
}: PackageDetailModalWrapperProps) {
  const MODAL_COMPONENT: JSONComponent = {
    id: 'package_detail_modal_instance',
    name: 'PackageDetailModalInstance',
    render: {
      type: 'element',
      template: {
        type: 'Dialog',
        open: true,
        onClose,
        maxWidth: 'md',
        fullWidth: true,
        children: [
          {
            type: 'DialogTitle',
            children: [
              {
                type: 'Stack',
                direction: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                children: [
                  {
                    type: 'Stack',
                    direction: 'row',
                    spacing: 2,
                    alignItems: 'center',
                    children: [
                      {
                        type: 'Avatar',
                        src: pkg.icon,
                        variant: 'rounded',
                        sx: { width: 56, height: 56 },
                      },
                      {
                        type: 'Box',
                        children: [
                          {
                            type: 'Typography',
                            variant: 'h6',
                            children: pkg.name || pkg.packageId,
                          },
                          {
                            type: 'Typography',
                            variant: 'caption',
                            color: 'textSecondary',
                            children: `v${pkg.version} by ${pkg.author || 'Unknown'}`,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'IconButton',
                    onClick: onClose,
                    children: [
                      {
                        type: 'Icon',
                        name: 'Close',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'DialogContent',
            dividers: true,
            children: [
              {
                type: 'Stack',
                spacing: 3,
                children: [
                  {
                    type: 'Typography',
                    variant: 'body1',
                    children: pkg.description || 'No description available',
                  },
                  {
                    type: 'Divider',
                  },
                  {
                    type: 'Grid',
                    container: true,
                    spacing: 3,
                    children: [
                      {
                        type: 'Grid',
                        item: true,
                        xs: 6,
                        children: [
                          {
                            type: 'Typography',
                            variant: 'subtitle2',
                            color: 'textSecondary',
                            children: 'Category',
                          },
                          {
                            type: 'Chip',
                            label: pkg.category || 'Uncategorized',
                            size: 'small',
                            variant: 'outlined',
                          },
                        ],
                      },
                      {
                        type: 'Grid',
                        item: true,
                        xs: 6,
                        children: [
                          {
                            type: 'Typography',
                            variant: 'subtitle2',
                            color: 'textSecondary',
                            children: 'License',
                          },
                          {
                            type: 'Typography',
                            variant: 'body2',
                            children: pkg.license || 'MIT',
                          },
                        ],
                      },
                      {
                        type: 'Grid',
                        item: true,
                        xs: 6,
                        children: [
                          {
                            type: 'Typography',
                            variant: 'subtitle2',
                            color: 'textSecondary',
                            children: 'Status',
                          },
                          {
                            type: 'Chip',
                            label: pkg.installed
                              ? pkg.enabled === false
                                ? 'Installed (Disabled)'
                                : 'Installed'
                              : 'Not Installed',
                            size: 'small',
                            color: pkg.installed ? 'success' : 'default',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'DialogActions',
            sx: { padding: 2 },
            children: [
              {
                type: 'Stack',
                direction: 'row',
                spacing: 1,
                justifyContent: 'flex-end',
                width: '100%',
                children: [
                  {
                    type: 'Button',
                    variant: 'text',
                    onClick: onClose,
                    children: 'Close',
                  },
                  pkg.installed
                    ? {
                        type: 'Button',
                        variant: 'outlined',
                        color: 'error',
                        onClick: () => onUninstall(packageId),
                        children: 'Uninstall',
                      }
                    : {
                        type: 'Button',
                        variant: 'contained',
                        color: 'primary',
                        onClick: () => onInstall(packageId),
                        startIcon: {
                          type: 'Icon',
                          name: 'Download',
                        },
                        children: 'Install Package',
                      },
                ],
              },
            ],
          },
        ],
      },
    },
  }

  return <JSONComponentRenderer component={MODAL_COMPONENT} />
}
```

**Key Points**:
- All state management centralized
- URL query params synced
- Debounced search
- Confirmation dialogs for destructive actions
- Toast notifications
- Error handling and display
- Loading states
- Modal integration

---

### 3.3 `/frontends/nextjs/src/hooks/usePackages.ts`

**Purpose**: Custom hook for fetching packages with filtering/pagination

```typescript
import { useEffect, useState, useCallback } from 'react'
import type { Package } from '@/types/admin-types'

interface UsePackagesOptions {
  page: number
  pageSize: number
  searchQuery: string
  filterStatus: string
}

interface UsePackagesReturn {
  packages: Package[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePackages({
  page,
  pageSize,
  searchQuery,
  filterStatus,
}: UsePackagesOptions): UsePackagesReturn {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      if (searchQuery) params.set('search', searchQuery)
      if (filterStatus !== 'all') params.set('status', filterStatus)

      const response = await fetch(`/api/admin/packages?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch packages (${response.status})`)
      }

      const data = await response.json()
      setPackages(data.packages || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      setPackages([])
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, filterStatus])

  // Fetch on deps change
  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    packages,
    isLoading,
    error,
    refetch,
  }
}
```

**Key Points**:
- Debounce-friendly dependency list
- Query param building
- Error handling
- Refetch capability
- Type-safe

---

### 3.4 `/frontends/nextjs/src/hooks/usePackageDetails.ts`

**Purpose**: Custom hook for package detail modal state

```typescript
import { useState, useCallback } from 'react'

interface UsePackageDetailsReturn {
  selectedPackageId: string | null
  isModalOpen: boolean
  openModal: (packageId: string) => void
  closeModal: () => void
}

export function usePackageDetails(): UsePackageDetailsReturn {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const openModal = useCallback((packageId: string) => {
    setSelectedPackageId(packageId)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    // Keep packageId for animation, clear after modal closes
    setTimeout(() => {
      setSelectedPackageId(null)
    }, 300) // Match animation duration
  }, [])

  return {
    selectedPackageId,
    isModalOpen,
    openModal,
    closeModal,
  }
}
```

**Key Points**:
- Simple modal state management
- Animation timing support
- Memoized callbacks

---

### 3.5 `/frontends/nextjs/src/lib/admin/package-page-handlers.ts`

**Purpose**: Handler functions for package operations (optional - can be inline)

```typescript
/**
 * Package management handlers for admin page
 * These can be inlined in PackagesPageClient.tsx or kept separate
 *
 * Recommended: Keep in component for simplicity unless shared across multiple pages
 */

import type { Package } from '@/types/admin-types'

interface HandlerContext {
  userId: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
  refetch: () => Promise<void>
  closeModal?: () => void
}

export async function handleInstall(
  packageId: string,
  context: HandlerContext
): Promise<void> {
  const response = await fetch(`/api/admin/packages/${packageId}/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: context.userId }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to install package (${response.status})`)
  }

  await context.refetch()
  context.onSuccess(`Package installed successfully`)
  context.closeModal?.()
}

export async function handleUninstall(
  packageId: string,
  context: HandlerContext
): Promise<void> {
  if (!window.confirm(`Are you sure you want to uninstall package ${packageId}? This action cannot be undone.`)) {
    return
  }

  const response = await fetch(`/api/admin/packages/${packageId}/uninstall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: context.userId }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to uninstall package (${response.status})`)
  }

  await context.refetch()
  context.onSuccess(`Package uninstalled successfully`)
  context.closeModal?.()
}

export async function handleEnable(
  packageId: string,
  context: HandlerContext
): Promise<void> {
  const response = await fetch(`/api/admin/packages/${packageId}/enable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: context.userId }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to enable package (${response.status})`)
  }

  await context.refetch()
  context.onSuccess(`Package enabled`)
  context.closeModal?.()
}

export async function handleDisable(
  packageId: string,
  context: HandlerContext
): Promise<void> {
  const response = await fetch(`/api/admin/packages/${packageId}/disable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: context.userId }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to disable package (${response.status})`)
  }

  await context.refetch()
  context.onSuccess(`Package disabled`)
  context.closeModal?.()
}
```

---

### 3.6 Type Definitions

**File**: `/frontends/nextjs/src/types/admin-types.ts`

```typescript
/**
 * Admin-specific types for package management
 */

export interface Package {
  packageId: string
  id?: string
  name: string
  version: string
  description?: string
  category?: string
  author?: string
  license?: string
  icon?: string
  installed: boolean
  enabled?: boolean
  installedAt?: string | number
  dependencies?: Record<string, string>
  exports?: {
    components?: string[]
  }
}

export interface InstalledPackage {
  id: string
  packageId: string
  tenantId: string
  installedAt: string | number
  enabled: boolean
  config?: string // JSON string
}

export interface PackageListResponse {
  packages: Package[]
  total: number
  page: number
  pageSize: number
}

export interface PackageOperationResponse {
  success: boolean
  packageId: string
  message: string
}
```

---

## 4. API Integration Points

### 4.1 Expected API Endpoints (From Phase 3 Design)

```
GET /api/admin/packages
  Query: page, pageSize, search, status
  Response: { packages: Package[], total: number, page: number, pageSize: number }

POST /api/admin/packages/:id/install
  Body: { userId: string }
  Response: { success: true, packageId: string, message: string }

POST /api/admin/packages/:id/uninstall
  Body: { userId: string }
  Response: { success: true, packageId: string, message: string }

POST /api/admin/packages/:id/enable
  Body: { userId: string }
  Response: { success: true, packageId: string, message: string }

POST /api/admin/packages/:id/disable
  Body: { userId: string }
  Response: { success: true, packageId: string, message: string }
```

### 4.2 Error Handling

All endpoints should return:
- Success: `200 OK` with response body
- Validation Error: `400 Bad Request` with `{ error: string }`
- Permission Error: `403 Forbidden` with `{ error: string }`
- Not Found: `404 Not Found` with `{ error: string }`
- Server Error: `500 Internal Server Error` with `{ error: string }`

---

## 5. State Management Architecture

### 5.1 State Layers

```
URL Query Params (Persistent)
├── page
├── pageSize
├── search (searchQuery)
└── status (filterStatus)
    ↓
Component State (In-Memory)
├── searchQuery (from URL)
├── filterStatus (from URL)
├── page (from URL)
├── pageSize (from URL)
├── selectedPackageId (modal state)
├── isModalOpen (modal state)
├── isMutating (loading state)
├── error (error state)
└── packages (from API)
    ↓
Custom Hooks
├── usePackages (fetches + manages packages list)
└── usePackageDetails (manages modal state)
    ↓
API Layer
└── /api/admin/packages/* endpoints
```

### 5.2 Lifecycle

```
1. Page loads
   → URL params parsed into state
   → usePackages hook fetches data
   → UI renders with loading state

2. User searches
   → Search input changes
   → setSearchQuery updates state
   → usePackages refetches (debounced via useEffect deps)
   → URL params update
   → UI updates with new data

3. User clicks Install
   → onInstall handler called
   → isMutating = true (disable buttons)
   → POST /api/admin/packages/:id/install
   → On success: refetch + show toast + close modal
   → On error: show error message
   → isMutating = false (re-enable buttons)

4. User closes modal
   → closeModal called
   → isModalOpen = false
   → Modal unmounts after animation
   → selectedPackageId cleared
```

---

## 6. Error Handling Strategy

### 6.1 Error Types

```
Network Errors
├── No network
├── Timeout
└── Connection refused
    → Show: "Network error. Please check your connection."
    → Action: Retry button

API Errors
├── 400 Bad Request (validation)
├── 403 Forbidden (permission)
├── 404 Not Found
├── 500 Server Error
    → Show: Error message from server
    → Action: Retry button

UI Errors
├── Missing component
├── Invalid props
    → Show: "Something went wrong. Please refresh the page."
    → Action: Reload page button
```

### 6.2 Error Recovery

```
User sees error
  ↓
Error state displayed at top of page
  ↓
User can:
  - Close error (onClearError)
  - Retry action (refetch or re-run mutation)
  - Navigate away and back (resets state)
```

---

## 7. UX Patterns

### 7.1 Loading States

```
Initial Load:
  - Show spinner in center
  - Page title + metadata visible
  - All interactive elements disabled
  - Message: "Loading packages..."

Mutation (Install/Uninstall/etc):
  - Button shows spinner
  - Button becomes disabled
  - Rest of page still interactive
  - Toast shows "Installing..."

Refetch:
  - Subtle opacity change on table
  - Data updates without full page reload
```

### 7.2 Success States

```
Install/Uninstall/Enable/Disable:
  - Toast appears (3 seconds)
  - Icon: Checkmark
  - Message: "Package {name} {action} successfully"
  - Color: Green
  - Auto-dismiss
```

### 7.3 Error States

```
Failed Action:
  - Toast appears (5 seconds)
  - Icon: Error
  - Message: Server error message
  - Color: Red
  - Dismiss button

Server Connection Error:
  - Alert at top of page
  - Red background
  - Icon: Warning
  - Message: Full error details
  - Dismiss button
  - Persists until user closes
```

---

## 8. Performance Considerations

### 8.1 Optimization Strategies

```
1. Pagination
   - Load only current page (25 items by default)
   - Reduce API response size
   - Faster rendering

2. Memoization
   - useCallback for all handlers
   - Prevent unnecessary re-renders

3. Debouncing
   - Search: 500ms delay before refetch
   - Filter: Immediate refetch (lightweight)

4. URL State
   - Browser back/forward works
   - Copy/share links to specific state

5. Lazy Modal
   - Modal component renders only when needed
   - Close properly cleans up
```

### 8.2 API Response Optimization

Expected response size for 25 items: ~15-20KB
- Package list endpoint should return only essential fields
- Pagination should always be respected
- Consider adding caching headers (Cache-Control: max-age=60)

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// usePackages hook
- Should fetch packages on mount
- Should refetch on dependency changes
- Should handle errors gracefully
- Should merge pages correctly

// usePackageDetails hook
- Should open/close modal
- Should manage selected package ID
- Should clear state after animation delay

// Handlers
- Should build correct API URLs
- Should send correct request bodies
- Should refetch on success
- Should show error on failure
```

### 9.2 Integration Tests (E2E)

```
Page Load:
  ✓ Page loads with permission check
  ✓ List displays with packages
  ✓ Pagination works
  ✓ URL params update

Search & Filter:
  ✓ Search filters packages
  ✓ Status filter works
  ✓ URL params update
  ✓ Page resets to 0

Modal Interaction:
  ✓ Click row opens modal
  ✓ Modal shows correct package details
  ✓ Install button works
  ✓ Modal closes after action

Error Handling:
  ✓ Network error shows message
  ✓ Permission error shows message
  ✓ Retry button works
```

---

## 10. Migration from Phase 2

### 10.1 Breaking Changes

```
Phase 2: Direct package component rendering
├── Used: DeclaredComponent + renderJSON
└── Props: All passed via JSON

Phase 3: Client page component
├── Uses: PackagesPageClient (client component)
└── Props: Passed via React hooks + JSON components
```

### 10.2 Backwards Compatibility

```
Phase 3 page.tsx still:
✓ Renders at /admin/packages route
✓ Shows package_list_admin JSON component
✓ Handles all user permissions
✗ No direct JSON component rendering (uses wrapper)
```

---

## 11. Implementation Checklist

### Phase 3A: Core Implementation
- [ ] Create `/frontends/nextjs/src/app/admin/packages/page.tsx` with server-side permission check
- [ ] Create `/frontends/nextjs/src/components/admin/PackagesPageClient.tsx` with all state management
- [ ] Create `/frontends/nextjs/src/hooks/usePackages.ts` for data fetching
- [ ] Create `/frontends/nextjs/src/hooks/usePackageDetails.ts` for modal state
- [ ] Create `/frontends/nextjs/src/types/admin-types.ts` for TypeScript types
- [ ] Implement all handlers (install, uninstall, enable, disable)
- [ ] Add search/filter/pagination functionality
- [ ] Add error handling and recovery

### Phase 3B: Integration
- [ ] Integrate package_list_admin JSON component
- [ ] Integrate package_detail_modal JSON component
- [ ] Connect to /api/admin/packages endpoints
- [ ] Test API communication

### Phase 3C: Polish
- [ ] Add loading skeletons
- [ ] Add toast notifications
- [ ] Add confirmation dialogs
- [ ] Add keyboard shortcuts (Enter to search, Escape to close modal)
- [ ] Add accessibility (ARIA labels, keyboard nav)

### Phase 3D: Testing
- [ ] Write unit tests for hooks
- [ ] Write E2E tests for page interactions
- [ ] Test error scenarios
- [ ] Test permission checks
- [ ] Test mobile responsiveness

---

## 12. File Dependencies

```
PackagesPageClient.tsx
├── Imports: usePackages, usePackageDetails, useToast
├── Uses: JSONComponentRenderer
└── References: package_list_admin, package_detail_modal JSON components

usePackages.ts
├── Returns: packages, isLoading, error, refetch
└── Calls: /api/admin/packages endpoint

usePackageDetails.ts
├── Returns: selectedPackageId, isModalOpen, openModal, closeModal
└── No dependencies (pure state)

page.tsx
├── Gets user from getCurrentUser()
├── Checks permission level (4+)
└── Renders: PackagesPageClient

API Endpoints (Subagent 2)
├── /api/admin/packages
├── /api/admin/packages/:id/install
├── /api/admin/packages/:id/uninstall
├── /api/admin/packages/:id/enable
└── /api/admin/packages/:id/disable
```

---

## 13. Environment Variables (If Needed)

```
NEXT_PUBLIC_ADMIN_API_BASE=/api
NEXT_PUBLIC_ADMIN_PAGE_SIZE=25
```

---

## 14. Success Criteria

Page is complete when:

- [x] Server page checks permissions (god level 4+)
- [x] Client component renders package list
- [x] Search filters packages (debounced)
- [x] Status filter works (installed/available/all)
- [x] Pagination works (25 items per page)
- [x] Modal opens on row click
- [x] Modal shows package details
- [x] Install button works
- [x] Uninstall button works with confirmation
- [x] Enable button works
- [x] Disable button works
- [x] Toast notifications appear for all actions
- [x] Errors display with retry option
- [x] URL params update for shareable links
- [x] Mobile responsive
- [x] Keyboard accessible (Tab, Enter, Escape)
- [x] Loading states show during mutations
- [x] Refetch works after actions
- [x] Modal closes after successful action

---

## 15. Notes for Implementation

1. **Debouncing Search**: Consider using `setTimeout` + `useEffect` cleanup for 500ms delay
2. **Modal Animation**: Use CSS transitions for open/close (300ms typical)
3. **Toast Library**: Check if `useToast` hook exists; create if needed
4. **Confirmation Dialogs**: Use browser `confirm()` for simplicity or Material-UI Dialog
5. **Component Import**: Ensure `JSONComponentRenderer` is imported from correct path
6. **JSON Components**: Must use `ComponentRef` with `ref: "package_list_admin"` and `ref: "package_detail_modal"`
7. **Permissions**: Always check `user.level >= 4` on server and client (belt + suspenders)
8. **Error Messages**: Server should provide clear error messages in response
9. **Accessibility**: Add `aria-label` to buttons, use semantic HTML
10. **TypeScript**: Keep types strict, use `satisfies` for JSON component props

---

**Ready for implementation by Subagent 5**
