# Package State Management: Quick Start Guide

Complete quick reference for implementing package management UI.

## 5-Minute Setup

### 1. Import Hooks

```typescript
import { usePackages } from '@/hooks/usePackages'
import { usePackageActions } from '@/hooks/usePackageActions'
import { usePackageDetails } from '@/hooks/usePackageDetails'
```

### 2. Create State

```typescript
function PackageManagementPage() {
  const packagesHook = usePackages()
  const actionsHook = usePackageActions()
  const detailsHook = usePackageDetails()

  return <PackageUI {...packagesHook} {...actionsHook} {...detailsHook} />
}
```

### 3. Use State in UI

```typescript
// List packages
{packagesHook.state.packages.map(pkg => (
  <PackageItem key={pkg.id} package={pkg} />
))}

// Show loading
{packagesHook.state.isLoading && <Spinner />}

// Show error
{packagesHook.state.error && <Error error={packagesHook.state.error} />}

// Pagination
<Pagination
  page={packagesHook.pagination.page}
  total={packagesHook.pagination.pageCount}
  onChange={packagesHook.handlers.changePage}
/>
```

---

## Common Patterns

### Search (Debounced)

```typescript
<input
  onChange={(e) => packagesHook.handlers.searchPackages(e.target.value)}
  placeholder="Search packages..."
/>
```

### Filter by Status

```typescript
<select
  onChange={(e) => packagesHook.handlers.filterByStatus(e.target.value)}
>
  <option value="all">All</option>
  <option value="installed">Installed</option>
  <option value="available">Available</option>
  <option value="disabled">Disabled</option>
</select>
```

### Install with Confirmation

```typescript
const handleInstall = async (packageId: string) => {
  if (!confirm('Install this package?')) return

  try {
    await actionsHook.handlers.installPackage(packageId)
    showToast('Installation complete!')
    packagesHook.handlers.refetchPackages()
  } catch (error) {
    showToast(`Installation failed: ${error.message}`)
  }
}
```

### Disable Button During Operation

```typescript
<button
  disabled={actionsHook.isOperationInProgress(packageId)}
  onClick={() => actionsHook.handlers.installPackage(packageId)}
>
  {actionsHook.isOperationInProgress(packageId) ? 'Installing...' : 'Install'}
</button>
```

### Show Details Modal

```typescript
const handleShowDetails = async (packageId: string) => {
  try {
    await detailsHook.handlers.openDetails(packageId)
  } catch (error) {
    showToast(`Failed to load details: ${error.message}`)
  }
}

// Render modal
{detailsHook.state.isOpen && (
  <Modal onClose={detailsHook.handlers.closeDetails}>
    {detailsHook.state.selectedPackage && (
      <PackageDetails package={detailsHook.state.selectedPackage} />
    )}
  </Modal>
)}
```

---

## Type Reference

### PackageInfo

```typescript
{
  id: 'pkg_id',
  name: 'Package Name',
  version: '1.0.0',
  description: 'Package description',
  author: 'Author Name',
  category: 'productivity',
  icon: 'https://...',
  screenshots: ['https://...'],
  tags: ['tag1', 'tag2'],
  dependencies: ['dep1', 'dep2'],
  createdAt: 1234567890,
  updatedAt: 1234567890,
  downloadCount: 1000,
  rating: 4.5,
  status: 'installed' | 'available' | 'disabled',
  enabled: true,
  installedAt: 1234567890  // optional
}
```

### PackageListState

```typescript
{
  packages: PackageInfo[],
  total: number,
  page: number,
  limit: number,
  search: string,
  statusFilter: 'all' | 'installed' | 'available' | 'disabled',
  isLoading: boolean,
  isRefetching: boolean,
  error: PackageError | null
}
```

### PackageError

```typescript
{
  name: 'PackageError',
  message: 'Error message',
  code: 'ALREADY_INSTALLED' | 'PACKAGE_NOT_FOUND' | ...,
  statusCode: 409,
  details: { ... }
}
```

---

## Error Handling

### Get Error Message

```typescript
import { getErrorMessage } from '@/lib/admin/package-utils'

{state.error && <div>{getErrorMessage(state.error)}</div>}
```

### Check if Retryable

