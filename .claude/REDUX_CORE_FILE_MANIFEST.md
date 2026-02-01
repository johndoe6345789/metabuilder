# Redux Core Package - File Manifest

**Location**: `/Users/rmac/Documents/metabuilder/redux/core`
**Package**: @metabuilder/redux-core@1.0.0
**Generated**: 2026-01-23

## Complete File Tree

```
redux/core/
├── package.json                          (925 bytes)
├── tsconfig.json                         (451 bytes)
├── src/
│   ├── index.ts                          (Main exports - 2,161 bytes)
│   ├── slices/
│   │   ├── index.ts                      (Slices barrel export)
│   │   ├── authSlice.ts                  (2,466 bytes)
│   │   ├── projectSlice.ts               (2,765 bytes - MODIFIED: exported ProjectState)
│   │   ├── workspaceSlice.ts             (2,955 bytes - MODIFIED: exported WorkspaceState)
│   │   ├── workflowSlice.ts              (5,381 bytes)
│   │   ├── nodesSlice.ts                 (2,863 bytes)
│   │   └── asyncDataSlice.ts             (11,389 bytes - MODIFIED: exported AsyncDataState)
│   ├── types/
│   │   ├── index.ts                      (80 bytes - barrel export)
│   │   ├── project.ts                    (4,290 bytes)
│   │   ├── template.ts                   (2,251 bytes)
│   │   └── workflow.ts                   (2,893 bytes)
│   └── store/
│       └── index.ts                      (729 bytes)
└── dist/                                 (Auto-generated compiled output)
    ├── index.d.ts                        (Type definitions)
    ├── index.js                          (Compiled JavaScript)
    ├── index.d.ts.map                    (Source maps)
    ├── index.js.map
    ├── slices/
    │   ├── index.d.ts
    │   ├── index.js
    │   ├── authSlice.d.ts
    │   ├── authSlice.js
    │   ├── projectSlice.d.ts
    │   ├── projectSlice.js
    │   ├── workspaceSlice.d.ts
    │   ├── workspaceSlice.js
    │   ├── workflowSlice.d.ts
    │   ├── workflowSlice.js
    │   ├── nodesSlice.d.ts
    │   ├── nodesSlice.js
    │   ├── asyncDataSlice.d.ts
    │   └── asyncDataSlice.js
    ├── types/
    │   ├── index.d.ts
    │   ├── index.js
    │   ├── project.d.ts
    │   ├── project.js
    │   ├── template.d.ts
    │   ├── template.js
    │   ├── workflow.d.ts
    │   └── workflow.js
    └── store/
        ├── index.d.ts
        ├── index.js
        └── *.map files
```

## Source Files Details

### Root Configuration Files

#### package.json
- **Location**: `/Users/rmac/Documents/metabuilder/redux/core/package.json`
- **Size**: 925 bytes
- **Contents**: 
  - Package name: @metabuilder/redux-core
  - Version: 1.0.0
  - Main: dist/index.js
  - Types: dist/index.d.ts
  - 4 export paths configured (., ./slices, ./types, ./store)
  - Dependencies: @reduxjs/toolkit, react, react-redux
  - DevDependencies: typescript, @types/react

#### tsconfig.json
- **Location**: `/Users/rmac/Documents/metabuilder/redux/core/tsconfig.json`
- **Size**: 451 bytes
- **Target**: ES2020
- **Module**: ESNext
- **Strict**: true
- **Out**: ./dist
- **Root**: ./src

### Source Files (13 total)

#### Main Export
- **src/index.ts** (2,161 bytes)
  - Exports all slices and their actions
  - Exports all types
  - Exports store utilities
  - Exports coreReducers object

#### Slices Directory (7 files)

1. **src/slices/index.ts** (1,769 bytes)
   - Barrel export for all slices
   - Re-exports with namespace aliases

