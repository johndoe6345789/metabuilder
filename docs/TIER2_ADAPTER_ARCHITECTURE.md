# Tier 2 Hooks: Service Adapter Architecture

**Phase 5 Implementation Guide**

---

## Architecture Overview

### High-Level Design

```
┌────────────────────────────────────────────────────────────────┐
│                    React Components                            │
│            (workflowui | frontends/nextjs | dbal)             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   Tier 2 Hooks Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ useEntity<T>(entityType, options)                        │  │
│  │ ├─ useProjects()                                         │  │
│  │ ├─ useWorkspaces()                                       │  │
│  │ ├─ useWorkflows()                                        │  │
│  │ ├─ useExecutions()                                       │  │
│  │ ├─ useUsers()                                            │  │
│  │ └─ usePackages()                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │Redux Adapter │ │ API Adapter  │ │DBAL Adapter  │
  │(workflowui)  │ │(nextjs)      │ │(minimal)     │
  └──────────────┘ └──────────────┘ └──────────────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
    ┌────────────────────────────────────┐
    │   Service Layer (Generic CRUD)     │
    │  ├─ list(skip, take, filter)      │
    │  ├─ get(id)                        │
    │  ├─ create(data)                   │
    │  ├─ update(id, data)               │
    │  ├─ delete(id)                     │
    │  └─ action(id, actionName)         │
    │                                    │
    │  Features:                         │
    │  • Retry with exponential backoff  │
    │  • Query parameter building        │
    │  • Error normalization             │
    │  • Request cancellation (AbortCtrl)│
    └────────────────────────────────────┘
              │              │
              ▼              ▼
    ┌──────────────┐   ┌────────────────┐
    │ Cache Layer  │   │ HTTP Requests  │
    ├─ IndexedDB   │   └────────────────┘
    ├─ Memory      │          │
    └─ HTTP        │          ▼
                   │    ┌────────────────┐
                   ▼    │  Backend API   │
                   └────►   (REST)       │
                         └────────────────┘
```

---

## Adapter Pattern Detailed

### 1. ServiceAdapter Interface (Base)

```typescript
// packages/tier2-hooks/src/adapters/base.ts

export interface ServiceAdapter<T> {
  /**
   * List entities with optional filtering and pagination
   */
  list(options?: {
    skip?: number
    take?: number
    search?: string
    filter?: Record<string, any>
    orderBy?: Record<string, 'asc' | 'desc'>
    signal?: AbortSignal
  }): Promise<{
    items: T[]
    total: number
    skip?: number
    take?: number
  }>

  /**
   * Get single entity by ID
   */
  get(id: string, signal?: AbortSignal): Promise<T | null>

  /**
   * Create new entity
   */
  create(data: Partial<T>): Promise<T>

  /**
   * Update entity
   */
  update(id: string, data: Partial<T>): Promise<T>

  /**
   * Delete entity
   */
  delete(id: string): Promise<void>

  /**
   * Custom action on entity (optional)
   */
  action?(id: string, actionName: string, data?: any): Promise<any>

  /**
   * Get current selection (Redux only)
   */
  getCurrent?(): T | null

  /**
   * Set current selection (Redux only)
   */
  setCurrent?(id: string | null): void

  /**
   * Invalidate cache
   */
  invalidateCache?(): Promise<void>
}

/**
 * Base implementation with common logic
 */
export abstract class BaseServiceAdapter<T> implements ServiceAdapter<T> {
  protected apiBase: string
  protected retries: number = 3
  protected retryDelay: (attempt: number) => number =
    (attempt) => Math.pow(2, attempt) * 1000

  abstract list(options?: FetchOptions): Promise<ListResult<T>>
  abstract get(id: string, signal?: AbortSignal): Promise<T | null>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<void>

  protected async retryWithBackoff<R>(
    fn: () => Promise<R>,
    shouldRetry?: (error: any) => boolean
  ): Promise<R> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        const isRetryable = shouldRetry
          ? shouldRetry(error)
          : this.isRetryableError(error)

        if (attempt < this.retries - 1 && isRetryable) {
          await new Promise(resolve =>
            setTimeout(resolve, this.retryDelay(attempt))
          )
          continue
        }

        throw error
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  protected isRetryableError(error: any): boolean {
    // Retryable: network errors, 5xx, timeouts
    // Non-retryable: 4xx (except 408, 429)
    const status = error?.statusCode
    if (status && status >= 400 && status < 500) {
      return status === 408 || status === 429
    }
    return true
  }
}
```

