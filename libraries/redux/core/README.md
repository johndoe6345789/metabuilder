# @metabuilder/redux-core

Core Redux state management package for MetaBuilder - shared state across all frontends (Next.js, Qt6, CLI).

## Overview

Provides centralized Redux slices for:
- **Authentication** (`authSlice`) - User session management
- **Projects** (`projectSlice`) - Project CRUD & selection
- **Workspaces** (`workspaceSlice`) - Workspace management
- **Workflows** (`workflowSlice`) - Workflow editing and execution
- **Nodes** (`nodesSlice`) - Node registry and templates
- **Async Data** (`asyncDataSlice`) - Data fetching and mutation state

## Quick Start

### Installation

```bash
npm install @metabuilder/redux-core
```

### Basic Setup

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### With Middleware & DevTools

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers, getMiddlewareConfig, getDevToolsConfig } from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers,
  middleware: getMiddlewareConfig(),
  devTools: getDevToolsConfig(),
})
```

### Using in Components

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { setUser } from '@metabuilder/redux-core'

export function UserProfile() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  
  useEffect(() => {
    dispatch(setUser(userData))
  }, [])
  
  return <div>{user?.email}</div>
}
```

## Core Slices

### authSlice

Authentication and user session state.

**Actions:**
- `setAuthenticated(boolean)`
- `setUser(user)`
- `logout()`
- `setLoading(boolean)`
- `setError(error)`
- `clearError()`
- `restoreFromStorage()`

**Selectors:**
```typescript
const user = useAppSelector(state => state.auth.user)
const authenticated = useAppSelector(state => state.auth.authenticated)
```

### projectSlice

Project management and current project selection.

**Actions:**
- `setProjects(projects[])`
- `addProject(project)`
- `updateProject(project)`
- `removeProject(id)`
- `setCurrentProject(id)`
- `clearProject()`

**Selectors:**
```typescript
const projects = useAppSelector(state => state.project.projects)
const currentProjectId = useAppSelector(state => state.project.currentProjectId)
```

### workspaceSlice

Workspace management and context.

**Actions:**
- `setWorkspaces(workspaces[])`
- `addWorkspace(workspace)`
- `updateWorkspace(workspace)`
- `removeWorkspace(id)`
- `setCurrentWorkspace(id)`
- `clearWorkspaces()`

### workflowSlice

Workflow editing, execution, and node/connection management.

**Actions:**
- `loadWorkflow(id)`
- `createWorkflow(workflow)`
- `saveWorkflow(workflow)`
- `addNode(node)`
- `updateNode(id, node)`
- `deleteNode(id)`
- `addConnection(connection)`
- `removeConnection(id)`
- `startExecution()`
- `endExecution(result)`
- `setDirty(boolean)`
- `setSaving(boolean)`

### nodesSlice

Node registry, templates, and categories.

**Actions:**
- `setRegistry(nodeTypes[])`
- `addNodeType(type)`
- `removeNodeType(id)`
- `setTemplates(templates[])`
- `addTemplate(template)`
- `removeTemplate(id)`
- `setCategories(categories[])`

### asyncDataSlice

Async request state for data fetching and mutations.

**Actions:**
- `fetchAsyncData({ requestId, promise })`
- `mutateAsyncData({ requestId, promise })`
- `refetchAsyncData(requestId)`
- `clearRequest(requestId)`
- `clearAllRequests()`
- `cleanupAsyncRequests()`

**Selector:**
```typescript
const { data, loading, error } = useAppSelector(state => {
  const req = state.asyncData.requests['userId']
  return {
    data: req?.data,
    loading: req?.status === 'pending',
    error: req?.error
  }
})
```

## Middleware

### Built-in Middleware

The package includes optional middleware for development:

- **Logging**: Action dispatch and state change logging
- **Performance**: Action execution time and state size monitoring
- **Error Handling**: Catches and logs errors during action dispatch
- **Analytics**: Tracks important actions

### Enable Middleware

```typescript
import { getMiddlewareConfig } from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers,
  middleware: getMiddlewareConfig({
    enableLogging: true,
    enablePerformance: true,
    enableAnalytics: true,
  })
})
```

### Custom Middleware

