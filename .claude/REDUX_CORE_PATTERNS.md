# Redux Core Patterns - Quick Reference

**Last Updated**: 2026-01-23
**Purpose**: Common Redux patterns and code snippets for MetaBuilder development

---

## Table of Contents

1. [Dispatch & Selector Patterns](#dispatch--selector-patterns)
2. [Authentication Patterns](#authentication-patterns)
3. [Project & Workspace Patterns](#project--workspace-patterns)
4. [Workflow Execution Patterns](#workflow-execution-patterns)
5. [Async Data Patterns](#async-data-patterns)
6. [Node Registry Patterns](#node-registry-patterns)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Performance Patterns](#performance-patterns)
9. [DevTools & Debugging](#devtools--debugging)

---

## Dispatch & Selector Patterns

### Pattern: Basic Dispatch & Select

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { setUser } from '@metabuilder/redux-core'

function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  
  const handleClick = () => {
    dispatch(setUser({ id: '123', email: 'user@example.com' }))
  }
  
  return <button onClick={handleClick}>Update User: {user?.email}</button>
}
```

### Pattern: Multiple Selectors

```typescript
function Dashboard() {
  const user = useAppSelector(state => state.auth.user)
  const projects = useAppSelector(state => state.project.projects)
  const workflows = useAppSelector(state => state.workflow.workflows)
  
  return (
    <div>
      <h1>{user?.name}'s Dashboard</h1>
      <p>Projects: {projects.length}</p>
      <p>Workflows: {workflows.length}</p>
    </div>
  )
}
```

### Pattern: Combined Selector Function

```typescript
// Define once
const selectDashboardData = (state: RootState) => ({
  user: state.auth.user,
  projects: state.project.projects,
  currentProject: state.project.projects.find(
    p => p.id === state.project.currentProjectId
  ),
})

// Use multiple times
function Dashboard() {
  const { user, projects, currentProject } = useAppSelector(selectDashboardData)
  return <div>{currentProject?.name}</div>
}
```

### Pattern: Conditional Selector

```typescript
function ProjectDetails({ projectId }: { projectId: string }) {
  const project = useAppSelector(state =>
    state.project.projects.find(p => p.id === projectId)
  )
  
  if (!project) return <div>Project not found</div>
  return <div>{project.name}</div>
}
```

---

## Authentication Patterns

### Pattern: Login & Persist

```typescript
import { setUser, setAuthenticated, restoreFromStorage } from '@metabuilder/redux-core'

export function useLogin() {
  const dispatch = useAppDispatch()
  
  return async (email: string, password: string) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) throw new Error('Login failed')
      
      const userData = await response.json()
      
      // Set Redux state
      dispatch(setUser(userData))
      dispatch(setAuthenticated(true))
      
      // Persist to localStorage (for auto-restore)
      localStorage.setItem('auth', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      dispatch(setError(error.message))
      throw error
    }
  }
}
```

### Pattern: Logout & Cleanup

```typescript
import { logout, clearProject, clearWorkspaces } from '@metabuilder/redux-core'

export function useLogout() {
  const dispatch = useAppDispatch()
  
  return async () => {
    try {
      // Call logout API
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } finally {
      // Clear Redux state
      dispatch(logout())
      dispatch(clearProject())
      dispatch(clearWorkspaces())
      
      // Clear storage
      localStorage.removeItem('auth')
      
      // Navigate to login
      window.location.href = '/login'
    }
  }
}
```

### Pattern: Restore Session on App Load

```typescript
export function useRestoreAuth() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const restore = async () => {
      try {
        // Try to restore from localStorage first
        dispatch(restoreFromStorage())
        
        // Verify with backend
        const response = await fetch('/api/v1/auth/me')
        if (response.ok) {
          const userData = await response.json()
          dispatch(setUser(userData))
          dispatch(setAuthenticated(true))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        console.error('Failed to restore auth:', error)
        dispatch(logout())
      } finally {
        setLoading(false)
      }
    }
    
    restore()
  }, [])
  
  return loading
}

// In App component
export default function App() {
  const authLoading = useRestoreAuth()
  
  if (authLoading) return <SplashScreen />
  
  return <Routes />
}
```

### Pattern: Protected Route

```typescript
import { useAppSelector } from '@metabuilder/redux-core'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authenticated = useAppSelector(state => state.auth.authenticated)
  const loading = useAppSelector(state => state.auth.loading)
  
  if (loading) return <Spinner />
  if (!authenticated) return <Navigate to="/login" />
  
  return children
}

// Usage
<Routes>
  <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
</Routes>
```

---

## Project & Workspace Patterns

### Pattern: Load & Switch Projects

```typescript
import { setProjects, setCurrentProject } from '@metabuilder/redux-core'

export function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.project.projects)
  const currentProjectId = useAppSelector(state => state.project.currentProjectId)
  
  useEffect(() => {
    // Load projects on mount
    fetch('/api/v1/projects')
      .then(r => r.json())
      .then(data => dispatch(setProjects(data)))
  }, [])
  
  const switchProject = useCallback((id: string) => {
    dispatch(setCurrentProject(id))
    // Could also load project-specific data here
  }, [dispatch])
  
  return { projects, currentProjectId, switchProject }
}
```

### Pattern: Create Project

```typescript
import { addProject } from '@metabuilder/redux-core'