---

### 2. Redux Adapter (workflowui)

```typescript
// packages/tier2-hooks/src/adapters/redux-adapter.ts

export class ReduxAdapter<T> extends BaseServiceAdapter<T> {
  private dispatch: AppDispatch
  private selectState: (state: RootState) => EntityState<T>
  private actions: EntityActions<T>
  private service: EntityService<T>  // API service
  private cache?: CacheStore<T>

  constructor(config: {
    dispatch: AppDispatch
    selectState: (state: RootState) => EntityState<T>
    actions: EntityActions<T>
    service: EntityService<T>
    cache?: CacheStore<T>
  }) {
    super()
    this.dispatch = config.dispatch
    this.selectState = config.selectState
    this.actions = config.actions
    this.service = config.service
    this.cache = config.cache
  }

  async list(options?: FetchOptions): Promise<ListResult<T>> {
    return this.retryWithBackoff(async () => {
      this.dispatch(this.actions.setLoading(true))
      try {
        const result = await this.service.list(options)
        this.dispatch(this.actions.setItems(result.items))

        // Cache if enabled
        if (this.cache) {
          await Promise.all(
            result.items.map(item => this.cache!.set(item.id, item))
          )
        }

        this.dispatch(this.actions.setError(null))
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : 'List failed'
        this.dispatch(this.actions.setError(message))
        throw error
      } finally {
        this.dispatch(this.actions.setLoading(false))
      }
    })
  }

  async get(id: string, signal?: AbortSignal): Promise<T | null> {
    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get(id)
      if (cached) return cached
    }

    return this.retryWithBackoff(async () => {
      const item = await this.service.get(id, { signal })
      if (item && this.cache) {
        await this.cache.set(id, item)
      }
      return item
    })
  }

  async create(data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      this.dispatch(this.actions.setLoading(true))
      try {
        const item = await this.service.create(data)
        this.dispatch(this.actions.addItem(item))

        if (this.cache) {
          await this.cache.set(item.id, item)
        }

        this.dispatch(this.actions.setError(null))
        return item
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Create failed'
        this.dispatch(this.actions.setError(message))
        throw error
      } finally {
        this.dispatch(this.actions.setLoading(false))
      }
    })
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      this.dispatch(this.actions.setLoading(true))
      try {
        const item = await this.service.update(id, data)
        this.dispatch(this.actions.updateItem(item))

        if (this.cache) {
          await this.cache.set(id, item)
        }

        this.dispatch(this.actions.setError(null))
        return item
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Update failed'
        this.dispatch(this.actions.setError(message))
        throw error
      } finally {
        this.dispatch(this.actions.setLoading(false))
      }
    })
  }

  async delete(id: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      this.dispatch(this.actions.setLoading(true))
      try {
        await this.service.delete(id)
        this.dispatch(this.actions.removeItem(id))

        if (this.cache) {
          await this.cache.delete(id)
        }

        this.dispatch(this.actions.setError(null))
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Delete failed'
        this.dispatch(this.actions.setError(message))
        throw error
      } finally {
        this.dispatch(this.actions.setLoading(false))
      }
    })
  }

  getCurrent(): T | null {
    const state = this.selectState({} as RootState)
    return state.currentItem || null
  }

  setCurrent(id: string | null): void {
    this.dispatch(this.actions.setCurrent(id))
  }

  async invalidateCache(): Promise<void> {
    if (this.cache) {
      await this.cache.clear()
    }
  }
}
```

