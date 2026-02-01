# Phase 3 Admin Packages Page - Implementation Guide

**Quick Reference Guide for Implementing /admin/packages**

---

## Quick Start Checklist

```
✓ Read: /docs/PHASE3_ADMIN_PACKAGES_PAGE.md (architecture + design)
✓ Review: /packages/package_manager/components/ui.json (JSON component definitions)
✓ Review: Current page patterns in /frontends/nextjs/src/app/page.tsx
✓ Implement: Files in order below
```

---

## Step 1: Create Server Page

**File**: `/frontends/nextjs/src/app/admin/packages/page.tsx`

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
  const user = await getCurrentUser()

  if (!user) {
    redirect('/ui/login')
  }

  if (user.level < 4) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600">You need god level (4) permission to access package management.</p>
        <p className="text-sm text-gray-500 mt-2">Your current level: {user.level}</p>
      </div>
    )
  }

  return <PackagesPageClient userId={user.id} userLevel={user.level} />
}
```

---

## Step 2: Create Type Definitions

**File**: `/frontends/nextjs/src/types/admin-types.ts`

```typescript
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
  config?: string
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

## Step 3: Create Custom Hooks

**File**: `/frontends/nextjs/src/hooks/usePackages.ts`

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

**File**: `/frontends/nextjs/src/hooks/usePackageDetails.ts`

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
    setTimeout(() => {
      setSelectedPackageId(null)
    }, 300)
  }, [])

  return {
    selectedPackageId,
    isModalOpen,
    openModal,
    closeModal,
  }
}
```

---

## Step 4: Create useToast Hook (If Missing)

**File**: `/frontends/nextjs/src/hooks/useToast.ts`

```typescript
import { useCallback } from 'react'

interface Toast {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function useToast() {
  const showToast = useCallback((toast: Toast) => {
    // If no toast library exists, use browser alert for now
    // Replace with Material-UI Snackbar or similar in production
    if (toast.type === 'error') {
      console.error('[Toast]', toast.message)
      alert(`Error: ${toast.message}`)
    } else if (toast.type === 'success') {
      console.log('[Toast]', toast.message)
      // Could emit custom event or use context provider
    }
  }, [])

  return { showToast }
}
```

---

## Step 5: Create Client Component

**File**: `/frontends/nextjs/src/components/admin/PackagesPageClient.tsx`

### Part 1: Imports & Component Definition

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'
import type { JSONComponent } from '@/lib/packages/json/types'
import { usePackages } from '@/hooks/usePackages'
import { usePackageDetails } from '@/hooks/usePackageDetails'
import { useToast } from '@/hooks/useToast'
import type { Package } from '@/types/admin-types'

interface PackagesPageClientProps {
  userId: string
  userLevel: number
}

export function PackagesPageClient({ userId, userLevel }: PackagesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
```

### Part 2: State Management

```typescript
  // URL state
  const [page, setPage] = useState<number>(
    parseInt(searchParams.get('page') ?? '0', 10)
  )
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('pageSize') ?? '25', 10)
  )
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') ?? ''
  )
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get('status') ?? 'all'
  )

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

  const selectedPackage = packages.find(p => p.packageId === selectedPackageId)
```

### Part 3: URL Synchronization

```typescript
  // Sync URL params
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
```

### Part 4: Event Handlers

```typescript
  // Search handler
  const onSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
      setPage(0)
    },
    []
  )

  // Filter handler
  const onFilterChange = useCallback((event: any) => {
    setFilterStatus(event.target.value)
    setPage(0)
  }, [])

  // Pagination handler
  const onPageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  // Install handler
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
          throw new Error(
            errorData.error || `Failed to install package (${response.status})`
          )
        }

        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package installed successfully`,
          duration: 3000,
        })

        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        showToast({ type: 'error', message, duration: 5000 })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Uninstall handler
  const onUninstall = useCallback(
    async (packageId: string) => {
      if (!window.confirm(
        `Are you sure you want to uninstall ${packageId}? This cannot be undone.`
      )) {
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
          throw new Error(
            errorData.error || `Failed to uninstall package (${response.status})`
          )
        }

        await refetchPackages()
        showToast({
          type: 'success',
          message: `Package uninstalled successfully`,
          duration: 3000,
        })

        if (isModalOpen) closeModal()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        showToast({ type: 'error', message, duration: 5000 })
      } finally {
        setIsMutating(false)
      }
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // Enable/Disable handlers (similar pattern)
  const onEnable = useCallback(
    async (packageId: string) => {
      if (isMutating) return
      // ... similar to onInstall
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  const onDisable = useCallback(
    async (packageId: string) => {
      if (isMutating) return
      // ... similar to onInstall
    },
    [isMutating, userId, refetchPackages, showToast, isModalOpen, closeModal]
  )

  // View details handler
  const onViewDetails = useCallback(
    (packageId: string) => {
      openModal(packageId)
    },
    [openModal]
  )

  // Clear error handler
  const onClearError = useCallback(() => {
    setError(null)
  }, [])
```

### Part 5: Render

```typescript
  const displayError = error || listError

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

  // Main list component (from JSON)
  const LIST_COMPONENT: JSONComponent = {
    id: 'packages_page',
    name: 'PackagesPage',
    render: {
      type: 'element',
      template: {
        type: 'Box',
        className: 'packages-page',
        sx: { p: 3 },
        children: [
          // Loading
          {
            type: 'conditional',
            condition: '{{isLoading}}',
            then: {
              type: 'Box',
              sx: { display: 'flex', justifyContent: 'center', p: 6 },
              children: [{ type: 'CircularProgress' }],
            },
          },
          // Error alert
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
          // List component
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

  return (
    <>
      <JSONComponentRenderer component={LIST_COMPONENT} props={pageProps} />

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

// Modal wrapper component (builds inline JSON for modal)
function PackageDetailModalWrapper({
  packageId,
  package: pkg,
  isOpen,
  onClose,
  onInstall,
  onUninstall,
}: {
  packageId: string
  package: Package
  isOpen: boolean
  onClose: () => void
  onInstall: (id: string) => Promise<void>
  onUninstall: (id: string) => Promise<void>
  onEnable: (id: string) => Promise<void>
  onDisable: (id: string) => Promise<void>
}) {
  const MODAL: JSONComponent = {
    id: 'pkg_detail_modal',
    name: 'PackageDetailModal',
    render: {
      type: 'element',
      template: {
        type: 'Dialog',
        open: true,
        onClose,
        maxWidth: 'md',
        fullWidth: true,
        children: [
          // Dialog title with close button
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
                    children: [{ type: 'Icon', name: 'Close' }],
                  },
                ],
              },
            ],
          },
          // Dialog content
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
                    children: pkg.description || 'No description',
                  },
                  { type: 'Divider' },
                  // Package metadata in grid
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
                    ],
                  },
                ],
              },
            ],
          },
          // Dialog actions
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

  return <JSONComponentRenderer component={MODAL} />
}
```

---

## Step 6: Test the Page

### Quick Test Checklist

```typescript
// 1. Permission check
// Navigate to /admin/packages as non-god user
// Should see: "Access Denied"

