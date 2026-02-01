# Tier 2 Data Hooks Analysis

**Analysis Date:** January 23, 2026
**Status:** ANALYSIS_COMPLETE
**Scope:** Extract and standardize Tier 2 hooks across MetaBuilder frontends

## Executive Summary

Tier 2 hooks are entity-level data management hooks that depend on Redux and/or services. They implement CRUD, filtering, pagination, and caching patterns. The analysis reveals significant fragmentation across three frontend implementations (workflowui, frontends/nextjs, codegen) that can be unified through a service adapter pattern.

---

## I. Tier 2 Hooks Inventory

### A. Hooks Found in workflowui (Redux + Service)

| Hook | Location | Redux Slice | Service | Pattern |
|------|----------|------------|---------|---------|
| `useProject` | `hooks/useProject.ts` | projectSlice | projectService | CRUD + list + current selection |
| `useWorkspace` | `hooks/useWorkspace.ts` | workspaceSlice | workspaceService | CRUD + list + current selection |
| `useWorkflow` | `hooks/useWorkflow.ts` | workflowSlice | workflowService | Load, create, auto-save, operations |
| `useExecution` | `hooks/useExecution.ts` | workflowSlice | executionService | Execute, stop, history, stats |

**Characteristics:**
- Tightly coupled to Redux state management
- Use dispatch/useSelector for state access
- Delegate to service layer for API calls
- Implement IndexedDB caching via db/schema
- Include local storage persistence (tenantId, currentProjectId)

### B. Hooks Found in frontends/nextjs (No Redux)

| Hook | Location | Pattern | Caching |
|------|----------|---------|---------|
| `useUsers` | `hooks/useUsers.ts` | Paginated list + search + filtering | Client state only |
| `useWorkflow` | `hooks/useWorkflow.ts` | Execute + polling + retry logic | Client state only |
| `usePackages` | `hooks/usePackages.ts` | Paginated list + search + status filter + refetch | Client state only |
| `useUserForm` | `hooks/useUserForm.ts` | Form state management | Client state only |
| `useUserActions` | `hooks/useUserActions.ts` | CRUD operations wrapper | Client state only |
| `usePackageDetails` | `hooks/usePackageDetails.ts` | Single entity + related data | Client state only |
| `usePackageActions` | `hooks/usePackageActions.ts` | CRUD operations wrapper | Client state only |

**Characteristics:**
- No Redux dependency
- Direct fetch() API calls
- Client-side state (useState)
- Debounced search
- Manual pagination and filtering
- AbortController for request cancellation

### C. Generic Service Adapters (Available to All)

| Hook | Location | Pattern | Usage |
|------|----------|---------|-------|
| `useRestApi` | `lib/hooks/use-rest-api.ts` | Generic CRUD with query builder | frontends/nextjs |
| `useEntity` | `lib/hooks/use-rest-api.ts` | Entity-specific wrapper | frontends/nextjs |
| `useDependencyEntity` | `lib/hooks/use-rest-api.ts` | Cross-package entity access | frontends/nextjs |

**Characteristics:**
- Framework-agnostic API client
- Builds URLs from entity name + tenant + package
- Supports custom actions
- Handles AbortSignal for cancellation
- No caching (relies on HTTP caching)

---

## II. Common Patterns Identified

### Pattern 1: Basic CRUD + Current Selection
**Examples:** `useProject`, `useWorkspace`
**Components:**
- State: `items[]`, `currentItem`, `isLoading`, `error`
- Actions: `list()`, `create()`, `update()`, `delete()`, `setCurrent()`
- Caching: IndexedDB + localStorage for persistence

### Pattern 2: List with Pagination, Search, Filtering
**Examples:** `useUsers`, `usePackages`
**Components:**
- State: `items[]`, `pagination{page,limit,total}`, `search`, `filters`, `isLoading`
- Actions: `fetch()`, `search()`, `filterBy()`, `changePage()`, `changeLimit()`, `refetch()`
- Features: Debounced search, AbortController for cancellation
- Caching: None (client-side state only)

### Pattern 3: Entity Operations + Async Actions
**Examples:** `useExecution`, `useWorkflow`
**Components:**
- State: `currentItem`, `history[]`, `status`, `metrics`
- Actions: Execute/Action, retrieve results, cancel, retry with backoff
- Features: Auto-retry on network errors, progress tracking
- Caching: Execution history maintained in Redux/state