```typescript
import { isRetryableError } from '@/lib/admin/package-utils'

{isRetryableError(error) && (
  <button onClick={retry}>Retry</button>
)}
```

### Map Error Codes

```typescript
if (error.code === 'ALREADY_INSTALLED') {
  // Package already installed
}
if (error.code === 'MISSING_DEPENDENCIES') {
  // Show dependency list
  console.log(error.details.missingDependencies)
}
if (error.code === 'PERMISSION_DENIED') {
  // Show permission error
}
```

---

## Helper Functions

### Format Display Text

```typescript
import {
  formatPackageStatus,      // 'installed' → 'Installed'
  formatPackageCategory,    // 'ecommerce' → 'Ecommerce'
  formatVersion,            // '1.0.0' → '1.0.0'
  formatDate,               // 1234567890 → 'Jan 1, 2024'
  formatDateTime,           // With time
  formatNumber,             // 1000 → '1K'
  formatRating,             // 4.5 → '4.5'
} from '@/lib/admin/package-utils'
```

### Check Available Actions

```typescript
import {
  canInstallPackage,
  canUninstallPackage,
  canEnablePackage,
  canDisablePackage,
  getAvailableActions,
} from '@/lib/admin/package-utils'

// Check single action
if (canInstallPackage(pkg)) {
  // Show install button
}

// Get all available actions
const actions = getAvailableActions(pkg)
// ['install'] | ['enable', 'disable', 'uninstall'] | etc.
```

### Check Dependencies

```typescript
import {
  areDependenciesMet,
  getMissingDependencies,
} from '@/lib/admin/package-utils'

if (!areDependenciesMet(pkg.dependencies, installedIds)) {
  const missing = getMissingDependencies(pkg.dependencies, installedIds)
  console.log('Install these first:', missing)
}
```

---

## Full Example: Search + Filter + List