2. **src/slices/authSlice.ts** (2,466 bytes)
   - Slice: `authSlice`
   - Actions: setLoading, setError, setAuthenticated, setUser, logout, clearError, restoreFromStorage
   - Types: AuthState, User
   - State: isAuthenticated, user, token, isLoading, error

3. **src/slices/projectSlice.ts** (2,765 bytes) - MODIFIED
   - Slice: `projectSlice`
   - Actions: setLoading, setError, setProjects, addProject, updateProject, removeProject, setCurrentProject, clearProject
   - Types: ProjectState (now exported)
   - State: projects[], currentProjectId, isLoading, error

4. **src/slices/workspaceSlice.ts** (2,955 bytes) - MODIFIED
   - Slice: `workspaceSlice`
   - Actions: setLoading, setError, setWorkspaces, addWorkspace, updateWorkspace, removeWorkspace, setCurrentWorkspace, clearWorkspaces
   - Types: WorkspaceState (now exported)
   - State: workspaces[], currentWorkspaceId, isLoading, error

5. **src/slices/workflowSlice.ts** (5,381 bytes)
   - Slice: `workflowSlice`
   - Actions: 17 actions for workflow management
   - Types: WorkflowState
   - State: Current workflow, nodes, connections, execution history, isDirty, isSaving

6. **src/slices/nodesSlice.ts** (2,863 bytes)
   - Slice: `nodesSlice`
   - Actions: setRegistry, addNodeType, removeNodeType, setTemplates, addTemplate, removeTemplate, updateTemplate, setCategories, setLoading, setError, resetNodes
   - Types: NodesState
   - State: Node registry, templates, categories, isLoading, error

7. **src/slices/asyncDataSlice.ts** (11,389 bytes) - MODIFIED
   - Slice: `asyncDataSlice`
   - Actions: 9 regular actions
   - Thunks: 4 async thunks (fetchAsyncData, mutateAsyncData, refetchAsyncData, cleanupAsyncRequests)
   - Types: AsyncDataState, AsyncRequest (now AsyncDataState is exported)
   - State: requests (keyed object), globalLoading, globalError, refetchInterval

#### Types Directory (4 files)

1. **src/types/index.ts** (80 bytes)
   - Barrel export
   - Exports from: project, workflow, template

2. **src/types/project.ts** (4,290 bytes)
   - Type: Project
   - Type: ProjectStatus (enum)
   - Related interfaces and types for project management

3. **src/types/workflow.ts** (2,893 bytes)
   - Type: Workflow
   - Type: WorkflowNode
   - Type: WorkflowConnection
   - Related interfaces for workflow execution

4. **src/types/template.ts** (2,251 bytes)
   - Type: Template
   - Related interfaces for workflow templates

#### Store Directory (1 file)

1. **src/store/index.ts** (729 bytes)
   - Hook: useAppDispatch()
   - Hook: useAppSelector
   - Function: createAppStore(reducers, preloadedState)
   - Types: RootState, AppDispatch, AppStore

## Compiled Output (dist/)

Total Files: 52 (26 .ts files × 2 for .d.ts and .js, plus .map files)

### dist Structure