### Pattern 4: Form Management with Actions
**Examples:** `useUserForm`, `usePackageActions`
**Components:**
- State: Form fields, validation errors, submission status
- Actions: Update field, validate, submit/delete, reset
- Features: Debounced validation, error normalization

### Pattern 5: Single Entity + Related Data
**Examples:** `usePackageDetails`, `useProjectCanvas`
**Components:**
- State: Main entity, related collections, loading
- Actions: Load, refetch, update related items
- Caching: None (direct fetch)

---

## III. Redux Infrastructure Analysis

### Redux Slices Used

**projectSlice** (`redux/slices/src/slices/projectSlice.ts`)
```typescript
interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  isLoading: boolean
  error: string | null
}
// Actions: setProjects, addProject, updateProject, removeProject, setCurrentProject
```

**workspaceSlice** (`redux/slices/src/slices/workspaceSlice.ts`)
```typescript
interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
  isLoading: boolean
  error: string | null
}
// Actions: similar to projectSlice
```

**workflowSlice** (`redux/slices/src/slices/workflowSlice.ts`)
```typescript
interface WorkflowState {
  current: Workflow | null
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  isDirty: boolean
  isSaving: boolean
  executionHistory: ExecutionResult[]
  currentExecution: ExecutionResult | null
}
// Actions: loadWorkflow, addNode, updateNode, deleteNode, addConnection, startExecution, endExecution
```

**Key Selectors Pattern:**
```typescript
export const selectProjects = (state: { project: ProjectState }) => state.project.projects
export const selectCurrentProject = (state: { project: ProjectState }) => {
  if (!state.project.currentProjectId) return null
  return state.project.projects.find((p) => p.id === state.project.currentProjectId)
}
```

### Redux in Hooks Pattern

**Workflowui pattern:**
```typescript
const dispatch = useDispatch<AppDispatch>()
const items = useSelector((state: RootState) => selectItems(state))
const isLoading = useSelector((state: RootState) => selectIsLoading(state))

const load = useCallback(async () => {
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

## IV. Service Layer Analysis

### Service Base Structure

All services follow this pattern:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { retries?: number; params?: Record<string, any> }
): Promise<T>

export const service = {
  // CRUD operations
  async list(tenantId, params) { }
  async get(id) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }

  // Optional: specialized operations
  async customAction() { }
}
```

### Services Found

| Service | Location | Entities |
|---------|----------|----------|
| projectService | `workflowui/src/services/projectService.ts` | projects, canvas items |
| workspaceService | `workflowui/src/services/workspaceService.ts` | workspaces |
| workflowService | `workflowui/src/services/workflowService.ts` | workflows |
| executionService | `workflowui/src/services/executionService.ts` | executions |

---

## V. Common Implementation Details

### Local Storage Usage
```typescript
// Pattern across hooks:
const getTenantId = useCallback(() => {
  return localStorage.getItem('tenantId') || 'default'
}, [])

localStorage.setItem('currentProjectId', id)
localStorage.removeItem('currentProjectId')
```

### IndexedDB Caching (workflowui only)
```typescript
// Pattern:
import { projectDB, workspaceDB } from '../db/schema'

await projectDB.create(project)
await projectDB.update(project)
await projectDB.delete(id)
```

### Debouncing (frontends/nextjs pattern)
```typescript
// Global timer for search
let searchTimeout: NodeJS.Timeout | null = null

const search = useCallback((term) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  setState(prev => ({ ...prev, search: term }))

  searchTimeout = setTimeout(async () => {
    await fetchUsers(1, limit, term)
  }, 300)
}, [])
```

### AbortController Pattern (frontends/nextjs)
```typescript
const abortControllerRef = useRef<AbortController | null>(null)

const fetch = useCallback(async () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }

  abortControllerRef.current = new AbortController()

  try {
    const response = await fetch(url, {
      signal: abortControllerRef.current.signal
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return
  }
}, [])
```

---

## VI. Proposed Service Adapter Pattern

### Goal
Create a unified Tier 2 hook interface that works with or without Redux, supports optional caching, and provides consistent CRUD patterns.

### Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                  React Component (Any Frontend)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Tier 2 Hooks (Standardized API)                │
│  useEntity<T>(entityType, options) | useUsers() etc.       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Redux Adapter      │      │  Direct API Adapter  │
│  (with dispatch)     │      │   (no Redux)         │
└──────────────────────┘      └──────────────────────┘
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        ┌────────────────────────────────┐
        │   Service Layer (Generic)      │
        │   - API calls (fetch)          │
        │   - Retry logic                │
        │   - Query building             │
        └────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Optional Cache     │      │   HTTP Cache         │
│   (IndexedDB)        │      │   (Headers)          │
└──────────────────────┘      └──────────────────────┘
```

### Adapter Interface Specification

```typescript
/**
 * Adapter configuration - determines data source strategy
 */
interface DataSourceAdapter<T> {
  // Whether to use Redux for state management
  useRedux: boolean

  // Redux integration (optional)
  redux?: {
    dispatch: AppDispatch
    selectState: (state: RootState) => EntityState<T>
    actions: {
      setLoading: (loading: boolean) => Action
      setError: (error: string | null) => Action
      setItems: (items: T[]) => Action
      addItem: (item: T) => Action
      updateItem: (item: T) => Action
      removeItem: (id: string) => Action
      setCurrent: (id: string | null) => Action
    }
  }

  // Cache strategy
  cache?: {
    type: 'indexeddb' | 'localstorage' | 'memory' | 'none'
    ttl?: number // milliseconds
  }

  // API configuration
  api: {
    baseUrl: string
    tenant?: string
    retries?: number
  }
}

/**
 * Standardized Tier 2 hook return type
 */
interface UseEntityReturn<T> {
  // State
  items: T[]
  currentItem: T | null
  currentId: string | null
  isLoading: boolean
  error: string | null
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // CRUD actions
  list: (options?: FetchOptions) => Promise<T[]>
  get: (id: string) => Promise<T | null>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>

  // Convenience actions
  setCurrent: (id: string | null) => void
  refetch: () => Promise<void>

  // Search & filter
  search?: (term: string) => Promise<void>
  filter?: (criteria: Record<string, any>) => Promise<void>
}

/**
 * Factory function - creates properly configured hook
 */
function createTier2Hook<T>(config: {
  entityType: string
  adapter: DataSourceAdapter<T>
}): () => UseEntityReturn<T>
```

### Implementation Strategy: Three Adapter Types

#### Adapter 1: Redux-Backed (workflowui)
```typescript
const useProjectWithRedux = () => {
  const adapter = {
    useRedux: true,
    redux: {
      dispatch: useDispatch(),
      selectState: (state) => state.project,
      actions: projectSlice.actions
    },
    cache: { type: 'indexeddb' },
    api: { baseUrl: '/api', tenant: getTenantId() }
  }

  return createTier2Hook({
    entityType: 'project',
    adapter
  })
}
```

#### Adapter 2: Direct API (frontends/nextjs)
```typescript
const useUsersWithAPI = () => {
  const adapter = {
    useRedux: false,
    cache: { type: 'memory' },
    api: {
      baseUrl: '/api/v1/{tenant}',
      tenant: getTenant()
    }
  }

  return createTier2Hook({
    entityType: 'user',
    adapter
  })
}
```

#### Adapter 3: Minimal DBAL (frontends/dbal)
```typescript
const useEntitiesWithDBAL = () => {
  const adapter = {
    useRedux: false,
    cache: { type: 'none' },
    api: {
      baseUrl: '/api/v1/{tenant}',
      retries: 1
    }
  }

  return createTier2Hook({
    entityType: 'entity',
    adapter
  })
}
```

---

## VII. Standardized Features to Extract

### A. Pagination Pattern
**Standardize:** Skip/take parameters, total count, page calculation

**Current fragmentation:**
- workflowui: `limit`, `offset`, `params`
- frontends/nextjs: `page`, `limit` (0-indexed)
- useRestApi: `take`, `skip`

**Unified approach:**
```typescript
interface PaginationOptions {
  page: number    // 1-indexed
  limit: number   // items per page
}

// Convert to API params (skip/take)
const apiParams = {
  skip: (page - 1) * limit,
  take: limit
}
```

### B. Search & Filter Pattern
**Standardize:** Debounced search, multi-field filtering, query building

**Current implementation:**
```typescript
// frontends/nextjs useUsers
const searchUsers = useCallback(async (term) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  setState(prev => ({ ...prev, search: term }))

  searchTimeout = setTimeout(async () => {
    await fetchUsers(1, limit, term)
  }, 300)
}, [])

