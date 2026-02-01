# Redux Core Integration Guide

**Last Updated**: 2026-01-23
**Version**: 1.0.0
**Audience**: Frontend developers integrating `@metabuilder/redux-core`

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Core Slices Reference](#core-slices-reference)
4. [Store Configuration](#store-configuration)
5. [Using Hooks](#using-hooks)
6. [Frontend Integration Examples](#frontend-integration-examples)
7. [Common Patterns](#common-patterns)
8. [Async Data Management](#async-data-management)
9. [Debugging & DevTools](#debugging--devtools)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Related Documentation](#related-documentation)

---

## Overview

`@metabuilder/redux-core` is the centralized Redux store package containing state slices shared across all MetaBuilder frontends (Next.js, Qt6, CLI).

### Key Benefits

- **Unified State**: Same authentication, projects, and workflows state across all frontends
- **Zero Configuration**: Pre-configured reducers, middleware, and hooks
- **Type Safety**: Full TypeScript support with proper types
- **Performance**: Built-in request deduplication and cleanup
- **DevTools Ready**: Redux DevTools integration for easy debugging

### Architecture

```
@metabuilder/redux-core
├── slices/          # auth, project, workspace, workflow, nodes, asyncData
├── types/           # TypeScript interfaces
├── store/           # Hooks and store utilities
└── middleware/      # DevTools, monitoring
```

---

## Installation & Setup

### Step 1: Install Package

The package is already in the workspace. Just install dependencies:

```bash
npm install @metabuilder/redux-core
```

### Step 2: Create Store

Create `src/store/index.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

// Import frontend-specific slices (example)
import { canvasSlice, editorSlice } from './slices'

export const store = configureStore({
  reducer: {
    ...coreReducers,  // Includes: auth, project, workspace, workflow, nodes, asyncData
    canvas: canvasSlice.reducer,
    editor: editorSlice.reducer,
    // Add more frontend-specific slices as needed
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Step 3: Wrap App with Provider

In your main entry point (`pages/_app.tsx` for Next.js or `App.tsx` for other frontends):

```typescript
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

### Step 4: Use Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'

export function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  // Ready to use!
}
```

---

## Core Slices Reference

### authSlice

Handles authentication and user session state.

**State Structure**:
```typescript
{
  auth: {
    authenticated: boolean
    user: User | null
    loading: boolean
    error: string | null
  }
}
```

**Key Actions**:
```typescript
// Dispatch actions
dispatch(setAuthenticated(true))
dispatch(setUser(userData))
dispatch(logout())
dispatch(setLoading(true))
dispatch(setError('Auth failed'))
dispatch(clearError())
dispatch(restoreFromStorage())  // Restore from localStorage
```

**Selectors**:
```typescript
const user = useAppSelector(state => state.auth.user)
const isAuthenticated = useAppSelector(state => state.auth.authenticated)
const loading = useAppSelector(state => state.auth.loading)
```

**Example - Login Flow**:
```typescript
async function handleLogin(email: string, password: string) {
  dispatch(setLoading(true))
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    const userData = await response.json()
    dispatch(setUser(userData))
    dispatch(setAuthenticated(true))
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}
```

---

### projectSlice

Manages projects and current project selection.

**State Structure**:
```typescript
{
  project: {
    projects: Project[]
    currentProjectId: string | null
    loading: boolean
    error: string | null
  }
}
```

**Key Actions**:
```typescript
dispatch(setProjects(projectList))
dispatch(addProject(newProject))
dispatch(updateProject(updatedProject))
dispatch(removeProject(projectId))
dispatch(setCurrentProject(projectId))
dispatch(clearProject())
```

**Selectors**:
```typescript
const projects = useAppSelector(state => state.project.projects)
const currentProjectId = useAppSelector(state => state.project.currentProjectId)
const currentProject = useAppSelector(state => 
  state.project.projects.find(p => p.id === state.project.currentProjectId)
)
```

**Example - Project Switching**:
```typescript
function ProjectSelector() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.project.projects)
  const currentProjectId = useAppSelector(state => state.project.currentProjectId)
  
  const handleSelectProject = (projectId: string) => {
    dispatch(setCurrentProject(projectId))
  }
  
  return (
    <select value={currentProjectId || ''} onChange={(e) => handleSelectProject(e.target.value)}>
      {projects.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )
}
```

---

### workspaceSlice

Manages workspaces and workspace context.

**State Structure**:
```typescript
{
  workspace: {
    workspaces: Workspace[]
    currentWorkspaceId: string | null
    loading: boolean
    error: string | null
  }
}
```

**Key Actions**:
```typescript
dispatch(setWorkspaces(workspaceList))
dispatch(addWorkspace(newWorkspace))
dispatch(updateWorkspace(updatedWorkspace))
dispatch(removeWorkspace(workspaceId))
dispatch(setCurrentWorkspace(workspaceId))
dispatch(clearWorkspaces())
```

**Selectors**:
```typescript
const workspaces = useAppSelector(state => state.workspace.workspaces)
const currentWorkspace = useAppSelector(state => {
  const id = state.workspace.currentWorkspaceId
  return state.workspace.workspaces.find(w => w.id === id)
})
```

---

### workflowSlice

Handles workflow editing and execution state.

**State Structure**:
```typescript
{
  workflow: {
    workflows: Workflow[]
    currentWorkflow: {
      id: string
      nodes: WorkflowNode[]
      connections: Connection[]
      dirty: boolean
      saving: boolean
      executing: boolean
      executionHistory: ExecutionResult[]
    } | null
    loading: boolean
    error: string | null
    saveError: string | null
  }
}
```

**Key Actions**:
```typescript
// Load/create workflows
dispatch(loadWorkflow(workflowId))
dispatch(createWorkflow(workflowData))
dispatch(saveWorkflow(workflowData))

// Node operations
dispatch(addNode(nodeData))
dispatch(updateNode(nodeId, nodeData))
dispatch(deleteNode(nodeId))
dispatch(setNodesAndConnections(nodes, connections))

// Connection operations
dispatch(addConnection(connection))
dispatch(removeConnection(connectionId))
dispatch(updateConnections(connections))

// Execution
dispatch(startExecution())
dispatch(endExecution(result))

// State management
dispatch(setDirty(true))
dispatch(setSaving(true))
dispatch(resetWorkflow())
dispatch(clearExecutionHistory())
```

**Selectors**:
```typescript
const currentWorkflow = useAppSelector(state => state.workflow.currentWorkflow)
const isDirty = useAppSelector(state => state.workflow.currentWorkflow?.dirty)
const isExecuting = useAppSelector(state => state.workflow.currentWorkflow?.executing)
const executionHistory = useAppSelector(state => state.workflow.currentWorkflow?.executionHistory)
```

**Example - Workflow Builder**:
```typescript
function WorkflowCanvas() {
  const dispatch = useAppDispatch()
  const workflow = useAppSelector(state => state.workflow.currentWorkflow)
  const isDirty = useAppSelector(state => state.workflow.currentWorkflow?.dirty)
  
  const handleAddNode = (nodeType: string) => {
    dispatch(addNode({
      id: generateId(),
      type: nodeType,
      position: { x: 0, y: 0 }
    }))
    dispatch(setDirty(true))
  }
  
  const handleSave = async () => {
    dispatch(setSaving(true))
    try {
      await api.saveWorkflow(workflow)
      dispatch(setSaving(false))
      dispatch(setDirty(false))
    } catch (error) {
      dispatch(setSaving(false))
      dispatch(setError(error.message))
    }
  }
  
  return (
    <div>
      {isDirty && <span>Unsaved changes</span>}
      <button onClick={handleSave}>Save</button>
      {workflow?.nodes.map(node => (
        <Node key={node.id} node={node} />
      ))}
    </div>
  )
}
```

---

### nodesSlice

Manages the node registry, templates, and categories for workflow building.

**State Structure**:
```typescript
{
  nodes: {
    registry: NodeType[]
    templates: NodeTemplate[]
    categories: NodeCategory[]
    loading: boolean
    error: string | null
  }
}
```

**Key Actions**:
```typescript
dispatch(setRegistry(nodeTypes))
dispatch(addNodeType(nodeType))
dispatch(removeNodeType(nodeTypeId))
dispatch(setTemplates(templates))
dispatch(addTemplate(template))
dispatch(removeTemplate(templateId))
dispatch(updateTemplate(templateId, template))
dispatch(setCategories(categories))
dispatch(resetNodes())
```

**Selectors**:
```typescript
const registry = useAppSelector(state => state.nodes.registry)
const templates = useAppSelector(state => state.nodes.templates)
const categories = useAppSelector(state => state.nodes.categories)
const nodeType = useAppSelector(state => 
  state.nodes.registry.find(n => n.id === nodeTypeId)
)
```

**Example - Node Palette**:
```typescript
function NodePalette() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(state => state.nodes.categories)
  const registry = useAppSelector(state => state.nodes.registry)
  
  useEffect(() => {
    // Load node registry on mount
    api.getNodeRegistry().then(types => dispatch(setRegistry(types)))
  }, [])
  
  const handleDragNode = (nodeType: string) => {
    // Create new node on canvas
    dispatch(addNode({
      id: generateId(),
      type: nodeType
    }))
  }
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          {registry
            .filter(n => n.category === category.id)
            .map(node => (
              <div
                key={node.id}
                draggable
                onDragStart={() => handleDragNode(node.id)}
              >
                {node.label}
              </div>
            ))
          }
        </div>
      ))}
    </div>
  )
}
```

---

### asyncDataSlice

Manages async request state for fetching and mutating data.

**State Structure**:
```typescript
{
  asyncData: {
    requests: {
      [requestId]: {
        id: string
        status: 'idle' | 'pending' | 'succeeded' | 'failed'
        data: unknown
        error: string | null
        retryCount: number
        lastFetched: number
        requestTime: number
      }
    },
    mutations: {
      [mutationId]: { /* same structure */ }
    },
    globalLoading: boolean
    globalError: string | null
    refetchInterval: number
  }
}
```

**Key Actions**:
```typescript
// Data fetching
dispatch(fetchAsyncData({
  requestId: 'users',
  promise: fetch('/api/users').then(r => r.json())
}))