```
dist/
├── index.d.ts (2,276 bytes)
├── index.js (2,173 bytes)
├── index.d.ts.map
├── index.js.map
├── slices/
│   ├── index.d.ts
│   ├── index.js
│   ├── index.d.ts.map
│   ├── index.js.map
│   ├── authSlice.d.ts (2,624 bytes)
│   ├── authSlice.js (2,128 bytes)
│   ├── authSlice.d.ts.map
│   ├── authSlice.js.map
│   ├── projectSlice.d.ts
│   ├── projectSlice.js
│   ├── projectSlice.d.ts.map
│   ├── projectSlice.js.map
│   ├── workspaceSlice.d.ts
│   ├── workspaceSlice.js
│   ├── workspaceSlice.d.ts.map
│   ├── workspaceSlice.js.map
│   ├── workflowSlice.d.ts (6,144 bytes)
│   ├── workflowSlice.js (8,921 bytes)
│   ├── workflowSlice.d.ts.map
│   ├── workflowSlice.js.map
│   ├── nodesSlice.d.ts
│   ├── nodesSlice.js
│   ├── nodesSlice.d.ts.map
│   ├── nodesSlice.js.map
│   ├── asyncDataSlice.d.ts (6,644 bytes)
│   ├── asyncDataSlice.js (10,751 bytes)
│   ├── asyncDataSlice.d.ts.map
│   └── asyncDataSlice.js.map
├── types/
│   ├── index.d.ts
│   ├── index.js
│   ├── index.d.ts.map
│   ├── index.js.map
│   ├── project.d.ts
│   ├── project.js
│   ├── project.d.ts.map
│   ├── project.js.map
│   ├── template.d.ts
│   ├── template.js
│   ├── template.d.ts.map
│   ├── template.js.map
│   ├── workflow.d.ts
│   ├── workflow.js
│   ├── workflow.d.ts.map
│   └── workflow.js.map
└── store/
    ├── index.d.ts
    ├── index.js
    ├── index.d.ts.map
    └── index.js.map
```

## File Statistics

| Category | Count | Size |
|----------|-------|------|
| TypeScript source files | 13 | ~40 KB |
| Configuration files | 2 | ~1.4 KB |
| Compiled .d.ts files | 13 | ~30 KB |
| Compiled .js files | 13 | ~35 KB |
| Source map files | 26 | ~10 KB |
| **Total dist/** | 52 | ~75 KB |

## Export Paths

### Default Export (.)
- Import: `import { authSlice, useAppDispatch } from '@metabuilder/redux-core'`
- Maps to: `dist/index.js` and `dist/index.d.ts`
- Contents: All slices, types, utilities, and coreReducers

### Slices Export (./slices)
- Import: `import { authSlice } from '@metabuilder/redux-core/slices'`
- Maps to: `dist/slices/index.js` and `dist/slices/index.d.ts`
- Contents: Slice exports only

### Types Export (./types)
- Import: `import type { ProjectState } from '@metabuilder/redux-core/types'`
- Maps to: `dist/types/index.js` and `dist/types/index.d.ts`
- Contents: Type definitions only

### Store Export (./store)
- Import: `import { useAppDispatch } from '@metabuilder/redux-core/store'`
- Maps to: `dist/store/index.js` and `dist/store/index.d.ts`
- Contents: Store utilities only

## Changes Made to Copied Files

Three slices were modified to make their State interfaces publicly exported:

### projectSlice.ts
- **Line**: ~8
- **Change**: `interface ProjectState` → `export interface ProjectState`

### workspaceSlice.ts
- **Line**: ~8
- **Change**: `interface WorkspaceState` → `export interface WorkspaceState`

### asyncDataSlice.ts
- **Line**: ~11
- **Change**: `interface AsyncDataState` → `export interface AsyncDataState`

These changes ensure TypeScript doesn't complain about unexported types being used in exported functions.

## Absolute File Paths

```
Configuration:
  /Users/rmac/Documents/metabuilder/redux/core/package.json
  /Users/rmac/Documents/metabuilder/redux/core/tsconfig.json

Source - Main:
  /Users/rmac/Documents/metabuilder/redux/core/src/index.ts

Source - Slices:
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/index.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/authSlice.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/projectSlice.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/workspaceSlice.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/workflowSlice.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/nodesSlice.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/slices/asyncDataSlice.ts

Source - Types:
  /Users/rmac/Documents/metabuilder/redux/core/src/types/index.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/types/project.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/types/workflow.ts
  /Users/rmac/Documents/metabuilder/redux/core/src/types/template.ts

Source - Store:
  /Users/rmac/Documents/metabuilder/redux/core/src/store/index.ts

Compiled Output:
  /Users/rmac/Documents/metabuilder/redux/core/dist/ (52 files)
```

---

**Generated**: 2026-01-23
**Package**: @metabuilder/redux-core@1.0.0
