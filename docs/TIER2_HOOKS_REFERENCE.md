# Tier 2 Hooks Quick Reference

**Last Updated:** January 23, 2026
**Analysis Status:** COMPLETE

---

## Hooks Inventory

### Tier 2 Hooks by Frontend

#### workflowui (4 hooks - Redux + Service + IndexedDB)
| Hook | File | Redux Slice | Service | Caching |
|------|------|------------|---------|---------|
| useProject | `hooks/useProject.ts` | projectSlice | projectService | IndexedDB |
| useWorkspace | `hooks/useWorkspace.ts` | workspaceSlice | workspaceService | IndexedDB |
| useWorkflow | `hooks/useWorkflow.ts` | workflowSlice | workflowService | Redux state |
| useExecution | `hooks/useExecution.ts` | workflowSlice | executionService | Redux state |

#### frontends/nextjs (7 hooks - Direct API + useState)
| Hook | File | Service | Caching | Features |
|------|------|---------|---------|----------|
| useUsers | `hooks/useUsers.ts` | Direct fetch | None | Pagination, search, filter |
| useUserForm | `hooks/useUserForm.ts` | Direct fetch | None | Form state, validation |
| useUserActions | `hooks/useUserActions.ts` | Direct fetch | None | CRUD operations |
| usePackages | `hooks/usePackages.ts` | Direct fetch | None | Pagination, search, status filter |
| usePackageDetails | `hooks/usePackageDetails.ts` | Direct fetch | None | Single entity + relations |
| usePackageActions | `hooks/usePackageActions.ts` | Direct fetch | None | CRUD operations |
| useWorkflow | `hooks/useWorkflow.ts` | Direct fetch | None | Execute, retry, polling |

#### Generic Adapters (3 - frontends/nextjs)
| Hook | File | Purpose |
|------|------|---------|
| useRestApi | `lib/hooks/use-rest-api.ts` | Generic CRUD builder |
| useEntity | `lib/hooks/use-rest-api.ts` | Entity-specific wrapper |
| useDependencyEntity | `lib/hooks/use-rest-api.ts` | Cross-package access |

---

## Common Patterns (5)

### Pattern 1: Basic CRUD + Selection
```typescript
// State: items[], current, isLoading, error
// Actions: list(), create(), update(), delete(), setCurrent()
// Examples: useProject, useWorkspace
```

### Pattern 2: List + Pagination + Search + Filter
```typescript
// State: items[], pagination{page,limit,total}, search, filters, isLoading
// Actions: fetch(), search(), filterBy(), changePage(), changeLimit(), refetch()
// Features: Debounced search (300ms), AbortController cancellation
// Examples: useUsers, usePackages
```

### Pattern 3: Async Action + History + Stats
```typescript
// State: currentItem, history[], status, metrics, isLoading
// Actions: execute(), stop(), getHistory(), getStats()
// Features: Auto-retry (3 attempts), progress tracking, polling
// Examples: useExecution, useWorkflow(frontends/nextjs)
```

### Pattern 4: Form Management + Actions
```typescript
// State: formData, errors, isDirty, isSubmitting
// Actions: updateField(), validate(), submit(), delete(), reset()
// Features: Debounced validation, error normalization
// Examples: useUserForm, usePackageActions
```

### Pattern 5: Single Entity + Related Collections
```typescript
// State: main, relations{}, isLoading, error
// Actions: load(), refetch(), updateRelated()
// Features: Lazy loading, optional relations
// Examples: usePackageDetails, useProjectCanvas
```

---

## Unified Hook Signature (Phase 5 Target)

