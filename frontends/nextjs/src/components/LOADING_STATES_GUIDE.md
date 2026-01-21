# Loading States Implementation Guide

**Status**: ✅ Complete and Production-Ready
**Date**: January 21, 2026
**Phase**: Phase 5.1 - UX Polish & Performance Optimization

---

## Overview

This guide documents the complete loading states system for MetaBuilder's Next.js frontend. The system provides:

- **Unified skeleton components** for consistent placeholder UI
- **Multiple loading variants** for different content types (tables, cards, lists, forms)
- **Smooth animations** following Material Design principles
- **Async data hooks** for automatic loading state management
- **Error boundary integration** for resilient error handling
- **Accessibility-first** design with ARIA labels and keyboard support

---

## Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────┐
│     Loading States System                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Base Skeleton Components       │   │
│  │   (in Skeleton.tsx)              │   │
│  ├─────────────────────────────────┤   │
│  │ • Skeleton (basic block)         │   │
│  │ • TableSkeleton (rows + cols)    │   │
│  │ • CardSkeleton (grid layout)     │   │
│  │ • ListSkeleton (item rows)       │   │
│  └─────────────────────────────────┘   │
│           ▲                              │
│           │                              │
│  ┌────────┴──────────────────────────┐  │
│  │  LoadingSkeleton Wrapper           │  │
│  │  (in LoadingSkeleton.tsx)          │  │
│  ├──────────────────────────────────┤  │
│  │ • Unified variant API             │  │
│  │ • Error state handling            │  │
│  │ • Loading message display         │  │
│  │ • Specialized variants:           │  │
│  │   - TableLoading                  │  │
│  │   - CardLoading                   │  │
│  │   - ListLoading                   │  │
│  │   - InlineLoading                 │  │
│  │   - FormLoading                   │  │
│  └──────────────────────────────────┘  │
│           ▲                              │
│           │                              │
│  ┌────────┴──────────────────────────┐  │
│  │  Async Data Hooks                  │  │
│  │  (in useAsyncData.ts)              │  │
│  ├──────────────────────────────────┤  │
│  │ • useAsyncData (base hook)        │  │
│  │ • usePaginatedData                │  │
│  │ • useMutation                     │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## CSS Animations

Located in `/src/styles/core/theme.scss`:

### 1. Skeleton Pulse (`skeleton-pulse`)
- **Duration**: 2s
- **Effect**: Smooth color gradient pulse
- **Usage**: Applied automatically with `skeleton-animate` class
- **Accessibility**: Respects `prefers-reduced-motion`

```scss
@keyframes skeleton-pulse {
  0%   { background-color: #e0e0e0; }
  50%  { background-color: #f0f0f0; }
  100% { background-color: #e0e0e0; }
}
```

### 2. Spinner Rotation (`spin`)
- **Duration**: 1s
- **Effect**: Smooth 360° rotation
- **Usage**: Loading spinner for large operations
- **Accessibility**: Paired with `aria-busy` attribute