---

### 3. API Adapter (frontends/nextjs)

```typescript
// packages/tier2-hooks/src/adapters/api-adapter.ts

export class APIAdapter<T> extends BaseServiceAdapter<T> {
  private baseUrl: string
  private tenant: string
  private packageId?: string
  private abortController?: AbortController
  private cache?: CacheStore<T>

  constructor(config: {
    baseUrl: string
    tenant: string
    packageId?: string
    cache?: CacheStore<T>
  }) {
    super()
    this.baseUrl = config.baseUrl
    this.tenant = config.tenant
    this.packageId = config.packageId
    this.cache = config.cache
  }

  private buildUrl(
    entity: string,
    id?: string,
    action?: string
  ): string {
    let url = `${this.baseUrl}/v1/${this.tenant}`
    if (this.packageId) url += `/${this.packageId}`
    url += `/${entity}`
    if (id) url += `/${id}`
    if (action) url += `/${action}`
    return url
  }

  private buildQueryString(options?: FetchOptions): string {
    const params = new URLSearchParams()

    if (options?.skip !== undefined) {
      params.set('skip', String(options.skip))
    }

    if (options?.take !== undefined) {
      params.set('take', String(options.take))
    }

    if (options?.search) {
      params.set('search', options.search)
    }

    if (options?.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        params.set(`filter.${key}`, String(value))
      }
    }

    if (options?.orderBy) {
      for (const [key, value] of Object.entries(options.orderBy)) {
        params.set(`orderBy.${key}`, value)
      }
    }

    const query = params.toString()
    return query ? `?${query}` : ''
  }

  async list(options?: FetchOptions): Promise<ListResult<T>> {
    // Cancel previous request
    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController()

    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity') + this.buildQueryString(options)
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        signal: this.abortController!.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        items: data.items || data.data || [],
        total: data.total || data.meta?.total || 0
      }
    })
  }

  async get(id: string, signal?: AbortSignal): Promise<T | null> {
    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get(id)
      if (cached) return cached
    }

    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity', id)
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        signal
      })

      if (response.status === 404) return null
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const item = data.data || data

      if (this.cache && item.id) {
        await this.cache.set(item.id, item)
      }

      return item
    })
  }

  async create(data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity')
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const item = await response.json()

      if (this.cache && item.id) {
        await this.cache.set(item.id, item)
      }

      return item
    })
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity', id)
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const item = await response.json()

      if (this.cache) {
        await this.cache.set(id, item)
      }

      return item
    })
  }

  async delete(id: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity', id)
      const response = await fetch(url, { method: 'DELETE' })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (this.cache) {
        await this.cache.delete(id)
      }
    })
  }

  async action(id: string, actionName: string, data?: any): Promise<any> {
    return this.retryWithBackoff(async () => {
      const url = this.buildUrl('entity', id, actionName)
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    })
  }

  async invalidateCache(): Promise<void> {
    if (this.cache) {
      await this.cache.clear()
    }
  }
}
```

---

### 4. DBAL Adapter (frontends/dbal - Minimal)

```typescript
// packages/tier2-hooks/src/adapters/dbal-adapter.ts

export class DBALAdapter<T> extends BaseServiceAdapter<T> {
  private dbal: DBAL
  private entity: string

  constructor(config: {
    dbal: DBAL
    entity: string
  }) {
    super()
    this.dbal = config.dbal
    this.entity = config.entity
  }

  async list(options?: FetchOptions): Promise<ListResult<T>> {
    return this.retryWithBackoff(async () => {
      const query = this.dbal.query(this.entity)

      if (options?.skip) query = query.skip(options.skip)
      if (options?.take) query = query.take(options.take)
      if (options?.filter) query = query.where(options.filter)
      if (options?.orderBy) query = query.orderBy(options.orderBy)

      const items = await query.get()
      const total = await this.dbal.count(this.entity, options?.filter)

      return { items, total }
    })
  }

  async get(id: string, signal?: AbortSignal): Promise<T | null> {
    return this.retryWithBackoff(async () => {
      return await this.dbal.query(this.entity)
        .where({ id })
        .first()
    }, undefined, signal)
  }

  async create(data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      return await this.dbal.insert(this.entity, data as T)
    })
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.retryWithBackoff(async () => {
      return await this.dbal.update(this.entity, id, data)
    })
  }

  async delete(id: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      await this.dbal.delete(this.entity, id)
    })
  }

  async invalidateCache(): Promise<void> {
    // DBAL handles its own caching
  }
}
```

