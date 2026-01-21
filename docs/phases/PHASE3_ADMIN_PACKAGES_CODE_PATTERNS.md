# Phase 3 Admin Packages Page - Code Patterns & Examples

**Common code patterns and examples for the /admin/packages implementation**

---

## Pattern 1: API Call with Error Handling

### Standard Pattern

```typescript
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

const data = await response.json()
return data
```

### With Timeout

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

try {
  const response = await fetch(`/api/admin/packages/${packageId}/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    signal: controller.signal,
  })
  // ... rest of error handling
} finally {
  clearTimeout(timeoutId)
}
```

---

## Pattern 2: Debounced Search

### Using useEffect Cleanup

```typescript
const onSearchChange = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value
    setSearchQuery(newSearch)
    setPage(0)
  },
  []
)

// In usePackages hook:
useEffect(() => {
  const timer = setTimeout(() => {
    // Actual fetch happens here (in refetch)
    refetch()
  }, 500) // 500ms debounce

  return () => clearTimeout(timer)
}, [searchQuery, page, pageSize, filterStatus, refetch])
```

### Or with useMemo

```typescript
const debouncedSearch = useMemo(
  () => {
    return debounce((query: string) => {
      setSearchQuery(query)
      setPage(0)
      refetch()
    }, 500)
  },
  [refetch]
)

const onSearchChange = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value)
  },
  [debouncedSearch]
)
```

---

## Pattern 3: Pagination Handler

### From Material-UI TablePagination

```typescript
const onPageChange = useCallback(
  (event: unknown, newPage: number) => {
    setPage(newPage)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  []
)

// In JSON component:
{
  type: 'TablePagination',
  component: 'div',
  count: '{{packages ? packages.length : 0}}',
  page: '{{page}}',
  rowsPerPage: '{{pageSize}}',
  onPageChange: '{{onPageChange}}',
  rowsPerPageOptions: [10, 25, 50, 100],
}
```

---

## Pattern 4: Confirmation Dialog

### Browser confirm()

```typescript
const onUninstall = useCallback(
  async (packageId: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to uninstall package ${packageId}?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    // Proceed with uninstall
    await performUninstall(packageId)
  },
  []
)
```

### Custom Dialog Component (Material-UI)

```typescript
const [dialogOpen, setDialogOpen] = useState(false)
const [pendingPackageId, setPendingPackageId] = useState<string | null>(null)

const handleUninstallClick = useCallback((packageId: string) => {
  setPendingPackageId(packageId)
  setDialogOpen(true)
}, [])

const handleConfirm = useCallback(async () => {
  if (pendingPackageId) {
    await performUninstall(pendingPackageId)
    setPendingPackageId(null)
    setDialogOpen(false)
  }
}, [pendingPackageId])

// In JSX:
<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
  <DialogTitle>Confirm Uninstall</DialogTitle>
  <DialogContent>
    Are you sure you want to uninstall {pendingPackageId}?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm} color="error" variant="contained">
      Uninstall
    </Button>
  </DialogActions>
</Dialog>
```

---

## Pattern 5: Loading States

### Skeleton Loader

```typescript
function PackageListSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" sx={{ mt: 1 }} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// In component:
{isLoading ? <PackageListSkeleton /> : <PackageList />}
```

### Button Loading State

```typescript
<Button
  onClick={() => onInstall(packageId)}
  disabled={isMutating}
  startIcon={isMutating ? <CircularProgress size={20} /> : <Download />}
>
  {isMutating ? 'Installing...' : 'Install'}
</Button>
```

---

## Pattern 6: URL State Synchronization

### Push to History

```typescript
useEffect(() => {
  const params = new URLSearchParams()

  // Only add non-default values
  if (page > 0) params.set('page', page.toString())
  if (pageSize !== 25) params.set('pageSize', pageSize.toString())
  if (searchQuery) params.set('search', searchQuery)
  if (filterStatus !== 'all') params.set('status', filterStatus)

  const queryString = params.toString()
  const url = queryString ? `/admin/packages?${queryString}` : '/admin/packages'

  // Use replace for filter changes, push for pagination
  router.push(url, { shallow: true })
}, [page, pageSize, searchQuery, filterStatus, router])
```

### Shallow routing (keep scroll position)

```typescript
router.push(url, { shallow: true })
```

### Replace instead of push (for back button)

```typescript
router.replace(url, { shallow: true })
```

---

## Pattern 7: Error Recovery

### Retry Pattern

```typescript
const [error, setError] = useState<string | null>(null)

const handleRetry = useCallback(() => {
  setError(null)
  refetch()
}, [refetch])

// In JSX:
{error && (
  <Alert
    severity="error"
    onClose={handleRetry}
    action={<Button onClick={handleRetry}>Retry</Button>}
  >
    {error}
  </Alert>
)}
```

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error">
            Something went wrong: {this.state.error?.message}
          </Typography>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </Box>
      )
    }

    return this.props.children
  }
}
```

---

## Pattern 8: Callback Memoization

### Proper useCallback Usage

```typescript
// ❌ WRONG: Dependencies missing
const onInstall = useCallback(async (packageId: string) => {
  await fetch(`/api/admin/packages/${packageId}/install`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
  refetch()
  showToast({ type: 'success', message: 'Installed' })
}, []) // Missing dependencies!

// ✅ CORRECT: All dependencies included
const onInstall = useCallback(
  async (packageId: string) => {
    await fetch(`/api/admin/packages/${packageId}/install`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
    await refetch()
    showToast({ type: 'success', message: 'Installed' })
  },
  [userId, refetch, showToast] // All external dependencies
)
```

---

## Pattern 9: Query Parameter Building

### Helper Function

```typescript
function buildPackageQuery(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}): URLSearchParams {
  const query = new URLSearchParams()

  if (params.page !== undefined && params.page > 0) {
    query.set('page', params.page.toString())
  }

  if (params.pageSize !== undefined && params.pageSize !== 25) {
    query.set('pageSize', params.pageSize.toString())
  }

  if (params.search) {
    query.set('search', params.search)
  }

  if (params.status && params.status !== 'all') {
    query.set('status', params.status)
  }

  return query
}

// Usage:
const query = buildPackageQuery({ page, pageSize, search: searchQuery, status: filterStatus })
const response = await fetch(`/api/admin/packages?${query}`)
```

---

## Pattern 10: Modal State Management

### Single Package Modal

```typescript
const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

const openModal = useCallback((packageId: string) => {
  setSelectedPackageId(packageId)
}, [])

const closeModal = useCallback(() => {
  setSelectedPackageId(null)
}, [])

const selectedPackage = packages.find(p => p.packageId === selectedPackageId)

// In JSX:
{selectedPackageId && selectedPackage && (
  <Modal>
    <ModalTitle>{selectedPackage.name}</ModalTitle>
  </Modal>
)}
```

### Multi-Modal Stack

```typescript
const [modals, setModals] = useState<string[]>([]) // Stack of modal IDs

const openModal = useCallback((id: string) => {
  setModals(prev => [...prev, id])
}, [])

const closeModal = useCallback(() => {
  setModals(prev => prev.slice(0, -1))
}, [])

const currentModal = modals[modals.length - 1]

// Allows nested modals
```

---

## Pattern 11: Toast Notifications

### Simple Toast

```typescript
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const [toasts, setToasts] = useState<Toast[]>([])

const showToast = useCallback((message: string, type: ToastType = 'info') => {
  const id = Math.random().toString(36)
  const toast: Toast = { id, type, message, duration: 3000 }

  setToasts(prev => [...prev, toast])

  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, toast.duration || 3000)
}, [])