```typescript
function PackageListPage() {
  const packagesHook = usePackages()

  return (
    <div>
      {/* Search */}
      <input
        value={packagesHook.state.search}
        onChange={(e) => packagesHook.handlers.searchPackages(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 border rounded"
      />

      {/* Filter */}
      <select
        value={packagesHook.state.statusFilter}
        onChange={(e) => packagesHook.handlers.filterByStatus(e.target.value)}
        className="mt-2 px-4 py-2 border rounded"
      >
        <option value="all">All</option>
        <option value="installed">Installed</option>
        <option value="available">Available</option>
        <option value="disabled">Disabled</option>
      </select>

      {/* Loading */}
      {packagesHook.state.isLoading && (
        <div className="mt-4 text-center">Loading...</div>
      )}

      {/* Error */}
      {packagesHook.state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          {getErrorMessage(packagesHook.state.error)}
        </div>
      )}

      {/* List */}
      {!packagesHook.state.isLoading && (
        <div className="mt-4 space-y-2">
          {packagesHook.state.packages.map((pkg) => (
            <div key={pkg.id} className="p-4 border rounded">
              <h3 className="font-bold">{pkg.name}</h3>
              <p className="text-gray-600 text-sm">{pkg.description}</p>
              <p className="text-sm mt-1">
                Status: {formatPackageStatus(pkg.status)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={packagesHook.pagination.page === 0}
          onClick={() =>
            packagesHook.handlers.changePage(packagesHook.pagination.page - 1)
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
            packagesHook.handlers.changePage(packagesHook.pagination.page + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

---

## Full Example: Install with Modal

```typescript
function PackageRow({ pkg }: Props) {
  const detailsHook = usePackageDetails()
  const actionsHook = usePackageActions()

  const handleInstall = async () => {
    if (!confirm(`Install ${pkg.name}?`)) return

    try {
      await actionsHook.handlers.installPackage(pkg.id)
      alert('Installation complete!')
    } catch (error) {
      alert(`Installation failed: ${(error as Error).message}`)
    }
  }

  return (
    <>
      <div className="p-4 border rounded flex justify-between">
        <div>
          <h3>{pkg.name}</h3>
          <p className="text-gray-600">{pkg.description}</p>
        </div>

        <div className="space-x-2">
          <button onClick={() => detailsHook.handlers.openDetails(pkg.id)}>
            Details
          </button>

          <button
            disabled={actionsHook.isOperationInProgress(pkg.id)}
            onClick={handleInstall}
          >
            {actionsHook.isOperationInProgress(pkg.id)
              ? 'Installing...'
              : 'Install'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {detailsHook.state.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {detailsHook.state.selectedPackage?.name}
              </h2>
              <button onClick={detailsHook.handlers.closeDetails}>×</button>
            </div>

            {detailsHook.state.isLoading && <div>Loading...</div>}

            {detailsHook.state.error && (
              <div className="text-red-600">
                {getErrorMessage(detailsHook.state.error)}
              </div>
            )}

            {detailsHook.state.selectedPackage && (
              <p>{detailsHook.state.selectedPackage.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

---

## Debugging

### Log Hook State

```typescript
console.log('Packages state:', packagesHook.state)
console.log('Actions state:', actionsHook.state)
console.log('Details state:', detailsHook.state)
```

### Check Operation Progress

```typescript
console.log('In progress:', actionsHook.isOperationInProgress('pkg_id'))
console.log('All in progress:', actionsHook.state.operationInProgress)
```

### Monitor Errors

```typescript
packagesHook.state.error?.code        // Error code
packagesHook.state.error?.statusCode  // HTTP status
packagesHook.state.error?.details     // Error details
```

### Test Manually

```typescript
// In browser console
const { state, handlers } = packagesHook
handlers.searchPackages('react')
handlers.filterByStatus('installed')
handlers.changePage(1)
handlers.refetchPackages()
```

---

## Common Issues & Solutions

### Search Not Working

```typescript
// Make sure you're using the handler, not setting state directly
✓ packagesHook.handlers.searchPackages('term')
✗ setState({ search: 'term' })
```

### Operation Not Completing

```typescript
// Check error in hook state
if (actionsHook.state.error) {
  console.log(actionsHook.state.error.message)
}

// Check operation is actually in progress
console.log(actionsHook.isOperationInProgress('pkg_id'))
```

### Modal Not Updating After Action

```typescript
// Manually refresh modal data after operations
await actionsHook.handlers.installPackage(pkg.id)
await detailsHook.handlers.refreshDetails()  // Refresh modal
```

### List Not Updating After Action

```typescript
// Always refetch after operations
await actionsHook.handlers.installPackage(pkg.id)
await packagesHook.handlers.refetchPackages()  // Refetch list
```

---

## Performance Tips

### Prevent Re-renders

```typescript
// Move hooks to custom component to prevent parent re-renders
const PackageSearchInput = () => {
  const { handlers, state } = usePackages()
  return (
    <input
      value={state.search}
      onChange={(e) => handlers.searchPackages(e.target.value)}
    />
  )
}
```

### Debounce Search

```typescript
// Already built-in (default 300ms)
// Customize if needed:
const { handlers } = usePackages({ debounceMs: 500 })
```

### Batch Refetches

```typescript
// Instead of:
await packagesHook.handlers.refetchPackages()
await detailsHook.handlers.refreshDetails()

// Use Promise.all:
await Promise.all([
  packagesHook.handlers.refetchPackages(),
  detailsHook.handlers.refreshDetails(),
])
```

---

## API Requirements

Your API endpoints must return these responses:

### GET /api/admin/packages

```json
{
  "items": [
    {
      "id": "pkg_id",
      "name": "Package Name",
      "version": "1.0.0",
      "description": "...",
      "author": "...",
      "category": "...",
      "icon": "...",
      "screenshots": [...],
      "tags": [...],
      "dependencies": [...],
      "createdAt": 0,
      "updatedAt": 0,
      "downloadCount": 0,
      "rating": 0,
      "status": "installed",
      "enabled": true,
      "installedAt": 0
    }
  ],
  "total": 100,
  "page": 0,
  "limit": 10
}
```

### POST /api/admin/packages/:id/install

Return same PackageInfo with updated status.

### POST /api/admin/packages/:id/uninstall

Return void (204 No Content) or empty object.

### Error Response

```json
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Next Steps

1. Review the full `PACKAGE_STATE_IMPLEMENTATION.md` guide
2. Create UI components using these hooks
3. Implement API endpoints
4. Add confirmation dialogs
5. Add toast notifications
6. Test thoroughly
7. Deploy to production

For detailed documentation, see `PACKAGE_STATE_IMPLEMENTATION.md`.
