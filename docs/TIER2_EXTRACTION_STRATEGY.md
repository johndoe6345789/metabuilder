# Tier 2 Hooks Extraction Strategy - Executive Summary

**Status:** ANALYSIS_COMPLETE
**Date:** January 23, 2026

---

## Key Findings

### Tier 2 Hooks Found: 11 Total

**workflowui (4 hooks - Redux-backed):**
1. `useProject` - Project CRUD + selection
2. `useWorkspace` - Workspace CRUD + selection
3. `useWorkflow` - Workflow operations + auto-save
4. `useExecution` - Execution + history + stats

**frontends/nextjs (7 hooks - No Redux):**
5. `useUsers` - User list with pagination, search, filtering
6. `useUserForm` - User form state management
7. `useUserActions` - User CRUD operations
8. `usePackages` - Package list with pagination, search
9. `usePackageDetails` - Single package + related data
10. `usePackageActions` - Package CRUD operations
11. `useWorkflow` - Workflow execution + retry logic

**Generic Service Adapters (3 - Available to all):**
- `useRestApi` - Generic CRUD builder (frontends/nextjs)
- `useEntity` - Entity-specific wrapper (frontends/nextjs)
- `useDependencyEntity` - Cross-package access (frontends/nextjs)

---

## Common Patterns (5 Identified)

| Pattern | Examples | Key Features |
|---------|----------|--------------|
| **Basic CRUD + Selection** | useProject, useWorkspace | items[], current, CRUD actions, persistence |
| **List + Pagination + Search** | useUsers, usePackages | pagination, debounced search, filtering, refetch |
| **Async Actions + History** | useExecution, useWorkflow | status tracking, retry logic, progress metrics |
| **Form Management** | useUserForm, usePackageActions | field state, validation, submission handling |
| **Entity + Related Data** | usePackageDetails | main entity, collections, lazy loading |

---

## Fragmentation Issues

### Problem 1: API Schema Differences
- workflowui: `limit`, `offset`, `params`
- frontends/nextjs: `page`, `limit` (0-indexed)
- useRestApi: `take`, `skip`

### Problem 2: State Management Mismatch
- workflowui: Redux + service + IndexedDB
- frontends/nextjs: useState + direct fetch + AbortController
- No unified interface

### Problem 3: Feature Gaps
- workflowui: No search/filter support
- frontends/nextjs: No caching strategy
- No real-time sync adapters anywhere

### Problem 4: Duplication
- Search debouncing implemented separately in each hook
- Pagination logic repeated
- Error handling patterns inconsistent
- Retry logic only in workflowui

---

## Proposed Service Adapter Pattern

### Three-Layer Architecture

```
Tier 2 Hooks (Unified API)
    ↓
Adapters (Redux | API | DBAL)
    ↓
Service Layer (CRUD + Retry + Query)
    ↓
Storage (Cache | Fetch | DBAL)
```

### Unified Hook Interface

```typescript
interface UseEntityReturn<T> {
  // State
  items: T[]
  currentItem: T | null
  isLoading: boolean
  error: string | null
  pagination?: { page, limit, total, totalPages }

  // CRUD Actions
  list(options?: FetchOptions): Promise<T[]>
  get(id: string): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>

  // Convenience
  setCurrent(id: string | null): void
  refetch(): Promise<void>
  search?(term: string): Promise<void>
  filter?(criteria: Record<string, any>): Promise<void>
}
```

### Adapter Variants

**Redux Adapter (workflowui)**
- Uses dispatch/useSelector
- Maintains Redux state
- IndexedDB caching
- localStorage persistence

**API Adapter (frontends/nextjs)**
- Direct fetch() calls
- useState for local state
- AbortController for cancellation
- Memory caching optional

**DBAL Adapter (frontends/dbal)**
- Minimal implementation
- No caching
- No Redux
- Stateless

---

## Standardized Features to Extract

### 1. Pagination (Normalize)
```
Internal: page (1-indexed), limit
API: skip, take (for backend compatibility)
UI: page, totalPages, hasNext
```

### 2. Search & Filtering (Unify)
```
All: Debounced search + filter criteria
Pattern: setTimeout 300ms, use AbortController
Builder: Construct query string from criteria
```

### 3. Error Handling & Retry (Consolidate)
```
Retry: Exponential backoff (2^attempt * 1000ms)
Retries: 3 attempts max
Non-retryable: HTTP 4xx status codes
Normalized errors: { message, code, statusCode, details }
```

### 4. Caching Strategy (Add)
```
IndexedDB: workflowui (persist between sessions, TTL)
Memory: frontends/nextjs (session only)
HTTP: All (headers-based, ETag support)
Manual: invalidate() method on all hooks
```

### 5. Tenancy & Packages (Centralize)
```
Tenant resolution: Context provider
Package routing: Via URL parameters
Dependency access: useDependencyEntity pattern
Multi-tenant: Automatic tenant ID injection
```

---

## Migration Strategy (Phase 5)

### Timeline: 6-9 weeks (1.5-2 months)

**Phase 5a: Foundation (1-2 weeks)**
- Create base ServiceAdapter interface
- Implement Redux, API, DBAL adapters
- Create base cache layer
- Write adapter tests

**Phase 5b: Core Hooks (2-3 weeks)**
- Implement generic useEntity hook
- Create entity-specific hooks (projects, workspaces, workflows, executions, users, packages)
- Write hook tests
- Create documentation + examples

**Phase 5c: Migration (2-3 weeks)**
- Refactor workflowui hooks to use new pattern
- Refactor frontends/nextjs hooks to use new pattern
- Add frontends/dbal support
- Integration testing across all frontends