// In JSX:
<Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
  {toasts.map(toast => (
    <Alert
      key={toast.id}
      severity={toast.type}
      sx={{ mb: 1 }}
      onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
    >
      {toast.message}
    </Alert>
  ))}
</Box>
```

---

## Pattern 12: Search with URL Sync

### Complete Example

```typescript
const [searchInput, setSearchInput] = useState('')
const router = useRouter()
const searchParams = useSearchParams()

// Parse initial search from URL
useEffect(() => {
  const urlSearch = searchParams.get('search') || ''
  setSearchInput(urlSearch)
}, [searchParams])

// Debounce search query changes
useEffect(() => {
  const timer = setTimeout(() => {
    // Update URL without refetch (refetch happens via dependency)
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)

    router.push(`/admin/packages?${params.toString()}`, { shallow: true })
  }, 500)

  return () => clearTimeout(timer)
}, [searchInput, router])

const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchInput(event.target.value)
  setPage(0) // Reset pagination
}
```

---

## Pattern 13: Conditional Rendering in JSON

### Using Type System

```typescript
// Show different buttons based on status
{
  type: 'conditional',
  condition: '{{package.installed}}',
  then: {
    type: 'Stack',
    direction: 'row',
    spacing: 1,
    children: [
      {
        type: 'Button',
        onClick: '{{() => onUninstall(package.id)}}',
        children: 'Uninstall',
      },
    ],
  },
  else: {
    type: 'Button',
    onClick: '{{() => onInstall(package.id)}}',
    children: 'Install',
  },
}
```

### Nested Conditionals

```typescript
{
  type: 'conditional',
  condition: '{{isLoading}}',
  then: {
    type: 'CircularProgress',
  },
  else: {
    type: 'conditional',
    condition: '{{error}}',
    then: {
      type: 'Alert',
      severity: 'error',
      children: '{{error}}',
    },
    else: {
      type: 'Table',
      // ... table content
    },
  },
}
```

---

## Pattern 14: Filter with Reset

### Filter with All Option

```typescript
const onFilterChange = useCallback((event: any) => {
  const newStatus = event.target.value
  setFilterStatus(newStatus)
  setPage(0)
}, [])