---

## Generic Hook Factory

```typescript
// packages/tier2-hooks/src/hooks/use-entity.ts

export interface UseEntityOptions<T> {
  adapter: ServiceAdapter<T>
  cache?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: T[] | T) => void
}

export function useEntity<T>(
  entityType: string,
  options: UseEntityOptions<T>
): UseEntityReturn<T> {
  const { adapter, cache: enableCache } = options

  const [state, setState] = useState<EntityState<T>>({
    items: [],
    currentItem: null,
    isLoading: false,
    error: null,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Load entities
   */
  const list = useCallback(
    async (fetchOptions?: FetchOptions) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const skip = ((pagination.page - 1) * pagination.limit)
        const result = await adapter.list({
          skip,
          take: pagination.limit,
          ...fetchOptions,
          signal: abortControllerRef.current.signal
        })

        const totalPages = Math.ceil(result.total / pagination.limit)

        setState(prev => ({
          ...prev,
          items: result.items,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            totalPages
          }
        }))

        options.onSuccess?.(result.items)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Unknown error'
          }))
          options.onError?.(error as Error)
        }
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [adapter, pagination, options]
  )

  /**
   * Get single entity
   */
  const get = useCallback(
    async (id: string) => {
      const item = await adapter.get(id)
      options.onSuccess?.(item)
      return item
    },
    [adapter, options]
  )

  /**
   * Create entity
   */
  const create = useCallback(
    async (data: Partial<T>) => {
      const item = await adapter.create(data)
      setState(prev => ({
        ...prev,
        items: [item, ...prev.items]
      }))
      options.onSuccess?.(item)
      return item
    },
    [adapter, options]
  )

  /**
   * Update entity
   */
  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      const item = await adapter.update(id, data)
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === id ? item : i),
        currentItem: prev.currentItem?.id === id ? item : prev.currentItem
      }))
      options.onSuccess?.(item)
      return item
    },
    [adapter, options]
  )

  /**
   * Delete entity
   */
  const remove = useCallback(
    async (id: string) => {
      await adapter.delete(id)
      setState(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== id),
        currentItem: prev.currentItem?.id === id ? null : prev.currentItem
      }))
    },
    [adapter]
  )

  /**
   * Refetch with current filters
   */
  const refetch = useCallback(
    async () => {
      await list()
    },
    [list]
  )

  /**
   * Search (debounced)
   */
  const search = useCallback(
    async (term: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        list({ search: term })
      }, 300)
    },
    [list]
  )

  /**
   * Filter
   */
  const filter = useCallback(
    async (criteria: Record<string, any>) => {
      await list({ filter: criteria })
    },
    [list]
  )

  /**
   * Set current selection
   */
  const setCurrent = useCallback(
    (id: string | null) => {
      if (!id) {
        setState(prev => ({ ...prev, currentItem: null }))
        return
      }

      const item = state.items.find(i => i.id === id)
      setState(prev => ({ ...prev, currentItem: item || null }))
      adapter.setCurrent?.(id)
    },
    [state.items, adapter]
  )

  /**
   * Change page
   */
  const changePage = useCallback(
    async (page: number) => {
      setPagination(prev => ({ ...prev, page }))
    },
    []
  )

  /**
   * Change page limit
   */
  const changeLimit = useCallback(
    async (limit: number) => {
      setPagination(prev => ({ ...prev, limit, page: 1 }))
    },
    []
  )

  // Load on mount
  useEffect(() => {
    list()
  }, [list])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    items: state.items,
    currentItem: state.currentItem,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,

    list,
    get,
    create,
    update,
    delete: remove,
    setCurrent,
    refetch,
    search,
    filter,
    changePage,
    changeLimit
  }
}
```