// 2. Permission granted
// Navigate as god user (level 4+)
// Should see: Package list table

// 3. Search
// Type in search box
// List filters (debounced)

// 4. Filter
// Change status dropdown
// List filters immediately

// 5. Pagination
// Click "Next" button
// URL changes, data updates

// 6. Install
// Click install button on available package
// Toast shows success
// List updates
// Package now shows as "Installed"

// 7. Modal
// Click package row
// Modal opens
// Shows full details
// Close button works

// 8. Uninstall from modal
// Click uninstall
// Confirmation dialog
// If confirmed: uninstalls, refreshes, closes modal
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module useToast"

**Solution**: Create the hook if it doesn't exist:
```typescript
// /frontends/nextjs/src/hooks/useToast.ts
export function useToast() {
  return {
    showToast: (toast) => console.log(toast),
  }
}
```

### Issue 2: JSONComponentRenderer not found

**Solution**: Check import path matches:
```typescript
import { JSONComponentRenderer } from '@/components/JSONComponentRenderer'
```

### Issue 3: Types not working

**Solution**: Ensure admin-types.ts is in correct location:
```
/frontends/nextjs/src/types/admin-types.ts
```

### Issue 4: API returns 404

**Solution**: Verify endpoints exist:
- GET /api/admin/packages
- POST /api/admin/packages/:id/install (etc.)

Check Subagent 2 implementation for endpoints.

### Issue 5: Modal doesn't close after action

**Solution**: Ensure handlers properly call `closeModal()`:
```typescript
if (isModalOpen) closeModal()
```

### Issue 6: URL params don't update

**Solution**: Check useEffect runs after state changes:
```typescript
}, [page, pageSize, searchQuery, filterStatus, router])
```

---

## Performance Tips

1. **Lazy load JSON components** - Only render modal when needed
2. **Memoize callbacks** - Use useCallback for all handlers
3. **Debounce search** - Consider adding useEffect cleanup
4. **Pagination limits** - Keep pageSize reasonable (25 is good)
5. **Error caching** - Don't refetch immediately on error

---

## Accessibility Checklist

- [ ] Add `aria-label` to all icon buttons
- [ ] Add `aria-busy` during loading
- [ ] Use semantic HTML
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test screen reader with package names
- [ ] Add ARIA labels to table cells

---

## Next Steps After Implementation

1. **Write tests** - Unit tests for hooks, E2E tests for page
2. **Add keyboard shortcuts** - Ctrl+K for search, Escape for modal
3. **Add analytics** - Track install/uninstall events
4. **Optimize bundle** - Code-split modal component
5. **Add caching** - Cache package list with stale-while-revalidate
6. **Add favorites** - Let admins favorite frequently used packages

---

## Documentation Links

- Full spec: `/docs/PHASE3_ADMIN_PACKAGES_PAGE.md`
- JSON components: `/packages/package_manager/components/ui.json`
- API endpoints: `/docs/PHASE3_ADMIN_API.md` (Subagent 2)
- Frontend patterns: `/frontends/nextjs/src/app/page.tsx` (reference)
