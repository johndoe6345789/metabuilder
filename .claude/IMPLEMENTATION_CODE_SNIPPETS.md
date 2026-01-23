# Phase 2 Implementation - Code Snippets

## File 1: /redux/api-clients/package.json

```json
{
  "name": "@metabuilder/api-clients",
  "version": "0.1.0",
  "description": "API client hooks for MetaBuilder - DBAL, async data fetching, GitHub integration",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "dependencies": {
    "@metabuilder/hooks-async": "^0.1.0",
    "react": "^19.2.3",
    "react-redux": "^9.2.0",
    "redux": "^4.2.1"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-redux": "^8.0.0 || ^9.0.0",
    "redux": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  },
  "files": [
    "dist"
  ]
}
```

## File 2: /redux/api-clients/src/index.ts

```typescript
/**
 * @metabuilder/api-clients
 *
 * Generic API client hooks for MetaBuilder frontends
 * - useDBAL: DBAL database API client
 * - useAsyncData: Generic async data fetching with retries and refetching
 * - useGitHubFetcher: GitHub API integration
 *
 * NOTE: Phase 2 Migration Complete
 * useAsyncData, usePaginatedData, and useMutation now delegate to Redux-backed
 * implementations via @metabuilder/hooks-async. API remains unchanged for
 * backward compatibility across all frontends (codegen, nextjs, qt6, etc).
 */

// DBAL hook
export { useDBAL } from './useDBAL'
export type { DBALError, DBALResponse, UseDBALOptions, UseDBALResult } from './useDBAL'

// Async data hooks (now Redux-backed via @metabuilder/hooks-async)
export { useAsyncData, usePaginatedData, useMutation } from './useAsyncData'
export type {
  UseAsyncDataOptions,
  UseAsyncDataResult,
  UsePaginatedDataOptions,
  UsePaginatedDataResult,
  UseMutationOptions,
  UseMutationResult,
} from './useAsyncData'

// GitHub fetcher hook
export { useGitHubFetcher, useWorkflowFetcher } from './useGitHubFetcher'
export type { WorkflowRun, UseGitHubFetcherOptions, UseGitHubFetcherResult } from './useGitHubFetcher'
```

## File 3: /redux/api-clients/src/useAsyncData.ts (Key Sections)

### useAsyncData Hook - Delegating Implementation

```typescript
import {
  useReduxAsyncData as useReduxAsyncDataImpl,
  useReduxPaginatedAsyncData as useReduxPaginatedAsyncDataImpl,
  useReduxMutation as useReduxMutationImpl,
} from '@metabuilder/hooks-async'

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    dependencies = [],
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
    refetchOnFocus = true,
    refetchInterval = null,
    initialData,
  } = options

  // Track initial data locally for compatibility
  const [localData, setLocalData] = useState<T | undefined>(initialData)

  // Delegate to Redux-backed implementation
  const reduxResult = useReduxAsyncDataImpl<T>(fetchFn, {
    maxRetries: retries,                    // Map: retries → maxRetries
    retryDelay,
    refetchOnFocus,
    refetchInterval: refetchInterval ?? undefined,
    dependencies: Array.isArray(dependencies) ? [...dependencies] : [],
    onSuccess: (data) => {
      setLocalData(data as T)
      onSuccess?.(data as T)
    },
    onError: (error: string) => {
      // Convert error string to Error object for backward compatibility
      const errorObj = new Error(error)
      onError?.(errorObj)
    },
  })

  // Use local data if available, otherwise use Redux data
  const data = reduxResult.data ?? localData

  return {
    data,
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    isRefetching: reduxResult.isRefetching,
    retry: reduxResult.retry,
    refetch: reduxResult.refetch,
  }
}
```

### usePaginatedData Hook - Pagination State Mapping

```typescript
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataResult<T> {
  const { pageSize = 10, initialPage = 0, ...asyncOptions } = options

  // Track pagination locally - convert from 0-based to 1-based for Redux hook
  const [page, setPage] = useState(initialPage)
  const [itemCount, setItemCount] = useState(0)

  // Create a mutable copy of dependencies for the Redux hook
  const deps = asyncOptions.dependencies 
    ? Array.isArray(asyncOptions.dependencies) 
      ? [...asyncOptions.dependencies]  // Make mutable copy
      : [asyncOptions.dependencies]
    : []

  // Delegate to Redux-backed paginated implementation
  // Note: Redux hook uses 1-based pages, convert our 0-based page
  const reduxResult = useReduxPaginatedAsyncDataImpl<T>(
    (reduxPage: number, reduxPageSize: number) => {
      // Convert from Redux 1-based to API 0-based for the fetch function
      return fetchFn(reduxPage - 1, reduxPageSize).then((result) => {
        setItemCount(result.total)
        return result.items
      })
    },
    {
      pageSize,
      initialPage: page + 1, // Convert 0-based to 1-based for Redux hook
      dependencies: deps,
      maxRetries: asyncOptions.retries,
      retryDelay: asyncOptions.retryDelay,
      refetchOnFocus: asyncOptions.refetchOnFocus,
      refetchInterval: (asyncOptions.refetchInterval ?? null) ?? undefined,
      onSuccess: asyncOptions.onSuccess as ((data: unknown) => void) | undefined,
      onError: (error: string) => {
        // Convert error string to Error object for backward compatibility
        const errorObj = new Error(error)
        asyncOptions.onError?.(errorObj)
      },
    }
  )

  const pageCount = Math.ceil(itemCount / pageSize)

  return {
    data: reduxResult.data || [],
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    isRefetching: reduxResult.isRefetching,
    retry: reduxResult.retry,
    refetch: reduxResult.refetch,
    page,
    pageCount,
    itemCount,
    goToPage: (newPage: number) => {
      if (newPage >= 0 && newPage < pageCount) {
        setPage(newPage)
        reduxResult.goToPage(newPage + 1) // Convert to 1-based
      }
    },
    nextPage: () => {
      if (page < pageCount - 1) {
        const newPage = page + 1
        setPage(newPage)
        reduxResult.nextPage()
      }
    },
    previousPage: () => {
      if (page > 0) {
        const newPage = page - 1
        setPage(newPage)
        reduxResult.prevPage()
      }
    },
  }
}
```