```scss
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 3. Progress Bar (`progress-animation`)
- **Duration**: 1.5s
- **Effect**: Left-to-right motion
- **Usage**: Linear progress indicator
- **Accessibility**: Paired with `role="progressbar"` and `aria-valuenow`

```scss
@keyframes progress-animation {
  0%   { width: 0%; }
  50%  { width: 100%; }
  100% { width: 0%; }
}
```

### 4. Pulse Indicator (`pulse-animation`)
- **Duration**: 2s
- **Effect**: Opacity and scale pulse
- **Usage**: Attention-drawing status indicators
- **Accessibility**: Optional - use sparingly

```scss
@keyframes pulse-animation {
  0%, 100%  { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.05); }
}
```

### 5. Dots Animation (`dots-animation`)
- **Duration**: 1.4s per dot
- **Effect**: Sequential vertical bounce
- **Usage**: Loading progress dots
- **Accessibility**: Single element with staggered animation

```scss
@keyframes dots-animation {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30%           { opacity: 1;   transform: translateY(-12px); }
}
```

### 6. Shimmer Effect (`shimmer`)
- **Duration**: 2s
- **Effect**: Left-to-right light sweep
- **Usage**: Premium skeleton placeholder
- **Accessibility**: Can be disabled entirely without breaking functionality

```scss
@keyframes shimmer {
  0%   { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## Components API

### Base Skeleton Component

**File**: `src/components/Skeleton.tsx`

```typescript
export function Skeleton({
  width = '100%',           // Width of skeleton
  height = '20px',          // Height of skeleton
  borderRadius = '4px',     // Corner radius
  animate = true,           // Show animation
  className?: string,       // Custom CSS class
  style?: React.CSSProperties,
}: SkeletonProps)
```

**Example**:
```tsx
<Skeleton width="80%" height="16px" animate={true} />
```

### TableSkeleton Component

**File**: `src/components/Skeleton.tsx`

```typescript
export function TableSkeleton({
  rows = 5,                 // Number of rows to show
  columns = 4,              // Number of columns
  className?: string,
}: TableSkeletonProps)
```

**Example**:
```tsx
<TableSkeleton rows={10} columns={6} />
```

### CardSkeleton Component

**File**: `src/components/Skeleton.tsx`

```typescript
export function CardSkeleton({
  count = 3,                // Number of cards to show
  className?: string,
}: CardSkeletonProps)
```

**Example**:
```tsx
<CardSkeleton count={6} />
```

### ListSkeleton Component

**File**: `src/components/Skeleton.tsx`

```typescript
export function ListSkeleton({
  count = 8,                // Number of items to show
  className?: string,
}: ListSkeletonProps)
```

**Example**:
```tsx
<ListSkeleton count={10} />
```

### LoadingSkeleton Unified Component

**File**: `src/components/LoadingSkeleton.tsx`

Main unified component combining all variants:

```typescript
export function LoadingSkeleton({
  isLoading = true,         // Whether to show skeleton
  variant = 'block',        // 'block' | 'table' | 'card' | 'list' | 'inline'
  rows = 5,                 // For table/list variants
  columns = 4,              // For table variant only
  count = 3,                // For card variant
  width = '100%',           // For block variant
  height = '20px',          // For block variant
  animate = true,           // Show animation
  className?: string,
  style?: React.CSSProperties,
  error?: Error | string | null,      // Error state
  errorComponent?: React.ReactNode,   // Custom error UI
  loadingMessage?: string,  // Message during loading
  children: React.ReactNode,
}: LoadingSkeletonProps)
```

---

## Specialized Components

### TableLoading

For loading data tables:

```typescript
<TableLoading
  isLoading={isLoading}
  rows={10}
  columns={5}
  error={error}
>
  {/* Table content here */}
</TableLoading>
```

### CardLoading

For loading card grids:

```typescript
<CardLoading
  isLoading={isLoading}
  count={6}
  error={error}
>
  {/* Cards here */}
</CardLoading>
```

### ListLoading

For loading lists:

```typescript
<ListLoading
  isLoading={isLoading}
  rows={8}
  error={error}
>
  {/* List items here */}
</ListLoading>
```

### InlineLoading

For small sections and buttons:

```typescript
<InlineLoading
  isLoading={isLoading}
  width="100px"
  height="20px"
>
  {/* Content here */}
</InlineLoading>
```

### FormLoading

For form field skeletons:

```typescript
<FormLoading
  isLoading={isLoading}
  fields={3}  // Number of form fields
  error={error}
>
  {/* Form content here */}
</FormLoading>
```

---

## Async Data Hooks

### useAsyncData Hook

**File**: `src/hooks/useAsyncData.ts`

Main hook for managing async operations:

```typescript
const { data, isLoading, error, isRefetching, retry, refetch } = useAsyncData(
  async () => {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  },
  {
    dependencies: [userId],     // Refetch when dependencies change
    retries: 3,                 // Retry on failure
    retryDelay: 1000,          // Wait 1s between retries
    refetchOnFocus: true,      // Refetch when window gains focus
    refetchInterval: 30000,    // Auto-refetch every 30s (null = disabled)
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Error:', error),
  }
)
```

**Result object**:
- `data` (T | undefined) - The fetched data
- `isLoading` (boolean) - Whether currently loading
- `error` (Error | null) - Any error that occurred
- `isRefetching` (boolean) - Whether a refetch is in progress
- `retry()` (function) - Manually retry the fetch
- `refetch()` (function) - Manually refetch data

### usePaginatedData Hook

For paginated APIs:

```typescript
const {
  data,           // Current page data
  isLoading,
  error,
  page,           // Current page (0-based)
  pageCount,      // Total pages
  itemCount,      // Total items
  goToPage,       // (page: number) => void
  nextPage,       // () => void
  previousPage,   // () => void
} = usePaginatedData(
  async (page, pageSize) => {
    const res = await fetch(`/api/items?page=${page}&size=${pageSize}`)
    return res.json()  // Must return { items: T[], total: number }
  },
  {
    pageSize: 10,
    initialPage: 0,
    refetchOnFocus: true,
  }
)
```

### useMutation Hook

For write operations (POST, PUT, DELETE):

```typescript
const { mutate, isLoading, error, reset } = useMutation(
  async (userData) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (!res.ok) throw new Error('Failed to create user')
    return res.json()
  },
  {
    onSuccess: (data) => console.log('Created:', data),
    onError: (error) => console.error('Error:', error),
  }
)

// Use in form submission
const handleSubmit = async (formData) => {
  try {
    const result = await mutate(formData)
    // Success handling
  } catch (err) {
    // Error already captured in error state
  }
}
```

---

## Usage Patterns

### Pattern 1: Simple Data Loading

```tsx
'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { TableLoading } from '@/components/LoadingSkeleton'

export function UsersList() {
  const { data: users, isLoading, error } = useAsyncData(
    async () => {
      const res = await fetch('/api/users')
      return res.json()
    }
  )

  return (
    <TableLoading isLoading={isLoading} rows={5} columns={4} error={error}>
      {users && (
        <table>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TableLoading>
  )
}
```

### Pattern 2: Paginated Data

```tsx
'use client'

import { usePaginatedData } from '@/hooks/useAsyncData'
import { TableLoading } from '@/components/LoadingSkeleton'

export function ProductsPage() {
  const {
    data: products,
    isLoading,
    page,
    pageCount,
    nextPage,
    previousPage
  } = usePaginatedData(
    async (page, pageSize) => {
      const res = await fetch(`/api/products?page=${page}&size=${pageSize}`)
      return res.json()
    },
    { pageSize: 20 }
  )

  return (
    <>
      <TableLoading isLoading={isLoading} rows={20} columns={5}>
        {/* Table content */}
      </TableLoading>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={previousPage} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1} of {pageCount}</span>
        <button onClick={nextPage} disabled={page === pageCount - 1}>
          Next
        </button>
      </div>
    </>
  )
}
```

### Pattern 3: Form Submission

```tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@/hooks/useAsyncData'
import { InlineLoader } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/EmptyState'

export function UserForm() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const { mutate, isLoading, error, reset } = useMutation(
    async (data) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create user')
      return res.json()
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutate(formData)
      setFormData({ name: '', email: '' })
      alert('User created!')
    } catch (err) {
      // Error handled in error state
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorState title="Error" description={error.message} action={{ label: 'Retry', onClick: () => reset() }} />}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isLoading}
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        <InlineLoader loading={isLoading} size="small" />
        Create User
      </button>
    </form>
  )
}
```

### Pattern 4: Card Grid Loading

```tsx
'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { CardLoading } from '@/components/LoadingSkeleton'

export function ProductGrid() {
  const { data: products, isLoading, error } = useAsyncData(
    async () => {
      const res = await fetch('/api/products')
      return res.json()
    }
  )

  return (
    <CardLoading isLoading={isLoading} count={6} error={error}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products?.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <button>${product.price}</button>
          </div>
        ))}
      </div>
    </CardLoading>
  )
}
```

### Pattern 5: Conditional Loading with Suspense

```tsx
'use client'

import { Suspense } from 'react'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function DashboardContent() {
  // Component that uses useAsyncData internally
  return (
    <div>
      <section>
        <h2>Users</h2>
        <UsersList />
      </section>

      <section>
        <h2>Products</h2>
        <ProductGrid />
      </section>
    </div>
  )
}

export function Dashboard() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingIndicator show variant="spinner" />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

---

## Best Practices

### 1. Always Show a Loading State

**❌ Bad**: User sees blank page
```tsx
const { data } = useAsyncData(fetchUsers)
if (!data) return <div>Loading...</div>
return <table>{/* ... */}</table>
```

**✅ Good**: User sees skeleton placeholder
```tsx
const { data, isLoading } = useAsyncData(fetchUsers)
return (
  <TableLoading isLoading={isLoading}>
    {data && <table>{/* ... */}</table>}
  </TableLoading>
)
```

### 2. Handle Errors Gracefully

**❌ Bad**: Generic error
```tsx
const { data, error } = useAsyncData(fetchUsers)
if (error) return <div>Error!</div>
```

**✅ Good**: Informative error with retry
```tsx
const { data, error, retry } = useAsyncData(fetchUsers)
return (
  <ErrorState
    title="Failed to load users"
    description={error?.message}
    action={{ label: 'Try again', onClick: retry }}
  />
)
```

### 3. Match Skeleton to Content

**❌ Bad**: Wrong skeleton type
```tsx
<ListSkeleton rows={5} />  {/* For a table! */}
{/* Table content */}
```

**✅ Good**: Appropriate skeleton
```tsx
<TableLoading rows={5} columns={4}>
  {/* Table content */}
</TableLoading>
```

### 4. Set Appropriate Loading Delays

**❌ Bad**: Instant flash of skeleton
```tsx
const { data, isLoading } = useAsyncData(fetchFast)
<TableLoading isLoading={isLoading} />
```

**✅ Good**: Hide skeleton for quick loads
```tsx
const [showSkeleton, setShowSkeleton] = useState(false)
useEffect(() => {
  const timer = setTimeout(() => setShowSkeleton(true), 200)
  if (!isLoading) clearTimeout(timer)
}, [isLoading])

<TableLoading isLoading={isLoading && showSkeleton} />
```

### 5. Respect Accessibility Preferences

All animations automatically respect:
- `prefers-reduced-motion` - Disables animations for motion-sensitive users
- `prefers-contrast` - Increases color contrast
- `prefers-transparency` - Reduces blend modes

No manual configuration needed! System handles it automatically.

---

## Testing

### Testing with Loading States

```typescript
// e2e/loading-states.spec.ts
import { test, expect } from '@playwright/test'

test('should show table skeleton while loading', async ({ page }) => {
  await page.goto('/users')

  // Skeleton should be visible
  const skeleton = page.locator('.table-skeleton')
  await expect(skeleton).toBeVisible()

  // Wait for actual content
  const table = page.locator('table')
  await expect(table).toBeVisible()

  // Skeleton should disappear
  await expect(skeleton).not.toBeVisible()
})

test('should show error state on failure', async ({ page }) => {
  await page.route('**/api/users', route => route.abort())
  await page.goto('/users')

  await expect(page.locator('.loading-skeleton-error')).toBeVisible()
})
```

---

## Accessibility

### ARIA Attributes

All loading states include proper ARIA labels:

```html
<!-- Spinner during loading -->
<div
  class="loading-spinner"
  role="status"
  aria-busy="true"
  aria-label="Loading users"
/>

<!-- Progress bar -->
<div
  role="progressbar"
  aria-valuenow="45"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Loading progress"
/>

<!-- Error state -->
<div
  role="alert"
  aria-live="polite"
>
  Error loading content
</div>
```

### Keyboard Navigation

- Tab through all controls
- Enter/Space to interact
- Escape to cancel operations
- Screen readers announce all state changes

---

## Performance Considerations

### 1. Skeleton Performance

Skeletons are lightweight (< 1KB each):
- Use CSS animations (hardware-accelerated)
- No JavaScript event listeners
- Automatically cleaned up

### 2. Hook Performance

Async hooks are optimized:
- Request deduplication via `AbortController`
- Automatic cleanup on unmount
- No memory leaks
- Efficient dependency tracking

### 3. Bundle Impact

Total bundle size:
- `LoadingSkeleton.tsx`: ~4KB
- `useAsyncData.ts`: ~6KB
- CSS animations: ~1KB
- **Total**: ~11KB added

---

## Migration from Old Patterns

### Old Pattern (avoid)

```tsx
import { AsyncLoading } from '@/components'

<AsyncLoading isLoading={loading} error={error}>
  {content}
</AsyncLoading>
```

### New Pattern (use)

```tsx
import { LoadingSkeleton } from '@/components'

<LoadingSkeleton isLoading={loading} error={error} variant="table">
  {content}
</LoadingSkeleton>
```

Benefits:
- Clearer intent with variant names
- Better TypeScript support
- More customization options
- Improved animations

---

## Troubleshooting

### Problem: Animation not showing

**Solution**: Check `prefers-reduced-motion` preference
```tsx
// Check browser console:
// If window.matchMedia('(prefers-reduced-motion: reduce)').matches === true
// animations are disabled
```

### Problem: Skeleton flickering

**Solution**: Add delay before showing skeleton
```tsx
const [showSkeleton, setShowSkeleton] = useState(false)
useEffect(() => {
  const timer = setTimeout(() => setShowSkeleton(true), 300)
  return () => clearTimeout(timer)
}, [])
```

### Problem: Memory leak warning

**Solution**: Ensure component unmounts cleanly
```tsx
// useAsyncData already handles cleanup:
// - AbortController cancels requests
// - Timers cleared on unmount
// - Event listeners removed
```

---

## References

- Material Design Loading States: https://m3.material.io/
- Web Accessibility (WCAG): https://www.w3.org/WAI/WCAG21/quickref/
- React Hooks Best Practices: https://react.dev/reference/react/hooks
- Next.js Loading UI: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming

---

## Summary

| Component | Best For | Size | Performance |
|-----------|----------|------|-------------|
| Skeleton | Simple blocks | < 1KB | Excellent |
| TableSkeleton | Tables | < 2KB | Excellent |
| CardSkeleton | Card grids | < 2KB | Excellent |
| ListSkeleton | Lists/items | < 2KB | Excellent |
| LoadingSkeleton | Unified wrapper | < 4KB | Excellent |
| useAsyncData | Data fetching | < 6KB | Excellent |
| usePaginatedData | Pagination | included | Excellent |
| useMutation | Form submission | included | Excellent |

**Total impact**: ~11KB added to bundle for complete loading states system.

---

**Phase Status**: ✅ Phase 5.1 Complete

All loading states are implemented, documented, tested, and ready for production use.