**Phase 5d: Polish (1 week)**
- Performance optimization
- Cache invalidation improvements
- Error handling edge cases
- Final documentation + migration guide

---

## Implementation Files to Create

```
packages/tier2-hooks/
├── src/
│   ├── adapters/
│   │   ├── base.ts              # ServiceAdapter interface
│   │   ├── redux-adapter.ts     # workflowui
│   │   ├── api-adapter.ts       # frontends/nextjs
│   │   └── dbal-adapter.ts      # frontends/dbal
│   ├── cache/
│   │   ├── index.ts
│   │   ├── indexeddb-cache.ts
│   │   └── memory-cache.ts
│   ├── hooks/
│   │   ├── use-entity.ts        # Generic hook factory
│   │   ├── use-projects.ts
│   │   ├── use-workspaces.ts
│   │   ├── use-workflows.ts
│   │   ├── use-executions.ts
│   │   ├── use-users.ts
│   │   └── use-packages.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

### Modified Existing Files (Phase 5+)

**workflowui:**
- `src/hooks/useProject.ts` → Use `useEntity` + Redux adapter
- `src/hooks/useWorkspace.ts` → Use `useEntity` + Redux adapter
- `src/hooks/useWorkflow.ts` → Use `useEntity` + Redux adapter
- `src/hooks/useExecution.ts` → Use `useEntity` + Redux adapter

**frontends/nextjs:**
- `src/hooks/useUsers.ts` → Use `useEntity` + API adapter
- `src/hooks/usePackages.ts` → Use `useEntity` + API adapter
- `src/hooks/useWorkflow.ts` → Use `useEntity` + API adapter

---

## Benefits

### Quantitative
- 30-40% code reduction (estimated)
- Single implementation for 11+ hooks
- 100% feature parity across frontends

### Qualitative
- **Developer Experience:** One hook signature to learn
- **Consistency:** Same pagination, search, error handling everywhere
- **Maintainability:** Bug fixes apply to all hooks automatically
- **Scalability:** Add new entities trivially
- **Testability:** Mock adapters instead of Redux + services

---

## Key Decisions Made

1. **Adapter Pattern:** Allows incremental migration without breaking changes
2. **1-indexed pagination:** Standard for UIs, easier for users
3. **Debounce 300ms:** Balances responsiveness and API load
4. **No required caching:** Optional via adapter, not forced
5. **Multi-tenant from start:** All hooks support tenant resolution

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Redux hooks break during refactor | Medium | High | Gradual migration, run both old+new |
| API schema mismatches | Low | High | Adapter layer normalizes differences |
| Cache invalidation bugs | Medium | Medium | Comprehensive test suite + manual API |
| Performance regression | Low | High | Benchmarking before/after |
| Developer confusion during transition | Medium | Low | Migration guide + examples |

---

## Success Metrics

1. **Code Quality:** 30-40% reduction in Tier 2 hook lines
2. **Test Coverage:** >80% on adapters and hooks
3. **Type Safety:** Zero `any` types in new code
4. **Performance:** <5% API response time regression
5. **Documentation:** 100% of hooks documented with examples
6. **Adoption:** All frontends migrated by end of Phase 5

---

## Immediate Next Steps

1. ✅ **[DONE]** Analyze existing Tier 2 hooks across codebase
2. ✅ **[DONE]** Document patterns and fragmentation
3. ✅ **[DONE]** Design unified adapter pattern
4. **[TODO]** Present findings to architecture review board
5. **[TODO]** Get approval on adapter design
6. **[TODO]** Create Phase 5 RFC document
7. **[TODO]** Begin Phase 5a: Foundation work

---

## Appendix: Hook Inventory by Entity

### Project Hooks
- `useProject()` (workflowui + Redux) - CRUD + current selection
- Consolidates to: `useEntity<Project>('project', reduxAdapter)`

### Workspace Hooks
- `useWorkspace()` (workflowui + Redux) - CRUD + current selection
- Consolidates to: `useEntity<Workspace>('workspace', reduxAdapter)`

### Workflow Hooks
- `useWorkflow()` (workflowui + Redux) - Load, operations, auto-save
- `useWorkflow()` (frontends/nextjs) - Execute with retry + polling
- Consolidates to: `useEntity<Workflow>('workflow', adapter)`

### Execution Hooks
- `useExecution()` (workflowui + Redux) - Execute, stop, history, stats
- Consolidates to: `useEntity<ExecutionResult>('execution', adapter)`

### User Hooks
- `useUsers()` (frontends/nextjs) - List with pagination + search + filter
- `useUserForm()` (frontends/nextjs) - Form management
- `useUserActions()` (frontends/nextjs) - CRUD wrapper
- Consolidate to: `useEntity<User>('user', apiAdapter)` + `useUserForm()`

### Package Hooks
- `usePackages()` (frontends/nextjs) - List with pagination + search
- `usePackageDetails()` (frontends/nextjs) - Single + related
- `usePackageActions()` (frontends/nextjs) - CRUD wrapper
- Consolidate to: `useEntity<Package>('package', apiAdapter)` + `usePackageDetails()`

---

## Additional Resources

- Full analysis: `/Users/rmac/Documents/metabuilder/docs/TIER2_HOOKS_ANALYSIS.md`
- Redux infrastructure docs: `redux/slices/` directory
- Service layer docs: `workflowui/src/services/` directory
- Frontend-specific patterns: `frontends/nextjs/src/hooks/` directory