```typescript
import { 
  createLoggingMiddleware, 
  createPerformanceMiddleware 
} from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(createLoggingMiddleware({ verbose: true }))
      .concat(createPerformanceMiddleware())
})
```

## DevTools Integration

Redux DevTools are automatically configured:

```typescript
import { getDevToolsConfig } from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers,
  devTools: getDevToolsConfig(),  // Automatic configuration
})
```

### Using Redux DevTools

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools-extension)
2. Open DevTools in your browser
3. Inspect actions and state changes
4. Use time-travel debugging to replay states

## Integration Examples

### Next.js

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers, getMiddlewareConfig, getDevToolsConfig } from '@metabuilder/redux-core'
import { canvasSlice, editorSlice } from '@metabuilder/redux-slices'

export const store = configureStore({
  reducer: {
    ...coreReducers,
    canvas: canvasSlice.reducer,
    editor: editorSlice.reducer,
  },
  middleware: getMiddlewareConfig(),
  devTools: getDevToolsConfig(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Qt6 Desktop

```typescript
// Similar setup, may use different slices
const store = configureStore({
  reducer: {
    ...coreReducers,
    // Qt6-specific slices
  }
})
```

### CLI

```typescript
// Minimal setup for CLI
const store = configureStore({
  reducer: coreReducers
})
```

## API Reference

### Hooks

#### `useAppDispatch()`

Typed dispatch hook.

```typescript
const dispatch = useAppDispatch()
dispatch(setUser(userData))  // TypeScript knows available actions
```

#### `useAppSelector(selector)`

Typed selector hook.

```typescript
const user = useAppSelector(state => state.auth.user)
```

### Utility Functions

#### `createAppStore(reducers, preloadedState?)`

Create a typed store with provided reducers.

```typescript
const store = createAppStore(
  { auth: authSlice.reducer },
  { auth: { user: null } }
)
```

#### `getMiddlewareConfig(options?)`

Get middleware configuration for Redux store.

```typescript
const middleware = getMiddlewareConfig({
  enableLogging: true,
  enablePerformance: true,
  enableAnalytics: true,
})
```

#### `getDevToolsConfig()`

Get Redux DevTools configuration.

```typescript
const devTools = getDevToolsConfig()  // false in production
```

## Common Patterns

### Fetch Data

```typescript
import { fetchAsyncData } from '@metabuilder/redux-core'

useEffect(() => {
  dispatch(fetchAsyncData({
    requestId: 'users',
    promise: fetch('/api/users').then(r => r.json())
  }))
}, [])
```

### Handle Auth Flow

```typescript
import { setUser, setAuthenticated } from '@metabuilder/redux-core'

const handleLogin = async (email, password) => {
  const user = await api.login(email, password)
  dispatch(setUser(user))
  dispatch(setAuthenticated(true))
}
```

### Optimize Re-renders

```typescript
const selectCurrentProject = (state: RootState) => {
  const id = state.project.currentProjectId
  return state.project.projects.find(p => p.id === id)
}

// Only re-renders if currentProject actually changes
const project = useAppSelector(selectCurrentProject)
```

## Performance Tips

1. **Memoize Selectors**: Create selector functions outside components
2. **Normalize State**: Keep async requests by requestId
3. **Clean Up**: Remove old async requests with `cleanupAsyncRequests()`
4. **Use DevTools**: Monitor performance with Redux DevTools
5. **Separate Concerns**: Keep core state separate from frontend-specific state

## Documentation

- **Integration Guide**: [`docs/guides/REDUX_CORE_INTEGRATION_GUIDE.md`](../../docs/guides/REDUX_CORE_INTEGRATION_GUIDE.md)
- **Pattern Reference**: [`/.claude/REDUX_CORE_PATTERNS.md`](../../.claude/REDUX_CORE_PATTERNS.md)
- **Main Docs**: [`docs/CLAUDE.md`](../../docs/CLAUDE.md#redux-core-package-metabuilderredux-core)

## Development

### Build

```bash
npm run build --workspace=@metabuilder/redux-core
```

### Type Check

```bash
npm run typecheck --workspace=@metabuilder/redux-core
```

### Test

```bash
npm run test --workspace=@metabuilder/redux-core
```

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Last Updated**: 2026-01-23
**Status**: Production Ready
**Version**: 1.0.0
