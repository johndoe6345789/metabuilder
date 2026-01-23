# Redux Async Data Management - Documentation Index

Complete guide to finding the right documentation for your needs.

**TanStack to Redux Migration Status**: ✅ COMPLETE (All 5 Phases)
**Completion Date**: January 23, 2026
**Status**: Production Ready

---

## Quick Navigation

| I Want To... | Go To | Time |
|---|---|---|
| **Get started in 5 minutes** | [Quick Start](#quick-start) | 5 min |
| **Learn how to use async hooks** | [docs/guides/REDUX_ASYNC_DATA_GUIDE.md](../guides/REDUX_ASYNC_DATA_GUIDE.md) | 30 min |
| **Understand the technical details** | [redux/slices/docs/ASYNC_DATA_SLICE.md](../../redux/slices/docs/ASYNC_DATA_SLICE.md) | 30 min |
| **See the big picture** | [TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md](#architecture) | 20 min |
| **Migrate from TanStack** | [Migration Guide](#migration-guide) | 15 min |
| **Debug with Redux DevTools** | [Debugging Guide](#debugging) | 10 min |
| **Troubleshoot an issue** | [Troubleshooting](#troubleshooting) | 10 min |
| **See what was changed** | [TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt](../../txt/TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt) | 10 min |

---

## Quick Start

### I've never used Redux async hooks - where do I start?

**Time needed**: 10 minutes  
**Files**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Quick Start section](../guides/REDUX_ASYNC_DATA_GUIDE.md#quick-start)

**Quick Examples:**

Fetch data:
```typescript
import { useReduxAsyncData } from '@metabuilder/api-clients'

const { data, isLoading, error } = useReduxAsyncData(
  () => fetch('/api/users').then(r => r.json())
)
```

Mutate data:
```typescript
import { useReduxMutation } from '@metabuilder/api-clients'

const { mutate, isLoading } = useReduxMutation(
  (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json())
)
```

That's it! The API is identical to TanStack React Query.

### I'm migrating from TanStack - what changes?

**Time needed**: 5 minutes  
**Files**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Migration section](../guides/REDUX_ASYNC_DATA_GUIDE.md#migration-from-tanstack)

**Summary**: Just rename the hooks!

```typescript
// BEFORE
import { useQuery, useMutation } from '@tanstack/react-query'
const { data } = useQuery({ queryKey: ['users'], queryFn: () => {...} })
const { mutate } = useMutation({ mutationFn: (user) => {...} })

// AFTER
import { useReduxAsyncData, useReduxMutation } from '@metabuilder/api-clients'
const { data } = useReduxAsyncData(() => {...})
const { mutate } = useReduxMutation((user) => {...})
```

No other changes needed. Same API, same behavior, same return objects.

---

## For Different Users

### For Frontend Developers (New to Redux Async)

**Start here**: [Quick Start](#quick-start) (5 min)
**Then read**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md](../guides/REDUX_ASYNC_DATA_GUIDE.md) (30 min)
**Reference**: [Troubleshooting](#troubleshooting) (as needed)

**What you'll learn:**
- How to fetch data with useReduxAsyncData
- How to handle mutations with useReduxMutation
- How to handle errors and loading states
- Common patterns in your components
- How to debug with Redux DevTools

### For Backend Developers (Understanding the Architecture)

**Start here**: [TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md](TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md#technical-details) (20 min)
**Then read**: [redux/slices/docs/ASYNC_DATA_SLICE.md](../../redux/slices/docs/ASYNC_DATA_SLICE.md) (30 min)
**Reference**: API documentation in code

**What you'll learn:**
- How the async slice works internally
- State shape and structure
- Thunks and selectors
- Request deduplication strategy
- Error handling approach

### For Tech Leads (Strategy & Implementation)

**Start here**: [TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md](TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md) (30 min)
**Then review**: [PHASE5_COMPLETION_VERIFICATION.txt](PHASE5_COMPLETION_VERIFICATION.txt) (10 min)
**For Q&A**: [TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt](../../txt/TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt) (20 min)

**What you'll learn:**
- Why we migrated from TanStack
- Performance improvements (17KB bundle reduction)
- Architecture decisions and trade-offs
- Testing and validation results
- Team readiness and next steps
- Rollback plan if needed

### For QA / Testing

**Start here**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Troubleshooting](../guides/REDUX_ASYNC_DATA_GUIDE.md#troubleshooting) (15 min)
**Then read**: [Debugging with Redux DevTools](#debugging) (10 min)
**Reference**: [docs/CLAUDE.md - Async Data Management](../CLAUDE.md#async-data-management-with-redux) (as needed)

**What you'll learn:**
- How to verify async operations work correctly
- Common issues and how to spot them
- How to use Redux DevTools for debugging
- Request deduplication behavior
- Error scenarios to test

---

## Documentation Files

### Tier 1: Start Here

#### docs/guides/REDUX_ASYNC_DATA_GUIDE.md
**Best for:** Getting started and using the hooks
**Length:** 800+ lines  
**Audience:** Frontend developers  
**Contains:**
- Quick start with basic examples
- Complete API documentation for both hooks
- Advanced patterns (6 patterns with examples)
- Error handling strategies
- Performance optimization tips
- Migration guide from TanStack
- Troubleshooting guide

**When to read:** When learning how to use async hooks

### Tier 2: Deep Understanding

#### redux/slices/docs/ASYNC_DATA_SLICE.md
**Best for:** Understanding how it works internally
**Length:** 640+ lines  
**Audience:** Developers and architects  
**Contains:**
- State shape and architecture
- All thunks documented with signatures
- All selectors documented with examples
- Request ID conventions
- Direct slice usage (without hooks)
- Redux DevTools integration guide
- Performance optimization strategies

**When to read:** When understanding the implementation or direct slice usage

#### docs/CLAUDE.md - Async Data Management Section
**Best for:** Quick reference and patterns
**Length:** 330+ lines  
**Audience:** All developers  
**Contains:**
- Overview of async management
- Hook signatures
- Migration table from TanStack
- Redux state structure
- Redux DevTools debugging
- Common patterns
- References to other docs

**When to read:** For quick overview and to understand fit in bigger picture

### Tier 3: Historical & Strategic

#### TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md
**Best for:** Understanding why and what changed
**Length:** 626 lines  
**Audience:** Tech leads, architects, team members  
**Contains:**
- Executive summary
- All 5 phases of migration
- Technical architecture
- Performance improvements
- Lessons learned
- Future improvements
- Rollback plan
- Success metrics

**When to read:** When joining the team or for strategic context

#### TANSTACK_TO_REDUX_MIGRATION_CHECKLIST.txt
**Best for:** Completion status and verification
**Length:** 339 lines  
**Audience:** Project managers, tech leads  
**Contains:**
- Completion status of all phases
- Verification checklist (30+ items)
- Files created and modified
- Performance metrics
- Timeline and effort
- Lessons learned
- Rollback instructions

**When to read:** For project status and completion verification

---

## Common Scenarios

### Scenario 1: I need to fetch user data

**Solution**: Use `useReduxAsyncData`

**Step 1**: Import the hook
```typescript
import { useReduxAsyncData } from '@metabuilder/api-clients'
```

**Step 2**: Use it in your component
```typescript
const { data: users, isLoading, error } = useReduxAsyncData(
  () => fetch('/api/users').then(r => r.json())
)
```

**Step 3**: Render
```typescript
if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
return <div>{users?.map(u => <div>{u.name}</div>)}</div>
```

**More info**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - useReduxAsyncData](../guides/REDUX_ASYNC_DATA_GUIDE.md#usereduxasyncdata-hook)

---

### Scenario 2: I need to create/update/delete data

**Solution**: Use `useReduxMutation`

**Step 1**: Import the hook
```typescript
import { useReduxMutation } from '@metabuilder/api-clients'
```

**Step 2**: Create mutation
```typescript
const { mutate, isLoading } = useReduxMutation(
  (user) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }).then(r => r.json())
)
```

**Step 3**: Execute
```typescript
const handleCreate = () => {
  mutate({ name: 'John', email: 'john@example.com' })
}
```

**More info**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - useReduxMutation](../guides/REDUX_ASYNC_DATA_GUIDE.md#usereduxmutation-hook)

---

### Scenario 3: I need to refresh data after mutation

**Solution**: Use `refetch()` callback

```typescript
const { data: users, refetch } = useReduxAsyncData(...)
const { mutate: createUser } = useReduxMutation(..., {
  onSuccess: () => refetch()  // Refresh list after create
})
```

**More info**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Refetch After Mutation](../guides/REDUX_ASYNC_DATA_GUIDE.md#refetch-after-mutation)

---

### Scenario 4: Something is broken - how do I debug?

**Solution**: Use Redux DevTools

**Step 1**: Install Redux DevTools browser extension

**Step 2**: Open DevTools and look for `asyncData/*` actions

**Step 3**: Click on actions to see state changes

**Step 4**: Use time-travel to replay the request

**More info**: [Debugging Guide](#debugging) and [redux/slices/docs/ASYNC_DATA_SLICE.md - Debugging](../../redux/slices/docs/ASYNC_DATA_SLICE.md#debugging-with-redux-devtools)

---

### Scenario 5: I'm migrating from TanStack - what changes?

**Solution**: Just rename hooks!

**Before (TanStack)**:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
const { data } = useQuery({ queryKey: ['users'], queryFn: () => {...} })
const { mutate } = useMutation({ mutationFn: (user) => {...} })
```

**After (Redux)**:
```typescript
import { useReduxAsyncData, useReduxMutation } from '@metabuilder/api-clients'
const { data } = useReduxAsyncData(() => {...})
const { mutate } = useReduxMutation((user) => {...})
```

**More info**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Migration from TanStack](../guides/REDUX_ASYNC_DATA_GUIDE.md#migration-from-tanstack)

---

## Debugging

### Using Redux DevTools

1. **Install Redux DevTools** (Chrome/Firefox extension)
2. **Open DevTools** while using the app
3. **Look for actions** starting with `asyncData/`
4. **Inspect state** to see requests and responses
5. **Time-travel** by clicking earlier actions
6. **Dispatch actions** to test scenarios

### Common Debugging Tasks

**I want to see all requests:**
→ Filter Redux DevTools for `asyncData/*` actions

**I want to see the response:**
→ Click on `asyncData/fetchAsyncData/fulfilled` action and inspect payload

**I want to see the error:**
→ Click on `asyncData/fetchAsyncData/rejected` action and inspect error

**I want to replay a request:**
→ Time-travel to before the request and forward again

### Redux DevTools Resources

- [redux/slices/docs/ASYNC_DATA_SLICE.md - Debugging with Redux DevTools](../../redux/slices/docs/ASYNC_DATA_SLICE.md#debugging-with-redux-devtools)
- [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Debugging](../guides/REDUX_ASYNC_DATA_GUIDE.md#debugging)
- [docs/CLAUDE.md - Redux DevTools Integration](../CLAUDE.md#async-data-management-with-redux)

---

## Troubleshooting

### Issue: Data not updating after mutation

**Solution**: Add `refetch()` to mutation onSuccess

```typescript
const { refetch } = useReduxAsyncData(...)
const { mutate } = useReduxMutation(..., {
  onSuccess: () => refetch()
})
```

### Issue: Getting duplicate API calls

**This is normal behavior!** - Redux automatically deduplicates. If you're seeing real duplicates, check:
1. Component doesn't render twice (React.StrictMode)
2. Dependencies array is correct

### Issue: Memory usage growing

**Solution**: Let automatic cleanup handle it (5-minute TTL) or manually call:

```typescript
import { cleanupAsyncRequests } from '@metabuilder/redux-slices'
dispatch(cleanupAsyncRequests())
```

### Issue: Stale data displayed

**Solution**: Adjust staleTime or force refetch

```typescript
const { refetch } = useReduxAsyncData(fetchFn, { 
  staleTime: 0  // Always fresh
})
refetch()  // Manual refresh
```

**More issues**: [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Troubleshooting](../guides/REDUX_ASYNC_DATA_GUIDE.md#troubleshooting)

---

## Quick Reference

### Hook Signatures

**useReduxAsyncData:**
```typescript
const { data, isLoading, error, isRefetching, refetch, retry } 
  = useReduxAsyncData<T>(fetchFn, options?)
```

**useReduxMutation:**
```typescript
const { mutate, isLoading, error, status, reset } 
  = useReduxMutation<T, R>(mutationFn, options?)
```

### Common Options

**useReduxAsyncData options:**
- `maxRetries` - Max retry attempts (default: 3)
- `refetchOnFocus` - Refetch when tab focused (default: true)
- `refetchInterval` - Polling interval in ms (default: undefined)
- `onSuccess` - Callback when data arrives
- `onError` - Callback on error

**useReduxMutation options:**
- `onSuccess` - Callback after mutation
- `onError` - Callback on error
- `onSettled` - Callback when done

### Request Deduplication

Concurrent requests with same request ID share result:
```typescript
// All make ONE API call
const { data: users1 } = useReduxAsyncData(() => fetch('/api/users'))
const { data: users2 } = useReduxAsyncData(() => fetch('/api/users'))
const { data: users3 } = useReduxAsyncData(() => fetch('/api/users'))
```

---

## Performance Tips

1. **Request IDs are key** - Use consistent IDs for caching
2. **staleTime is important** - Balance freshness vs API calls
3. **Cleanup happens automatically** - No manual cleanup needed (unless long-lived app)
4. **Use pagination** - For large datasets, load incrementally
5. **Refetch wisely** - Only refetch what actually changed

**More tips**: [redux/slices/docs/ASYNC_DATA_SLICE.md - Performance Tips](../../redux/slices/docs/ASYNC_DATA_SLICE.md#performance-tips)

---

## Get Help

**For usage questions:**
→ Check [docs/guides/REDUX_ASYNC_DATA_GUIDE.md](../guides/REDUX_ASYNC_DATA_GUIDE.md)

**For technical details:**
→ Check [redux/slices/docs/ASYNC_DATA_SLICE.md](../../redux/slices/docs/ASYNC_DATA_SLICE.md)

**For troubleshooting:**
→ Check [docs/guides/REDUX_ASYNC_DATA_GUIDE.md - Troubleshooting](../guides/REDUX_ASYNC_DATA_GUIDE.md#troubleshooting)

**For debugging:**
→ Use Redux DevTools and check [Debugging Guide](#debugging)

**For strategic questions:**
→ Check [TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md](TANSTACK_REDUX_MIGRATION_FINAL_REPORT.md)

---

**Last Updated**: January 23, 2026  
**Status**: All Documentation Complete  
**Version**: 2.0.0
