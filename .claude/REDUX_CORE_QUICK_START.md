# Redux Core Package - Quick Start Guide

## Installation

The package is already part of the workspace. No additional installation needed.

```bash
npm install  # Already included as a workspace
```

## Basic Usage

### 1. Create a Redux Store

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

const store = configureStore({
  reducer: coreReducers
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 2. Use Redux Hooks in Components

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { authSlice } from '@metabuilder/redux-core'

function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)

  const handleLogin = (user: User, token: string) => {
    dispatch(authSlice.actions.setAuthenticated({ user, token }))
  }

  return (
    <div>
      {isAuthenticated ? <p>Welcome {user?.name}</p> : <p>Not logged in</p>}
    </div>
  )
}
```

### 3. Use Helper Function to Create Store

```typescript
import { createAppStore, coreReducers } from '@metabuilder/redux-core'

const store = createAppStore(coreReducers)
```

## Import Patterns

### Import Everything
```typescript
import { 
  authSlice, 
  projectSlice, 
  workflowSlice,
  useAppDispatch,
  useAppSelector,
  coreReducers
} from '@metabuilder/redux-core'
```

### Import Specific Slices
```typescript
import { authSlice, projectSlice } from '@metabuilder/redux-core/slices'
```

### Import Types Only
```typescript
import type { ProjectState, WorkflowState, AuthState } from '@metabuilder/redux-core/types'
```

### Import Store Utilities
```typescript
import { useAppDispatch, useAppSelector, createAppStore } from '@metabuilder/redux-core/store'
```

## Common Actions

### Authentication
```typescript
import { setAuthenticated, logout, setUser } from '@metabuilder/redux-core'

// Login
dispatch(setAuthenticated({ user, token }))

// Logout
dispatch(logout())

// Update user
dispatch(setUser(updatedUser))
```

### Projects
```typescript
import { 
  setProjects, 
  addProject, 
  updateProject, 
  removeProject,
  setCurrentProject 
} from '@metabuilder/redux-core'

// Set projects list
dispatch(setProjects(projects))

// Add new project
dispatch(addProject(newProject))

// Update existing project
dispatch(updateProject(updatedProject))

// Remove project
dispatch(removeProject(projectId))

// Set current project
dispatch(setCurrentProject(projectId))
```

### Workflows
```typescript
import { 
  loadWorkflow, 
  createWorkflow, 
  saveWorkflow,
  addNode,
  updateNode,
  deleteNode,
  addConnection
} from '@metabuilder/redux-core'

// Load workflow
dispatch(loadWorkflow(workflowId))

// Create new workflow
dispatch(createWorkflow(workflow))

// Add node to workflow
dispatch(addNode(node))

// Update node
dispatch(updateNode(updatedNode))

// Delete node
dispatch(deleteNode(nodeId))

// Add connection
dispatch(addConnection(connection))
```

### Async Data
```typescript
import { 
  fetchAsyncData, 
  mutateAsyncData,
  clearRequest,
  setRequestLoading
} from '@metabuilder/redux-core'

// Fetch data
dispatch(fetchAsyncData({
  id: 'user-list',
  url: '/api/users',
  method: 'GET'
}))

// Mutate data
dispatch(mutateAsyncData({
  id: 'create-user',
  url: '/api/users',
  method: 'POST',
  data: userData
}))

// Clear specific request
dispatch(clearRequest('user-list'))
```

## Selectors

### Auth Selectors
```typescript
const user = useAppSelector(state => state.auth.user)
const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
const isLoading = useAppSelector(state => state.auth.isLoading)
const error = useAppSelector(state => state.auth.error)
```

### Project Selectors
```typescript
const projects = useAppSelector(state => state.project.projects)
const currentProject = useAppSelector(state => {
  const id = state.project.currentProjectId
  return state.project.projects.find(p => p.id === id)
})
```

### Workflow Selectors
```typescript
const workflow = useAppSelector(state => state.workflow)
const nodes = useAppSelector(state => state.workflow.nodes)
const connections = useAppSelector(state => state.workflow.connections)
```

### Async Data Selectors
```typescript
const userRequest = useAppSelector(state => state.asyncData.requests['user-list'])
const isLoading = userRequest?.loading
const data = userRequest?.data
const error = userRequest?.error
```

## TypeScript Types

### State Types
```typescript
import type { 
  AuthState, 
  ProjectState, 
  WorkspaceState,
  WorkflowState,
  NodesState,
  AsyncDataState 
} from '@metabuilder/redux-core'
```

### Data Types
```typescript
import type { 
  User,
  Project,
  Workflow,
  Template
} from '@metabuilder/redux-core'
```

## Full Example Component

```typescript
import React from 'react'
import { useAppDispatch, useAppSelector, setCurrentProject } from '@metabuilder/redux-core'

export function ProjectSelector() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.project.projects)
  const currentProjectId = useAppSelector(state => state.project.currentProjectId)
  const isLoading = useAppSelector(state => state.project.isLoading)

  const handleSelectProject = (projectId: string) => {
    dispatch(setCurrentProject(projectId))
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <label>Select Project:</label>
      <select 
        value={currentProjectId || ''} 
        onChange={(e) => handleSelectProject(e.target.value)}
      >
        <option value="">-- Select --</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## File Locations

- **Main Package**: `/redux/core/`
- **Source**: `/redux/core/src/`
- **Slices**: `/redux/core/src/slices/`
- **Types**: `/redux/core/src/types/`
- **Store**: `/redux/core/src/store/`
- **Compiled**: `/redux/core/dist/`

## Troubleshooting

### Cannot find module '@metabuilder/redux-core'
Make sure you've run `npm install` from the root directory.

### Type errors for state
Import types from `@metabuilder/redux-core/types` or use inline type inference from useAppSelector.

### Action not found
Check the slice name - actions are exported with prefixed names:
- `setLoading` (auth) vs `setProjectLoading` (project)
- Use the correct import path

### Store not initialized
Make sure to create the store with `coreReducers` before providing it to React.

---

**Quick Reference**: [REDUX_CORE_SETUP_COMPLETE.md](./REDUX_CORE_SETUP_COMPLETE.md)