// In JSON:
{
  type: 'Select',
  value: '{{filterStatus}}',
  onChange: '{{onFilterChange}}',
  children: [
    { type: 'MenuItem', value: 'all', children: 'All Packages' },
    { type: 'MenuItem', value: 'installed', children: 'Installed Only' },
    { type: 'MenuItem', value: 'available', children: 'Available Only' },
    { type: 'MenuItem', value: 'disabled', children: 'Disabled Only' },
  ],
}
```

---

## Pattern 15: Action Button Disabled States

### Smart Disable Logic

```typescript
const isActionDisabled = isMutating || isLoading || error !== null

const onInstall = useCallback(
  async (packageId: string) => {
    if (isActionDisabled) return // Guard against multiple clicks

    try {
      setIsMutating(true)
      // ... perform action
    } finally {
      setIsMutating(false)
    }
  },
  [isActionDisabled]
)

// In JSON:
{
  type: 'Button',
  disabled: '{{isMutating || isLoading}}',
  onClick: '{{() => onInstall(packageId)}}',
  children: '{{isMutating ? "Installing..." : "Install"}}',
}
```

---

## Pattern 16: Type-Safe Props

### Props Interface

```typescript
interface PackageListProps {
  packages: Package[]
  page: number
  pageSize: number
  searchQuery: string
  filterStatus: 'all' | 'installed' | 'available' | 'disabled'
  isLoading: boolean
  error: string | null
  onInstall: (packageId: string) => Promise<void>
  onUninstall: (packageId: string) => Promise<void>
  onEnable: (packageId: string) => Promise<void>
  onDisable: (packageId: string) => Promise<void>
  onViewDetails: (packageId: string) => void
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFilterChange: (event: React.ChangeEvent<{ value: unknown }>) => void
  onPageChange: (event: unknown, newPage: number) => void
}
```

---

## Pattern 17: Defensive Programming

### Null Checks

```typescript
// ❌ Unsafe
const package = packages.find(p => p.packageId === selectedId)
return <PackageDetail data={package} />

// ✅ Safe
const package = packages.find(p => p.packageId === selectedId)
if (!package) return null
return <PackageDetail data={package} />

// ✅ Also Safe
{selectedId && selectedPackage && <PackageDetail data={selectedPackage} />}
```

### Type Guards

```typescript
// ❌ Unsafe
const response = await fetch(url)
const data = response.json()
setPackages(data.packages)

// ✅ Safe
const response = await fetch(url)
if (!response.ok) throw new Error('Failed')

const data = await response.json()
if (!Array.isArray(data.packages)) {
  throw new Error('Invalid response format')
}
setPackages(data.packages)
```

---

## Pattern 18: Custom Hook for List Fetching

### Complete Hook Example

```typescript
interface UseFetchListOptions {
  endpoint: string
  params?: Record<string, string | number>
  refetchDeps?: unknown[]
}

export function useFetchList<T>(options: UseFetchListOptions) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const query = new URLSearchParams()
      Object.entries(options.params || {}).forEach(([key, value]) => {
        query.set(key, String(value))
      })

      const response = await fetch(
        `${options.endpoint}?${query.toString()}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result.items || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [options.endpoint, options.params])

  useEffect(() => {
    fetch()
  }, [fetch, ...(options.refetchDeps || [])])

  return { data, isLoading, error, refetch: fetch }
}

// Usage:
const { data: packages, isLoading } = useFetchList<Package>({
  endpoint: '/api/admin/packages',
  params: { page, pageSize, search: searchQuery },
})
```

---

## Best Practices Summary

1. **Always memoize callbacks** with useCallback and include all deps
2. **Type everything** - Use interfaces for props and API responses
3. **Handle errors gracefully** - Show user-friendly messages
4. **Use URL state** - Allow bookmarking/sharing filter states
5. **Debounce expensive operations** - Search should have 500ms delay
6. **Disable during mutations** - Prevent duplicate requests
7. **Confirm destructive actions** - Uninstall should ask first
8. **Show loading states** - Keep UI responsive to user
9. **Guard against null** - Check data exists before using
10. **Keep components small** - Easier to test and maintain