export function useCreateProject() {
  const dispatch = useAppDispatch()
  
  return async (name: string, description: string) => {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      
      const project = await response.json()
      dispatch(addProject(project))
      return project
    } catch (error) {
      dispatch(setProjectError(error.message))
      throw error
    }
  }
}
```

### Pattern: Workspace Hierarchy

```typescript
import { setWorkspaces, setCurrentWorkspace } from '@metabuilder/redux-core'

export function useWorkspace() {
  const dispatch = useAppDispatch()
  const workspaces = useAppSelector(state => state.workspace.workspaces)
  const currentWorkspaceId = useAppSelector(state => state.workspace.currentWorkspaceId)
  const currentWorkspace = useAppSelector(state => {
    const id = state.workspace.currentWorkspaceId
    return state.workspace.workspaces.find(w => w.id === id)
  })
  
  useEffect(() => {
    // Load workspaces
    fetch('/api/v1/workspaces')
      .then(r => r.json())
      .then(data => {
        dispatch(setWorkspaces(data))
        // Auto-select first workspace
        if (data.length > 0) {
          dispatch(setCurrentWorkspace(data[0].id))
        }
      })
  }, [])
  
  return { workspaces, currentWorkspace, switchWorkspace: setCurrentWorkspace }
}
```

---

## Workflow Execution Patterns

### Pattern: Load Workflow for Editing

```typescript
import { loadWorkflow, setSaving, setDirty } from '@metabuilder/redux-core'

export function useWorkflowEditor(workflowId: string) {
  const dispatch = useAppDispatch()
  const workflow = useAppSelector(state => state.workflow.currentWorkflow)
  const isDirty = useAppSelector(state => state.workflow.currentWorkflow?.dirty)
  const isSaving = useAppSelector(state => state.workflow.currentWorkflow?.saving)
  
  useEffect(() => {
    // Load workflow
    dispatch(loadWorkflow(workflowId))
  }, [workflowId])
  
  const save = async () => {
    dispatch(setSaving(true))
    try {
      await fetch(`/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        body: JSON.stringify(workflow)
      })
      dispatch(setDirty(false))
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      dispatch(setSaving(false))
    }
  }
  
  return { workflow, isDirty, isSaving, save }
}
```

### Pattern: Add Node to Workflow

```typescript
import { addNode, setDirty } from '@metabuilder/redux-core'

export function useAddNode() {
  const dispatch = useAppDispatch()
  
  return (nodeType: string, position: { x: number; y: number }) => {
    dispatch(addNode({
      id: generateId(),
      type: nodeType,
      position,
      config: {}
    }))
    dispatch(setDirty(true))
  }
}
```

### Pattern: Execute Workflow

```typescript
import { startExecution, endExecution } from '@metabuilder/redux-core'

export function useExecuteWorkflow() {
  const dispatch = useAppDispatch()
  const workflow = useAppSelector(state => state.workflow.currentWorkflow)
  
  return async () => {
    dispatch(startExecution())
    
    try {
      const response = await fetch('/api/v1/workflows/execute', {
        method: 'POST',
        body: JSON.stringify(workflow)
      })
      
      const result = await response.json()
      dispatch(endExecution(result))
      return result
    } catch (error) {
      dispatch(endExecution({ error: error.message }))
      throw error
    }
  }
}
```

### Pattern: Monitor Execution

```typescript
export function WorkflowExecutionMonitor() {
  const isExecuting = useAppSelector(
    state => state.workflow.currentWorkflow?.executing
  )
  const history = useAppSelector(
    state => state.workflow.currentWorkflow?.executionHistory || []
  )
  
  const lastExecution = history[history.length - 1]
  
  return (
    <div>
      {isExecuting && <Spinner />}
      {lastExecution && (
        <div>
          Status: {lastExecution.status}
          <pre>{JSON.stringify(lastExecution, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

---

## Async Data Patterns

### Pattern: Fetch Data

```typescript
import { fetchAsyncData } from '@metabuilder/redux-core'

export function useAsyncData(url: string, requestId: string) {
  const dispatch = useAppDispatch()
  
  const { data, loading, error } = useAppSelector(state => {
    const req = state.asyncData.requests[requestId]
    return {
      data: req?.data,
      loading: req?.status === 'pending',
      error: req?.error
    }
  })
  
  useEffect(() => {
    dispatch(fetchAsyncData({
      requestId,
      promise: fetch(url).then(r => r.json())
    }))
  }, [url, requestId])
  
  return { data, loading, error }
}

// Usage
function UsersList() {
  const { data: users, loading, error } = useAsyncData('/api/users', 'users')
  
  if (loading) return <Spinner />
  if (error) return <Error error={error} />
  return <List items={users} />
}
```

### Pattern: Mutate Data

```typescript
import { mutateAsyncData, fetchAsyncData } from '@metabuilder/redux-core'

export function useCreateUser() {
  const dispatch = useAppDispatch()
  
  return async (userData) => {
    dispatch(mutateAsyncData({
      requestId: 'createUser',
      promise: fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      }).then(r => r.json())
    }))
    
    // Refetch list after mutation
    await new Promise(resolve => {
      const unsub = store.subscribe(() => {
        const state = store.getState()
        if (state.asyncData.mutations.createUser?.status !== 'pending') {
          unsub()
          resolve(null)
        }
      })
    })
    
    dispatch(fetchAsyncData({
      requestId: 'users',
      promise: fetch('/api/users').then(r => r.json())
    }))
  }
}
```

### Pattern: Auto-Refetch

```typescript
export function useAutoRefetch(requestId: string, interval: number = 30000) {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(refetchAsyncData(requestId))
    }, interval)
    
    return () => clearInterval(timer)
  }, [requestId, interval])
}