// Mutations
dispatch(mutateAsyncData({
  requestId: 'createUser',
  promise: fetch('/api/users', { method: 'POST', body })
}))

// Refetch
dispatch(refetchAsyncData('users'))

// Cleanup
dispatch(clearRequest('users'))
dispatch(clearAllRequests())
dispatch(cleanupAsyncRequests())

// State
dispatch(setRequestLoading('users', true))
dispatch(setRequestData('users', data))
dispatch(setRequestError('users', error))
dispatch(resetRequest('users'))
dispatch(setGlobalLoading(true))
dispatch(setRefetchInterval(5000))
```

**Selectors**:
```typescript
const requestState = useAppSelector(state => state.asyncData.requests['users'])
const { data, loading, error } = requestState || {}

// Combined selector
const getUsersState = (state: RootState) => {
  const req = state.asyncData.requests['users']
  return {
    users: req?.data,
    loading: req?.status === 'pending',
    error: req?.error
  }
}

const { users, loading, error } = useAppSelector(getUsersState)
```

**Example - Data Fetching with Auto-Refetch**:
```typescript
function UsersList() {
  const dispatch = useAppDispatch()
  const { data: users, loading, error } = useAppSelector(state => {
    const req = state.asyncData.requests['users']
    return {
      data: req?.data,
      loading: req?.status === 'pending',
      error: req?.error
    }
  })
  
  useEffect(() => {
    // Initial fetch
    dispatch(fetchAsyncData({
      requestId: 'users',
      promise: fetch('/api/users').then(r => r.json())
    }))
    
    // Auto-refetch every 30 seconds
    const interval = setInterval(() => {
      dispatch(refetchAsyncData('users'))
    }, 30000)
    
    return () => {
      clearInterval(interval)
      dispatch(cleanupAsyncRequests())
    }
  }, [])
  
  if (loading && !users) return <Spinner />
  if (error) return <Error message={error} />
  
  return (
    <ul>
      {users?.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

---

## Store Configuration

### Minimal Configuration

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

export const store = configureStore({
  reducer: coreReducers
})
```

### With Frontend-Specific Slices

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'
import { 
  canvasSlice, 
  editorSlice, 
  uiSlice 
} from '@metabuilder/redux-slices'

export const store = configureStore({
  reducer: {
    ...coreReducers,
    canvas: canvasSlice.reducer,
    editor: editorSlice.reducer,
    ui: uiSlice.reducer,
  }
})
```

### With Middleware and DevTools

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

export const store = configureStore({
  reducer: coreReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(/* custom middleware */),
  devTools: process.env.NODE_ENV !== 'production',
})
```

### With Preloaded State (SSR)

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

export function createStore(preloadedState?: any) {
  return configureStore({
    reducer: coreReducers,
    preloadedState,
  })
}

// On server
export async function getServerSideProps() {
  const preloadedState = {
    auth: await fetchCurrentUser(),
    project: await fetchProjects(),
  }
  return { props: { preloadedState } }
}

// In component
export default function Page({ preloadedState }) {
  const store = useMemo(() => createStore(preloadedState), [preloadedState])
  return <Provider store={store}><App /></Provider>
}
```

---

## Using Hooks

### useAppDispatch

Typed dispatch hook for dispatching actions.

```typescript
import { useAppDispatch } from '@metabuilder/redux-core'

export function MyComponent() {
  const dispatch = useAppDispatch()
  
  dispatch(setUser(userData))  // TypeScript knows what actions are available
}
```

### useAppSelector

Typed selector hook for reading state.

```typescript
import { useAppSelector } from '@metabuilder/redux-core'

export function MyComponent() {
  const user = useAppSelector(state => state.auth.user)
  const projects = useAppSelector(state => state.project.projects)
}
```

### Creating Custom Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { setCurrentProject } from '@metabuilder/redux-core'

export function useProject() {
  const dispatch = useAppDispatch()
  const currentProjectId = useAppSelector(state => state.project.currentProjectId)
  const projects = useAppSelector(state => state.project.projects)
  const currentProject = projects.find(p => p.id === currentProjectId)
  
  const switchProject = (projectId: string) => {
    dispatch(setCurrentProject(projectId))
  }
  
  return { currentProject, projects, switchProject }
}

// Usage
function MyComponent() {
  const { currentProject, switchProject } = useProject()
  return (
    <button onClick={() => switchProject('proj-123')}>
      {currentProject?.name}
    </button>
  )
}
```

---

## Frontend Integration Examples

### Next.js Integration

**File: `src/store/index.ts`**
```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'
import { 
  canvasSlice, 
  editorSlice, 
  collaborationSlice 
} from '@metabuilder/redux-slices'

export const store = configureStore({
  reducer: {
    ...coreReducers,
    canvas: canvasSlice.reducer,
    editor: editorSlice.reducer,
    collaboration: collaborationSlice.reducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**File: `src/pages/_app.tsx`**
```typescript
import { Provider } from 'react-redux'
import { store } from '@/store'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}
```

**File: `src/pages/projects.tsx`**
```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { useEffect } from 'react'
import { setProjects } from '@metabuilder/redux-core'

export default function ProjectsPage() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.project.projects)
  const loading = useAppSelector(state => state.project.loading)
  
  useEffect(() => {
    fetch('/api/v1/projects')
      .then(r => r.json())
      .then(data => dispatch(setProjects(data)))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {projects.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  )
}
```

### Qt6 Desktop Integration

**File: `src/store/index.ts`** (same as Next.js)

**File: `src/main.ts`**
```typescript
import { Provider } from 'react-redux'
import { store } from '@/store'
import App from '@/App'

export function Main() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

### CLI Integration

**File: `src/store/index.ts`**
```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

export const store = configureStore({
  reducer: coreReducers  // Only core slices for CLI
})
```

**File: `src/cli/index.ts`**
```typescript
import { store } from '@/store'
import { setUser, setProjects } from '@metabuilder/redux-core'

export async function main() {
  // Fetch and set auth
  const user = await api.getCurrentUser()
  store.dispatch(setUser(user))
  
  // Fetch and set projects
  const projects = await api.listProjects()
  store.dispatch(setProjects(projects))
  
  // Use state
  const state = store.getState()
  console.log(`User: ${state.auth.user?.email}`)
  console.log(`Projects: ${state.project.projects.length}`)
}
```

---

## Common Patterns

### Pattern 1: Fetch + Display + Refetch

```typescript
function DataView() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector(state => {
    const req = state.asyncData.requests['items']
    return {
      data: req?.data,
      loading: req?.status === 'pending',
      error: req?.error
    }
  })
  
  useEffect(() => {
    const fetch = async () => {
      dispatch(fetchAsyncData({
        requestId: 'items',
        promise: api.getItems()
      }))
    }
    
    fetch()
    
    const unsubscribe = store.subscribe(() => {
      const state = store.getState()
      // React to state changes if needed
    })
    
    return unsubscribe
  }, [])
  
  if (loading && !data) return <Spinner />
  if (error) return <Error error={error} />
  
  return <List items={data} />
}
```

### Pattern 2: Form Submission with Optimistic Update

```typescript
function EditForm() {
  const dispatch = useAppDispatch()
  const project = useAppSelector(state => state.project.projects[0])
  
  const handleSubmit = async (formData) => {
    // Optimistic update
    dispatch(updateProject({ ...project, ...formData }))
    
    // Send to server
    try {
      const result = await api.updateProject(project.id, formData)
      dispatch(updateProject(result))
    } catch (error) {
      // Rollback
      dispatch(updateProject(project))
      dispatch(setError(error.message))
    }
  }
  
  return <Form onSubmit={handleSubmit} />
}
```

### Pattern 3: Authentication Guard

```typescript
function ProtectedRoute({ children }) {
  const user = useAppSelector(state => state.auth.user)
  const authenticated = useAppSelector(state => state.auth.authenticated)
  
  if (!authenticated || !user) {
    return <Navigate to="/login" />
  }
  
  return children
}
```

### Pattern 4: Multi-Step Workflow

```typescript
function WorkflowForm() {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(1)
  const workflow = useAppSelector(state => state.workflow.currentWorkflow)
  
  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1, save
      dispatch(setNodesAndConnections(nodes, connections))
    }
    setStep(step + 1)
  }
  
  return (
    <div>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      <button onClick={handleNext}>Next</button>
    </div>
  )
}
```

---

## Async Data Management

### Request Lifecycle

```typescript
// 1. Initiate request
dispatch(fetchAsyncData({
  requestId: 'users',
  promise: api.getUsers()
}))
// State: { status: 'pending', data: null, error: null }

// 2. Success
// State: { status: 'succeeded', data: [...], error: null, lastFetched: timestamp }

// 3. Error
// State: { status: 'failed', data: null, error: 'Network error', retryCount: 1 }

// 4. Refetch
dispatch(refetchAsyncData('users'))
// State: { status: 'pending', data: [...], error: null } (keeps previous data)

// 5. Cleanup
dispatch(clearRequest('users'))
// State: request removed from requests map
```

### Request Deduplication

```typescript
// Both requests with same ID are deduplicated
dispatch(fetchAsyncData({
  requestId: 'users',
  promise: api.getUsers()
}))

dispatch(fetchAsyncData({
  requestId: 'users',
  promise: api.getUsers()  // Won't be called, will return same promise
}))
```

### Auto Cleanup

```typescript
// Requests older than 5 minutes are auto-cleaned up
// Or manually cleanup
dispatch(cleanupAsyncRequests())

// Or cleanup specific request
dispatch(clearRequest('users'))
```

---

## Debugging & DevTools

### Enable Redux DevTools

```typescript
const store = configureStore({
  reducer: coreReducers,
  devTools: {
    trace: true,
    traceLimit: 25,
  }
})
```

### Check State in Console

```typescript
// In browser console
store.getState()

// In specific selector
store.getState().auth.user
store.getState().project.projects
store.getState().asyncData.requests
```

### Time-Travel Debugging

1. Open Redux DevTools extension
2. Inspect actions in the timeline
3. Click on actions to jump to that state
4. Compare state before/after each action

### Log State Changes

```typescript
store.subscribe(() => {
  console.log('State changed:', store.getState())
})
```

---

## Troubleshooting

### Issue: State Not Updating

**Problem**: Component doesn't re-render when Redux state changes

**Solution**:
```typescript
// Wrong - creating new object reference
const user = { ...state.auth.user, name: 'New Name' }
dispatch(setUser(user))

// Right - Redux Toolkit handles immutability
dispatch(setUser({ ...state.auth.user, name: 'New Name' }))

// Or use createAsyncThunk with proper action handling
```

### Issue: Async Data Stuck in Pending

**Problem**: Async request never completes

**Solution**:
```typescript
// Make sure promise resolves/rejects
dispatch(fetchAsyncData({
  requestId: 'items',
  promise: fetch('/api/items')
    .then(r => r.json())
    .catch(e => { throw new Error(e.message) })  // Ensure rejection
}))
```

### Issue: Memory Leak from Async Data

**Problem**: Old requests pile up in Redux state

**Solution**:
```typescript
useEffect(() => {
  dispatch(fetchAsyncData({ requestId: 'items', promise }))
  
  return () => {
    // Cleanup on unmount
    dispatch(clearRequest('items'))
  }
}, [])

// Or globally cleanup old requests
dispatch(cleanupAsyncRequests())
```

### Issue: Type Errors in Selectors

**Problem**: TypeScript doesn't know selector return type

**Solution**:
```typescript
// Define selector with types
const selectUserState = (state: RootState) => state.auth.user
const user = useAppSelector(selectUserState)  // TypeScript knows type

// Or inline with types
const user: User | null = useAppSelector(state => state.auth.user)
```

---

## Best Practices

### 1. Use Typed Hooks

```typescript
// Always use typed hooks from redux-core
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'

// Not: useDispatch, useSelector from react-redux
```

### 2. Create Custom Hooks for Complex Selectors

```typescript
// Instead of repeating selectors
export function useCurrentProject() {
  return useAppSelector(state => {
    const id = state.project.currentProjectId
    return state.project.projects.find(p => p.id === id)
  })
}

// Usage
const project = useCurrentProject()
```

### 3. Normalize Async Requests

```typescript
// Good: separate requestId for each data type
dispatch(fetchAsyncData({ requestId: 'users', promise }))
dispatch(fetchAsyncData({ requestId: 'projects', promise }))

// Bad: generic 'data' request
dispatch(fetchAsyncData({ requestId: 'data', promise }))
```

### 4. Clean Up on Unmount

```typescript
useEffect(() => {
  dispatch(fetchAsyncData({ requestId: 'items', promise }))
  
  return () => dispatch(clearRequest('items'))
}, [])
```

### 5. Use Optimistic Updates Carefully

```typescript
// Only for mutations you're confident will succeed
dispatch(optimisticUpdate(data))

try {
  await api.save(data)
} catch {
  // Rollback
  dispatch(restoreOriginal(data))
}
```

### 6. Separate Concerns

```typescript
// Core state from redux-core (shared)
const user = useAppSelector(state => state.auth.user)

// Frontend-specific state from own slices
const canvas = useAppSelector(state => state.canvas)
```

### 7. Monitor Performance

```typescript
// Use Redux DevTools profiler to find expensive re-renders
// Check selector memoization
// Use useCallback for dispatch functions

const handleSelect = useCallback((id: string) => {
  dispatch(setCurrentProject(id))
}, [dispatch])
```

---

## Related Documentation

- **Redux Core Package**: `/redux/core/README.md`
- **Pattern Reference**: `/.claude/REDUX_CORE_PATTERNS.md`
- **Redux Slices**: `@metabuilder/redux-slices` (frontend-specific)
- **DevTools Setup**: `/redux/core/src/middleware/`
- **Type Definitions**: `/redux/core/src/types/`

---

**Last Updated**: 2026-01-23
**Maintained by**: MetaBuilder Dev Team
