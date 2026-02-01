# Redux Core Package - Setup Complete

**Date**: 2026-01-23
**Status**: ✓ Complete
**Package**: @metabuilder/redux-core@1.0.0

## Summary

Successfully created a new root Redux package (`/redux/core`) containing all TIER 1 slices and core utilities. This package is now shared across all frontends and serves as the foundation for Redux state management in MetaBuilder.

## Directory Structure

```
/redux/core/
├── src/
│   ├── index.ts                      # Main export file
│   ├── slices/
│   │   ├── index.ts                  # Slices barrel export
│   │   ├── authSlice.ts              # Authentication state
│   │   ├── projectSlice.ts           # Project management state
│   │   ├── workspaceSlice.ts         # Workspace state
│   │   ├── workflowSlice.ts          # Workflow execution state
│   │   ├── nodesSlice.ts             # Node registry state
│   │   └── asyncDataSlice.ts         # Async request state
│   ├── types/
│   │   ├── index.ts                  # Types barrel export
│   │   ├── project.ts                # Project type definitions
│   │   ├── workflow.ts               # Workflow type definitions
│   │   └── template.ts               # Template type definitions
│   └── store/
│       └── index.ts                  # Store utilities (useAppDispatch, useAppSelector, createAppStore)
├── dist/                             # Compiled output (auto-generated)
├── package.json                      # Package metadata
├── tsconfig.json                     # TypeScript configuration
```

## TIER 1 Slices Included

### 1. **authSlice** - Authentication
- **Actions**: setLoading, setError, setAuthenticated, setUser, logout, clearError, restoreFromStorage
- **State**: isAuthenticated, user, token, isLoading, error
- **Types**: User, AuthState

### 2. **projectSlice** - Project Management
- **Actions**: setLoading, setError, setProjects, addProject, updateProject, removeProject, setCurrentProject, clearProject
- **State**: projects, currentProjectId, isLoading, error
- **Types**: ProjectState (exported)

### 3. **workspaceSlice** - Workspace Management
- **Actions**: setLoading, setError, setWorkspaces, addWorkspace, updateWorkspace, removeWorkspace, setCurrentWorkspace, clearWorkspaces
- **State**: workspaces, currentWorkspaceId, isLoading, error
- **Types**: WorkspaceState (exported)

### 4. **workflowSlice** - Workflow Execution
- **Actions**: loadWorkflow, createWorkflow, saveWorkflow, addNode, updateNode, deleteNode, addConnection, removeConnection, updateConnections, setNodesAndConnections, startExecution, endExecution, clearExecutionHistory, setSaving, setSaveError, setDirty, resetWorkflow
- **State**: Current workflow, nodes, connections, execution history
- **Types**: WorkflowState (exported)

### 5. **nodesSlice** - Node Registry
- **Actions**: setRegistry, addNodeType, removeNodeType, setTemplates, addTemplate, removeTemplate, updateTemplate, setCategories, setLoading, setError, resetNodes
- **State**: Node registry, templates, categories, loading, error
- **Types**: NodesState (exported)

### 6. **asyncDataSlice** - Async Data Management
- **Actions**: setRequestLoading, setRequestError, setRequestData, clearRequest, clearAllRequests, resetRequest, setGlobalLoading, setGlobalError, setRefetchInterval
- **Thunks**: fetchAsyncData, mutateAsyncData, refetchAsyncData, cleanupAsyncRequests
- **State**: requests (keyed by ID), globalLoading, globalError
- **Types**: AsyncDataState (exported)

## Core Types Included

- **project.ts** - Project interface and related types
- **workflow.ts** - Workflow interface and related types
- **template.ts** - Template interface and related types

## Store Utilities

### Exports from `store/index.ts`

```typescript
// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Store factory
export function createAppStore(reducers: any, preloadedState?: any) {
  return configureStore({
    reducer: reducers,
    preloadedState,
  })
}

// Types
export type RootState = any
export type AppDispatch = any
export type AppStore = ReturnType<typeof createAppStore>
```

### Reducer Map

```typescript
export const coreReducers = {
  auth: authSlice.reducer,
  project: projectSlice.reducer,
  workspace: workspaceSlice.reducer,
  workflow: workflowSlice.reducer,
  nodes: nodesSlice.reducer,
  asyncData: asyncDataSlice.reducer,
}
```

## Main Exports

The main `index.ts` exports:

### All Slices & Actions
```typescript
// Authentication
export { authSlice, setLoading, setError, setAuthenticated, setUser, logout, clearError, restoreFromStorage }
export type { AuthState, User }

// Projects
export { projectSlice, setLoading as setProjectLoading, setError as setProjectError, ... }
export type { ProjectState }

// Workspaces
export { workspaceSlice, setLoading as setWorkspaceLoading, setError as setWorkspaceError, ... }
export type { WorkspaceState }

// Workflows
export { workflowSlice, loadWorkflow, createWorkflow, saveWorkflow, ... }
export type { WorkflowState }

// Nodes
export { nodesSlice, setRegistry, addNodeType, ... }
export type { NodesState }

// Async Data
export { asyncDataSlice, setRequestLoading, fetchAsyncData, mutateAsyncData, ... }
export type { AsyncDataState }
```

### Types
```typescript
export type * from './types'
```

### Store Utilities
```typescript
export { useAppDispatch, useAppSelector, createAppStore }
export type { AppStore, AppDispatch, RootState }
export const coreReducers
```

## Module Exports

Package.json defines these export paths:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "./slices": {
    "types": "./dist/slices/index.d.ts",
    "default": "./dist/slices/index.js"
  },
  "./types": {
    "types": "./dist/types/index.d.ts",
    "default": "./dist/types/index.js"
  },
  "./store": {
    "types": "./dist/store/index.d.ts",
    "default": "./dist/store/index.js"
  }
}
```

### Usage Examples

```typescript
// Import everything (main export)
import { useAppDispatch, useAppSelector, coreReducers, authSlice } from '@metabuilder/redux-core'

// Import just slices
import { projectSlice, workflowSlice } from '@metabuilder/redux-core/slices'

// Import just types
import type { ProjectState, WorkflowState } from '@metabuilder/redux-core/types'

// Import just store utilities
import { useAppDispatch, createAppStore } from '@metabuilder/redux-core/store'
```

## Build Status

```bash
✓ npm run build --workspace=@metabuilder/redux-core
✓ npm run typecheck --workspace=@metabuilder/redux-core
✓ All TypeScript errors resolved
✓ Dist directory generated with source maps
```

## TypeScript Configuration

- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Declaration maps enabled
- Source maps enabled
- Out directory: ./dist
- Root directory: ./src

## Modifications Made to Slices

To ensure proper type exports and avoid TypeScript errors, the following interfaces were made public exports:

- `ProjectState` (was private interface, now exported)
- `WorkspaceState` (was private interface, now exported)
- `AsyncDataState` (was private interface, now exported)

All other state interfaces were already exported (AuthState, WorkflowState, NodesState).

## NPM Workspace Registration

Updated root `/package.json` workspaces array to include:

```json
"workspaces": [
  "redux/core",  // Added first
  "redux/slices",
  "redux/hooks",
  ...
]
```

Verified via `npm ls`:
```
@metabuilder/redux-core@1.0.0 -> ./redux/core
├── @reduxjs/toolkit@2.0.0
├── @types/react@18.3.27
├── react-redux@9.2.0
├── react@18.3.1
└── typescript@5.9.3
```

## Next Steps

1. **Update Frontends** - Modify frontend packages (nextjs, qt6, cli) to import from @metabuilder/redux-core instead of individual slice packages
2. **Create Adapter Slices** - Extract TIER 2+ slices (canvas, editor, ui, connection, etc.) into separate adapter packages
3. **Setup Store Initialization** - Create store initialization files in each frontend that uses `createAppStore(coreReducers)`
4. **Update Imports** - Replace all relative imports with @metabuilder/redux-core imports

## File Inventory

**Source Files (13)**
- src/index.ts
- src/slices/index.ts
- src/slices/authSlice.ts
- src/slices/projectSlice.ts
- src/slices/workspaceSlice.ts
- src/slices/workflowSlice.ts
- src/slices/nodesSlice.ts
- src/slices/asyncDataSlice.ts
- src/store/index.ts
- src/types/index.ts
- src/types/project.ts
- src/types/workflow.ts
- src/types/template.ts

**Configuration Files (2)**
- package.json
- tsconfig.json

**Compiled Output (dist/)**
- 6 slice files with .d.ts, .js, and source maps
- store utilities with .d.ts, .js, and source maps
- types with .d.ts, .js, and source maps
- Main index with .d.ts, .js, and source maps

## Success Criteria Met

✓ /redux/core/ directory created with all files
✓ package.json properly configured with correct exports
✓ All 6 TIER 1 slices copied
✓ All core types copied and exported
✓ Store utilities created
✓ Main index.ts exports everything correctly
✓ npm install succeeds
✓ Build succeeds with no TypeScript errors
✓ New workspace shows in npm ls output
✓ Workspace added to root package.json

---

**Package**: @metabuilder/redux-core
**Version**: 1.0.0
**Location**: /redux/core
**Status**: Ready for integration