// Usage
function LiveData() {
  const { data } = useAsyncData('/api/live-data', 'liveData')
  useAutoRefetch('liveData', 5000)  // Refetch every 5 seconds
  
  return <div>{data}</div>
}
```

### Pattern: Pagination

```typescript
export function usePaginatedData(url: string, pageSize: number = 20) {
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()
  
  const requestId = `${url}:page:${page}`
  
  const { data, loading, error } = useAppSelector(state => {
    const req = state.asyncData.requests[requestId]
    return {
      data: req?.data,
      loading: req?.status === 'pending',
      error: req?.error
    }
  })
  
  useEffect(() => {
    const fetchUrl = `${url}?page=${page}&limit=${pageSize}`
    dispatch(fetchAsyncData({
      requestId,
      promise: fetch(fetchUrl).then(r => r.json())
    }))
  }, [page, pageSize, url])
  
  return {
    data,
    loading,
    error,
    page,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1))
  }
}
```

---

## Node Registry Patterns

### Pattern: Load Node Registry

```typescript
import { setRegistry, setTemplates, setCategories } from '@metabuilder/redux-core'

export function useNodeRegistry() {
  const dispatch = useAppDispatch()
  const registry = useAppSelector(state => state.nodes.registry)
  const templates = useAppSelector(state => state.nodes.templates)
  
  useEffect(() => {
    Promise.all([
      fetch('/api/nodes/registry').then(r => r.json()),
      fetch('/api/nodes/templates').then(r => r.json()),
      fetch('/api/nodes/categories').then(r => r.json())
    ]).then(([nodeTypes, nodeTemplates, nodeCategories]) => {
      dispatch(setRegistry(nodeTypes))
      dispatch(setTemplates(nodeTemplates))
      dispatch(setCategories(nodeCategories))
    })
  }, [])
  
  return { registry, templates }
}
```

### Pattern: Create Node Template

```typescript
import { addTemplate } from '@metabuilder/redux-core'