```typescript
// Generic hook
useEntity<T>(entityType: string, options?: {
  adapter: 'redux' | 'api' | 'dbal'
  tenant?: string
  cache?: boolean | { type: 'indexeddb' | 'memory' | 'none', ttl?: number }
}): UseEntityReturn<T>

// Return type (all frontends)
interface UseEntityReturn<T> {
  items: T[]
  currentItem: T | null
  isLoading: boolean
  error: string | null
  pagination?: { page: number, limit: number, total: number, totalPages: number }

  list(options?: { page?, limit?, search?, filter? }): Promise<T[]>
  get(id: string): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  setCurrent(id: string | null): void
  refetch(): Promise<void>
  search?(term: string): Promise<void>
  filter?(criteria: Record<string, any>): Promise<void>
}

// Entity-specific hooks
useProjects(options?): UseEntityReturn<Project>
useWorkspaces(options?): UseEntityReturn<Workspace>
useWorkflows(options?): UseEntityReturn<Workflow>
useExecutions(options?): UseEntityReturn<ExecutionResult>
useUsers(options?): UseEntityReturn<User>
usePackages(options?): UseEntityReturn<Package>
```

---

## Key Implementation Details

### Pagination Normalization
```
Current fragmentation:
  workflowui: limit, offset
  frontends/nextjs: page (0-indexed), limit
  useRestApi: skip, take

Unified approach:
  External API: page (1-indexed), limit
  Internal API: skip = (page - 1) * limit, take = limit
```

### Search & Filter Pattern
```typescript
// All hooks should support:
const { search, filter } = useEntity('user')

// Debounced search (300ms)
await search('john')

// Structured filtering
await filter({ role: 'admin', status: 'active' })

// Combined with pagination
await list({ page: 1, limit: 10, search: 'john', filter: {...} })
```

### Error Handling
```typescript
// Retry strategy
- Exponential backoff: 2^attempt * 1000ms
- Max retries: 3
- Non-retryable: 4xx status codes

// Error structure
interface EntityError {
  message: string
  code: string
  statusCode?: number
  details?: Record<string, any>
}
```

### Caching
```typescript
// IndexedDB (workflowui)
- Persist between sessions
- TTL: 24 hours (configurable)
- Manual invalidation: invalidateCache()

// Memory (frontends/nextjs optional)
- Session-only cache
- TTL: 5 minutes (configurable)
- Cleared on page reload

// HTTP (all)
- ETag-based
- Cache-Control headers
- Conditional requests
```

### Tenancy
```typescript
// Automatic tenant resolution
const getTenantId = () => localStorage.getItem('tenantId') || 'default'

// Should centralize in context:
const { tenant, package } = useTenantContext()

// Multi-package support
const { list: listRoles } = useDependencyEntity('user_manager', 'roles')
```

---

## Service Architecture

### Base Service Pattern
```typescript
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    params?: Record<string, any>
    retries?: number
  }
): Promise<T>

// Built with:
// - Retry logic (exponential backoff)
// - Query parameter building
// - Error normalization
// - JSON serialization
```

### Services Found
| Service | Entities |
|---------|----------|
| projectService | projects, canvas items |
| workspaceService | workspaces |
| workflowService | workflows, validation, metrics |
| executionService | executions, history, stats |

---

## Redux Integration (workflowui)

### Slice Structure
```typescript
interface EntityState {
  items: Entity[]
  currentId: string | null
  isLoading: boolean
  error: string | null
}

// Actions provided by each slice
- setLoading(bool)
- setError(string | null)
- setItems(Entity[])
- addItem(Entity)
- updateItem(Entity)
- removeItem(id)
- setCurrent(id)

// Selectors
- selectItems(state)
- selectCurrent(state)
- selectCurrentId(state)
- selectIsLoading(state)
- selectError(state)
```

### Hook Integration Pattern
```typescript
const dispatch = useDispatch()
const items = useSelector(selectItems)
const isLoading = useSelector(selectIsLoading)

const list = useCallback(async () => {
  dispatch(setLoading(true))
  try {
    const data = await service.list()
    dispatch(setItems(data))
  } finally {
    dispatch(setLoading(false))
  }
}, [dispatch])
```

---

## API Endpoints Structure