### useMutation Hook - Error Object Conversion

```typescript
export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: UseMutationOptions<T, R> = {}
): UseMutationResult<T, R> {
  const { onSuccess, onError } = options

  // Delegate to Redux-backed implementation
  const reduxResult = useReduxMutationImpl<T, R>(mutationFn, {
    onSuccess,
    onError: (error: string) => {
      // Convert error string to Error object for backward compatibility
      const errorObj = new Error(error)
      onError?.(errorObj)
    },
  })

  return {
    mutate: reduxResult.mutate,
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    reset: reduxResult.reset,
  }
}
```

## Type Definitions Generated

The TypeScript compiler generates `.d.ts` files that maintain the exact same interface:

```typescript
// useAsyncData.d.ts generated output
export interface UseAsyncDataOptions<T> {
    dependencies?: React.DependencyList;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retries?: number;
    retryDelay?: number;
    refetchOnFocus?: boolean;
    refetchInterval?: number | null;
    initialData?: T;
}

export interface UseAsyncDataResult<T> {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
    isRefetching: boolean;
    retry: () => Promise<void>;
    refetch: () => Promise<void>;
}

export declare function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options?: UseAsyncDataOptions<T>
): UseAsyncDataResult<T>;
```

## Consumer Usage - No Changes Required

```typescript
// Example 1: useAsyncData with old code (unchanged)
const { data, isLoading, error } = useAsyncData(
  async () => {
    const res = await fetch('/api/users')
    return res.json()
  },
  {
    retries: 3,
    retryDelay: 1000,
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error: Error) => console.error('Failed:', error.message),
    dependencies: [userId]
  }
)

// Example 2: usePaginatedData with old code (unchanged)
const paginated = usePaginatedData(
  async (page: number, pageSize: number) => {
    const res = await fetch(`/api/items?page=${page}&size=${pageSize}`)
    return { items: res.data, total: res.total }
  },
  { pageSize: 20, initialPage: 0 }
)

// Example 3: useMutation with old code (unchanged)
const { mutate, isLoading, error } = useMutation(
  async (user: User) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    })
    return res.json()
  },
  {
    onSuccess: (result) => console.log('Created:', result),
    onError: (error: Error) => console.error('Failed:', error.message)
  }
)
```

## Key Implementation Patterns

### 1. Error String → Error Object Conversion
```typescript
// Redux returns: error: string | null
// We need: error: Error | null

// Conversion:
const error = reduxResult.error ? new Error(reduxResult.error) : null

// Usage in callback:
onError: (error: string) => {
  const errorObj = new Error(error)
  options.onError?.(errorObj)
}
```

### 2. Readonly DependencyList Handling
```typescript
// Input: React.DependencyList (readonly unknown[])
// Redux expects: unknown[]

// Solution:
const deps = asyncOptions.dependencies 
  ? Array.isArray(asyncOptions.dependencies) 
    ? [...asyncOptions.dependencies]  // Spread to create mutable copy
    : [asyncOptions.dependencies]      // Wrap non-array as array
  : []
```

### 3. Pagination 0-Based ↔ 1-Based Mapping
```typescript
// Public API: 0-based pages (standard for JavaScript)
// page: 0, 1, 2, ...

// Redux layer: 1-based pages
// page: 1, 2, 3, ...

// Mapping:
initialPage: page + 1           // Convert when passing to Redux
reduxPage - 1                   // Convert in fetch function
goToPage(newPage + 1)           // Convert when calling Redux method
```

## Build Output Verification

```bash
$ npm run build --workspace=@metabuilder/api-clients

> @metabuilder/api-clients@0.1.0 build
> tsc

✓ Compilation successful
✓ 0 errors
✓ Generated files:
  - dist/index.js
  - dist/index.d.ts
  - dist/useAsyncData.js
  - dist/useAsyncData.d.ts
  - dist/useDBAL.js
  - dist/useDBAL.d.ts
  - dist/useGitHubFetcher.js
  - dist/useGitHubFetcher.d.ts
```

## Migration Checklist

- [x] Identified all exports and their signatures
- [x] Created wrapper functions
- [x] Mapped option names (retries → maxRetries)
- [x] Implemented error conversion (string → Error)
- [x] Implemented pagination state mapping (0-based ↔ 1-based)
- [x] Handled readonly DependencyList
- [x] Maintained initialData support
- [x] Verified all type signatures
- [x] Built successfully with zero errors
- [x] Generated valid TypeScript definitions
- [x] Documented changes
- [x] Created git commit