export function useCreateTemplate() {
  const dispatch = useAppDispatch()
  
  return async (template: NodeTemplate) => {
    const response = await fetch('/api/nodes/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    })
    
    const created = await response.json()
    dispatch(addTemplate(created))
    return created
  }
}
```

---

## Error Handling Patterns

### Pattern: Global Error Handler

```typescript
import { useAppSelector } from '@metabuilder/redux-core'

export function ErrorBoundary({ children }) {
  const authError = useAppSelector(state => state.auth.error)
  const projectError = useAppSelector(state => state.project.error)
  const workflowError = useAppSelector(state => state.workflow.error)
  
  const error = authError || projectError || workflowError
  
  if (error) {
    return (
      <div className="error-banner">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }
  
  return children
}
```

### Pattern: Request Error Retry

```typescript
export function useRetryableAsyncData(url: string, requestId: string) {
  const dispatch = useAppDispatch()
  const state = useAppSelector(st => st.asyncData.requests[requestId])
  
  useEffect(() => {
    if (state?.status === 'failed' && state.retryCount < 3) {
      // Auto-retry with exponential backoff
      const delay = Math.pow(2, state.retryCount) * 1000
      const timeout = setTimeout(() => {
        dispatch(fetchAsyncData({
          requestId,
          promise: fetch(url).then(r => r.json())
        }))
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [state?.status, state?.retryCount])
  
  return {
    data: state?.data,
    error: state?.error,
    retrying: state?.status === 'pending' && state?.retryCount > 0
  }
}
```

### Pattern: Error Toast Notifications

```typescript
export function useErrorNotifications() {
  const authError = useAppSelector(state => state.auth.error)
  const projectError = useAppSelector(state => state.project.error)
  
  useEffect(() => {
    if (authError) showErrorToast(authError)
  }, [authError])
  
  useEffect(() => {
    if (projectError) showErrorToast(projectError)
  }, [projectError])
}

function showErrorToast(message: string) {
  // Use your toast library
  toast.error(message, { duration: 5000 })
}
```

---

## Performance Patterns

### Pattern: Memoized Selectors

```typescript
import { useMemo } from 'react'

export function UserCard() {
  const users = useAppSelector(state => state.asyncData.requests['users']?.data)
  
  // Memoize expensive computation
  const sortedUsers = useMemo(() => {
    return users?.sort((a, b) => a.name.localeCompare(b.name)) || []
  }, [users])
  
  return <div>{sortedUsers.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

### Pattern: Reselect-Style Selectors

```typescript
// Define selectors at module level
const selectAuthState = (state: RootState) => state.auth
const selectProjectState = (state: RootState) => state.project

const selectCurrentProject = (state: RootState) => {
  const id = state.project.currentProjectId
  return state.project.projects.find(p => p.id === id)
}

// Use in component (only re-renders if currentProject actually changes)
export function ProjectHeader() {
  const project = useAppSelector(selectCurrentProject)
  return <h1>{project?.name}</h1>
}
```

### Pattern: Normalize Async Requests

```typescript
// Instead of fetching in multiple places
const makeRequest = (requestId: string, url: string) => {
  const existing = store.getState().asyncData.requests[requestId]
  
  // Don't re-fetch if already loading
  if (existing?.status === 'pending') return
  
  dispatch(fetchAsyncData({
    requestId,
    promise: fetch(url).then(r => r.json())
  }))
}
```

### Pattern: Cleanup Old Data

```typescript
export function useCleanupAsyncData() {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    // Cleanup old requests on unmount
    return () => {
      dispatch(cleanupAsyncRequests())
    }
  }, [])
}
```

---

## DevTools & Debugging

### Pattern: Enable Redux DevTools

```typescript
// In store configuration
const store = configureStore({
  reducer: coreReducers,
  devTools: {
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      type: action.type
    }),
    stateSanitizer: (state) => state
  }
})
```

### Pattern: Log Action Dispatch

```typescript
export const logMiddleware = (store: any) => (next: any) => (action: any) => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

// Add to store
const store = configureStore({
  reducer: coreReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logMiddleware)
})
```

### Pattern: Monitor Redux State Size

```typescript
export function useStateSize() {
  const state = useAppSelector(s => s)
  
  useEffect(() => {
    const size = JSON.stringify(state).length
    console.log(`Redux state size: ${(size / 1024).toFixed(2)} KB`)
    
    if (size > 1024 * 1024) {
      console.warn('Redux state is getting large!')
    }
  }, [state])
}
```

### Pattern: Dev-Only Inspector

```typescript
export function ReduxInspector() {
  if (process.env.NODE_ENV !== 'development') return null
  
  const state = useAppSelector(s => s)
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10 }}>
      <button onClick={() => setExpanded(!expanded)}>Redux</button>
      {expanded && (
        <pre style={{ maxHeight: 400, overflow: 'auto' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </div>
  )
}
```

---

## Key Takeaways

1. **Always use typed hooks** from `@metabuilder/redux-core`
2. **Memoize selectors** for expensive computations
3. **Normalize async requests** to avoid duplicates
4. **Clean up on unmount** to prevent memory leaks
5. **Use custom hooks** to encapsulate Redux logic
6. **Separate concerns** - core state vs frontend-specific state
7. **Enable Redux DevTools** for debugging

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0
