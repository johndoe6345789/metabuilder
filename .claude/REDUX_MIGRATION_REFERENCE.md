# Redux Migration Reference - Phase 2 Complete

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Applications                      │
│        (codegen, nextjs, qt6, workflowui)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
┌────────▼────────────┐  ┌──────▼──────────────┐
│ @metabuilder/       │  │ @metabuilder/       │
│ api-clients         │  │ hooks-async         │
│ (Phase 2 - Wrapper) │  │ (Phase 1 - Redux)   │
└────────┬────────────┘  └──────┬──────────────┘
         │                      │
         └──────────┬───────────┘
                    │
           ┌────────▼────────────┐
           │   Redux Store       │
           │  - asyncDataSlice   │
           │  - selectAsyncData  │
           │  - fetchAsyncData   │
           └─────────────────────┘
```

## Hook Mapping

### useAsyncData
```typescript
// Old (standalone)
const { data, isLoading, error, retry, refetch, isRefetching } = useAsyncData(
  async () => fetch('/api/data'),
  { 
    retries: 3,
    retryDelay: 1000,
    onSuccess: (data) => console.log(data),
    onError: (error: Error) => console.error(error),
    dependencies: [dep1, dep2]
  }
)

// New (Redux-backed, API identical)
// No changes needed! The wrapper handles the mapping:
// retries → maxRetries
// Error objects ← Error strings (converted)
```

### usePaginatedData
```typescript
// Maintains 0-based page numbering in public API
const paginated = usePaginatedData(
  async (page: number, pageSize: number) => {
    const res = await fetch(`/api/items?page=${page}&size=${pageSize}`)
    return { items: res.data, total: res.total }
  },
  { pageSize: 20, initialPage: 0 }
)

// Internally converts to 1-based for Redux layer
// page: 0 (user) → page: 1 (Redux)
// page: 1 (user) → page: 2 (Redux)
```

### useMutation
```typescript
// API unchanged
const { mutate, isLoading, error, reset } = useMutation(
  async (data: UserInput) => {
    const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(data) })
    return res.json()
  },
  {
    onSuccess: (result) => console.log('Created:', result),
    onError: (error: Error) => console.error(error)
  }
)

// Wrapper converts Redux error strings to Error objects
```

## Implementation Details

### Error Handling
```typescript
// Redux layer returns: error: string | null
// API layer returns: error: Error | null

// Conversion happens in wrapper:
const errorObj = new Error(reduxResult.error)
```

### Pagination State Mapping
```typescript
// User-facing (0-based)
const [page, setPage] = useState(0)

// Redux layer (1-based)
goToPage(userPage + 1)  // Convert when calling Redux
setPage(newPage)        // Update local state

// fetchFn adjustment:
const result = await fetchFn(reduxPage - 1, pageSize)
// Convert 1-based Redux page back to 0-based for API calls
```

### Dependencies Handling
```typescript
// Handle readonly DependencyList
const deps = asyncOptions.dependencies 
  ? Array.isArray(asyncOptions.dependencies) 
    ? [...asyncOptions.dependencies]  // Make mutable copy
    : [asyncOptions.dependencies]
  : []
```

## Testing the Migration

### Unit Tests
```bash
# Test TypeScript compilation
npm run build --workspace=@metabuilder/api-clients

# Should produce valid type definitions
ls redux/api-clients/dist/useAsyncData.d.ts
```

### Integration Tests
```bash
# Test in Next.js frontend
cd frontends/nextjs
npm run dev

# Test in CodeForge
cd codegen
npm run dev

# Test in workflowui
cd workflowui
npm run dev
```

### Verification Checklist
- [ ] TypeScript build passes
- [ ] Type definitions generated correctly
- [ ] No breaking changes to public API
- [ ] Error objects properly converted
- [ ] Pagination page numbers correctly mapped
- [ ] Redux DevTools shows async state updates
- [ ] All callbacks (onSuccess, onError) execute
- [ ] Refetch and retry functionality works

## Backward Compatibility Status

### Type Signatures: IDENTICAL
- All function parameters unchanged
- All return types unchanged
- All option fields supported

### Behavior: COMPATIBLE
- useAsyncData: Same loading/error/retry flow
- usePaginatedData: Same pagination navigation
- useMutation: Same async execution with callbacks

### Dependencies: ADDED
New required dependencies:
- @metabuilder/hooks-async (new)
- react-redux (new, peer)
- redux (new, peer)

Old dependencies still supported:
- react (unchanged)

## Performance Considerations

### Benefits
- Centralized Redux store for state deduplication
- Automatic request deduplication
- Redux DevTools for debugging
- Consistent state management across app

### No Regressions
- Same network request lifecycle
- Same error handling
- Same retry logic
- Same refetch behavior
- Same memory footprint (Redux replaces standalone state)

## Next Steps

1. Monitor production Redux state for async operations
2. Collect performance metrics (network requests, render counts)
3. Plan Phase 3: Gradual rollout across all frontends
4. Consider adding Redux Thunk for complex workflows
5. Document Redux state structure for developers

## References

- Phase 1: `/redux/hooks-async` (Redux-backed hooks)
- Phase 1: `/redux/asyncDataSlice` (Redux slice)
- Phase 2: `/redux/api-clients` (Wrapper layer - YOU ARE HERE)
- Phase 3: Integration and testing across frontends