### Standard REST Paths
```
GET    /api/v1/{tenant}/{package}/{entity}
       - List with pagination: ?skip=0&take=20
       - With search: ?search=term
       - With filter: ?status=active

GET    /api/v1/{tenant}/{package}/{entity}/{id}
       - Get single entity

POST   /api/v1/{tenant}/{package}/{entity}
       - Create (body: entity data)

PUT    /api/v1/{tenant}/{package}/{entity}/{id}
       - Update (body: partial entity)

DELETE /api/v1/{tenant}/{package}/{entity}/{id}
       - Delete

POST   /api/v1/{tenant}/{package}/{entity}/{id}/{action}
       - Custom action (body: action parameters)
```

---

## Features Comparison Matrix

| Feature | workflowui | frontends/nextjs | codegen | Phase 5 |
|---------|-----------|-----------------|---------|---------|
| CRUD | ✅ | ✅ | ⚠️ | ✅ |
| Redux | ✅ | ❌ | ⚠️ | ✅ |
| Pagination | ⚠️ | ✅ | ❌ | ✅ |
| Search | ❌ | ✅ | ❌ | ✅ |
| Filter | ❌ | ✅ | ❌ | ✅ |
| Retry | ✅ | ❌ | ❌ | ✅ |
| Cache | ✅ | ❌ | ❌ | ✅ |
| Refetch | ❌ | ✅ | ❌ | ✅ |
| Current selection | ✅ | ❌ | ❌ | ✅ |
| Type safety | ✅ | ✅ | ⚠️ | ✅ |
| Error handling | ✅ | ⚠️ | ❌ | ✅ |

Legend: ✅ Full support | ⚠️ Partial/inconsistent | ❌ Not supported

---

## Phase 5 Deliverables

### Code
- `packages/tier2-hooks/` - New unified package
- Adapters: Redux, API, DBAL
- Hooks: useEntity, useProjects, useWorkspaces, etc.
- Cache: IndexedDB, memory implementations

### Documentation
- API reference
- Migration guide (old → new hooks)
- Examples for each frontend
- Adapter architecture docs

### Tests
- Adapter unit tests
- Hook integration tests
- Service layer tests
- E2E tests per frontend

### Refactoring (Phase 5c+)
- Update workflowui hooks
- Update frontends/nextjs hooks
- Add frontends/dbal support
- Remove duplicate code

---

## File Locations

### Source Files to Extract
```
workflowui/src/
├── hooks/useProject.ts
├── hooks/useWorkspace.ts
├── hooks/useWorkflow.ts
├── hooks/useExecution.ts
├── services/projectService.ts
├── services/workspaceService.ts
├── services/workflowService.ts
└── services/executionService.ts

frontends/nextjs/src/
├── hooks/useUsers.ts
├── hooks/useUserForm.ts
├── hooks/useUserActions.ts
├── hooks/usePackages.ts
├── hooks/usePackageDetails.ts
├── hooks/usePackageActions.ts
├── hooks/useWorkflow.ts
└── lib/hooks/use-rest-api.ts

redux/slices/src/
├── slices/projectSlice.ts
├── slices/workspaceSlice.ts
├── slices/workflowSlice.ts
└── types/
```

### Target Structure (Phase 5)
```
packages/tier2-hooks/
├── src/adapters/
├── src/cache/
├── src/hooks/
├── src/types/
└── tests/
```

---

## Related Documentation

- **Full Analysis:** `docs/TIER2_HOOKS_ANALYSIS.md`
- **Extraction Strategy:** `docs/TIER2_EXTRACTION_STRATEGY.md`
- **Redux Architecture:** `redux/slices/README.md`
- **Frontend Patterns:** `frontends/nextjs/src/hooks/README.md`

---

## Quick Links

- Analysis: `/Users/rmac/Documents/metabuilder/docs/TIER2_HOOKS_ANALYSIS.md`
- Strategy: `/Users/rmac/Documents/metabuilder/docs/TIER2_EXTRACTION_STRATEGY.md`
- Reference: `/Users/rmac/Documents/metabuilder/docs/TIER2_HOOKS_REFERENCE.md`