---

## Implementation Roadmap

### Step 1: Create Adapter Foundation
```typescript
// ✅ Implement BaseServiceAdapter
// ✅ Define ServiceAdapter interface
// ✅ Define types and interfaces
```

### Step 2: Implement Adapters
```typescript
// ✅ ReduxAdapter (with cache)
// ✅ APIAdapter (with request cancellation)
// ✅ DBALAdapter (minimal)
```

### Step 3: Create Cache Layer
```typescript
// ✅ IndexedDBCache (for workflowui)
// ✅ MemoryCache (for frontends/nextjs)
// ✅ CacheStore interface
```

### Step 4: Implement useEntity Hook
```typescript
// ✅ Generic hook factory
// ✅ State management
// ✅ CRUD operations
// ✅ Pagination
// ✅ Search/Filter
// ✅ Error handling
```

### Step 5: Create Entity-Specific Hooks
```typescript
// ✅ useProjects
// ✅ useWorkspaces
// ✅ useWorkflows
// ✅ useExecutions
// ✅ useUsers
// ✅ usePackages
```

### Step 6: Migrate Existing Code
```typescript
// 🔄 workflowui hooks
// 🔄 frontends/nextjs hooks
// 🔄 Remove duplication
```

### Step 7: Add Testing & Docs
```typescript
// 📝 Adapter tests
// 📝 Hook tests
// 📝 Integration tests
// 📝 Migration guide
```

---

## Files Structure

```
packages/tier2-hooks/
├── src/
│   ├── adapters/
│   │   ├── base.ts                  # BaseServiceAdapter
│   │   ├── redux-adapter.ts         # ReduxAdapter
│   │   ├── api-adapter.ts           # APIAdapter
│   │   ├── dbal-adapter.ts          # DBALAdapter
│   │   └── index.ts
│   │
│   ├── cache/
│   │   ├── store.ts                 # CacheStore interface
│   │   ├── indexeddb-cache.ts       # IndexedDB implementation
│   │   ├── memory-cache.ts          # Memory implementation
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── use-entity.ts            # Generic useEntity factory
│   │   ├── use-projects.ts          # useProjects
│   │   ├── use-workspaces.ts        # useWorkspaces
│   │   ├── use-workflows.ts         # useWorkflows
│   │   ├── use-executions.ts        # useExecutions
│   │   ├── use-users.ts             # useUsers
│   │   ├── use-packages.ts          # usePackages
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── adapter.ts               # Adapter interfaces
│   │   ├── cache.ts                 # Cache interfaces
│   │   ├── entity.ts                # Entity types
│   │   ├── hook.ts                  # Hook return types
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── retry.ts                 # Retry logic
│   │   ├── query-builder.ts         # Query string builder
│   │   └── index.ts
│   │
│   └── index.ts                     # Main export
│
├── tests/
│   ├── adapters/
│   │   ├── base.test.ts
│   │   ├── redux-adapter.test.ts
│   │   ├── api-adapter.test.ts
│   │   └── dbal-adapter.test.ts
│   ├── hooks/
│   │   ├── use-entity.test.ts
│   │   └── use-projects.test.ts
│   └── cache/
│       ├── indexeddb-cache.test.ts
│       └── memory-cache.test.ts
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── ADAPTERS.md
│   ├── MIGRATION.md
│   └── EXAMPLES.md
│
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Next Steps

1. Review and approve architecture
2. Create RFC for team discussion
3. Begin Phase 5a implementation
4. Create proof-of-concept with one entity
5. Iterate based on feedback