// Should be unified as:
const search = useCallback((term, options?) => {
  return debounceSearch(term, 300, async (t) => {
    await list({ search: t, page: 1 })
  })
}, [])
```

### C. Error Handling & Retry Pattern
**Standardize:** Exponential backoff, retry logic, error normalization

**Current pattern in projectService:**
```typescript
for (let attempt = 0; attempt < retries; attempt++) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(...)
    return response.json()
  } catch (error) {
    if (attempt < retries - 1 && !(error as any).status) {
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      )
      continue
    }
    throw lastError
  }
}
```

**Should extract to:** `retryWithBackoff(fn, options)`

### D. Cache Invalidation Strategy
**Standardize:** TTL-based, manual invalidation, optimistic updates

**Options:**
- IndexedDB: Persist between sessions, TTL checking
- Memory: Session-only, instant invalidation
- HTTP headers: ETags, Cache-Control

### E. Tenancy & Multi-Package Support
**Standardize:** Tenant resolution, package routing, dependency access

**Pattern:**
```typescript
const getTenantId = useCallback(() => {
  return localStorage.getItem('tenantId') || 'default'
}, [])

// Should be centralized:
const { tenant, package, hasPackage } = useTenantContext()
```

---

## VIII. Migration Path: Phase 5 Implementation

### Step 1: Create Base Service Adapter Layer
**File:** `packages/tier2-hooks/src/adapters/base.ts`
```typescript
export interface ServiceAdapter<T> {
  list(options?: FetchOptions): Promise<T[]>
  get(id: string): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export class BaseServiceAdapter<T> implements ServiceAdapter<T> {
  // Implement retry logic, query building, error handling
}
```

### Step 2: Create Adapter Implementations
**Files:**
- `packages/tier2-hooks/src/adapters/redux-adapter.ts` (for workflowui)
- `packages/tier2-hooks/src/adapters/api-adapter.ts` (for frontends/nextjs)
- `packages/tier2-hooks/src/adapters/dbal-adapter.ts` (for frontends/dbal)

### Step 3: Implement Unified Tier 2 Hooks
**File:** `packages/tier2-hooks/src/hooks/use-entity.ts`
```typescript
export function useEntity<T>(
  entityType: string,
  adapter: ServiceAdapter<T>,
  options?: EntityOptions<T>
): UseEntityReturn<T>
```

### Step 4: Create Entity-Specific Hooks
**Files:**
- `packages/tier2-hooks/src/hooks/use-projects.ts`
- `packages/tier2-hooks/src/hooks/use-workspaces.ts`
- `packages/tier2-hooks/src/hooks/use-workflows.ts`
- `packages/tier2-hooks/src/hooks/use-executions.ts`
- `packages/tier2-hooks/src/hooks/use-users.ts`
- `packages/tier2-hooks/src/hooks/use-packages.ts`

### Step 5: Refactor Existing Hooks (Per Frontend)
- **workflowui:** Update to use new unified hooks (with Redux adapter)
- **frontends/nextjs:** Update to use new unified hooks (with API adapter)
- **frontends/dbal:** Use new unified hooks (with minimal adapter)

### Step 6: Add Cache Layer (Optional)
**File:** `packages/tier2-hooks/src/cache/index.ts`
- IndexedDB cache for workflowui
- Memory cache for frontends
- Cache invalidation strategies

---

## IX. Benefits of Unified Approach

### For Developers
1. **Single API:** One hook signature across all frontends
2. **Consistency:** Same pagination, search, error handling everywhere
3. **Reusability:** Generic hooks work with any entity type
4. **Testability:** Adapters enable easier mocking and testing

### For Deployments
1. **Code Reduction:** ~40% less code (estimated)
2. **Maintainability:** Single source of truth for entity patterns
3. **Scalability:** Easy to add new entities or frontends
4. **Performance:** Standardized caching strategies

### For Product Features
1. **Feature Parity:** All frontends get same capabilities
2. **Real-time Sync:** Easier to add WebSocket/real-time adapters
3. **Offline Support:** Cache layer enables offline mode
4. **Analytics:** Centralized API call tracking

---

## X. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Redux hooks strongly coupled to slices | Create slim adapter layer that doesn't break existing Redux |
| Different API schemas per frontend | Normalize at adapter layer before returning data |
| Pagination index differences (0 vs 1) | Convert internally; expose 1-indexed to consumers |
| Cache invalidation bugs | Comprehensive test suite + manual invalidation API |
| Breaking existing code | Gradual migration; run both old and new hooks during transition |

---

## XI. Dependencies

### Required Packages
- `@reduxjs/toolkit` (already in workflowui)
- `react` (already in all frontends)
- No new external dependencies needed

### Internal Dependencies
- Redux slices (from redux/slices)
- Service implementations (from each frontend)
- Type definitions (consolidate to packages/types)

---

## XII. Files to Create/Modify

### New Files (Phase 5)
```
packages/
├── tier2-hooks/                    # New package
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── base.ts
│   │   │   ├── redux-adapter.ts
│   │   │   ├── api-adapter.ts
│   │   │   └── dbal-adapter.ts
│   │   ├── cache/
│   │   │   ├── index.ts
│   │   │   ├── indexeddb-cache.ts
│   │   │   └── memory-cache.ts
│   │   ├── hooks/
│   │   │   ├── use-entity.ts
│   │   │   ├── use-projects.ts
│   │   │   ├── use-workspaces.ts
│   │   │   ├── use-workflows.ts
│   │   │   ├── use-executions.ts
│   │   │   ├── use-users.ts
│   │   │   └── use-packages.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── README.md
```

### Modified Files (Phase 5+)
- `workflowui/src/hooks/useProject.ts` → Use new unified hook
- `workflowui/src/hooks/useWorkspace.ts` → Use new unified hook
- `workflowui/src/hooks/useWorkflow.ts` → Use new unified hook
- `workflowui/src/hooks/useExecution.ts` → Use new unified hook
- `frontends/nextjs/src/hooks/useUsers.ts` → Use new unified hook
- `frontends/nextjs/src/hooks/usePackages.ts` → Use new unified hook
- `frontends/nextjs/src/hooks/useWorkflow.ts` → Use new unified hook

---

## XIII. Estimation

### Phase 5a: Foundation (1-2 weeks)
- Create base adapter layer
- Define types and interfaces
- Implement 3 adapter variants
- Write tests for adapters

### Phase 5b: Core Hooks (2-3 weeks)
- Implement generic useEntity hook
- Create entity-specific hooks
- Write tests for hooks
- Documentation

### Phase 5c: Migration (2-3 weeks)
- Refactor workflowui hooks
- Refactor frontends/nextjs hooks
- Add dbal support
- Integration testing

### Phase 5d: Polish (1 week)
- Performance optimization
- Cache invalidation strategies
- Error handling improvements
- Final documentation

**Total Estimate:** 6-9 weeks (1.5-2 months)

---

## XIV. Success Metrics

1. **Code Reduction:** 30-40% fewer hooks files
2. **Coverage:** 100% of entity CRUD operations
3. **Test Coverage:** >80% on adapters and hooks
4. **Performance:** <5% regression in API response times
5. **Type Safety:** All hooks fully typed, no `any` types
6. **Documentation:** All hooks documented with examples

---

## XV. Next Steps

1. **Review this analysis** with team leads
2. **Validate proposed adapter pattern** against actual use cases
3. **Create proof-of-concept** with one entity (e.g., useProjects)
4. **Iterate based on feedback**
5. **Plan Phase 5 work in detail**
6. **Create RFC document** for architecture review

---

## Appendix: Hook Comparison Matrix

| Feature | workflowui | frontends/nextjs | codegen |
|---------|-----------|-----------------|---------|
| Redux support | ✅ Yes | ❌ No | ⚠️ Partial |
| Service layer | ✅ Yes | ⚠️ Direct fetch | ❌ No |
| Pagination | ⚠️ limit/offset | ✅ page/limit | ❌ None |
| Search | ❌ No | ✅ Debounced | ❌ No |
| Filtering | ❌ No | ✅ Yes | ❌ No |
| Retry logic | ✅ Yes | ❌ No | ❌ No |
| Caching | ✅ IndexedDB | ❌ No | ❌ No |
| Refetch on focus | ❌ No | ✅ Yes | ❌ No |
| Form management | ⚠️ Partial | ✅ Yes | ❌ No |
| Current selection | ✅ Yes | ❌ No | ❌ No |
| Error handling | ✅ Yes | ⚠️ Basic | ❌ No |
| Type safety | ✅ Strong | ✅ Strong | ⚠️ Weak |

