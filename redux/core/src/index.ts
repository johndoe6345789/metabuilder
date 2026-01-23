// Slices
export {
  authSlice,
  setLoading,
  setError,
  setAuthenticated,
  setUser,
  logout,
  clearError,
  restoreFromStorage,
  type AuthState,
  type User,
} from './slices/authSlice'

export {
  projectSlice,
  setLoading as setProjectLoading,
  setError as setProjectError,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  clearProject,
  type ProjectState,
} from './slices/projectSlice'

export {
  workspaceSlice,
  setLoading as setWorkspaceLoading,
  setError as setWorkspaceError,
  setWorkspaces,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  setCurrentWorkspace,
  clearWorkspaces,
  type WorkspaceState,
} from './slices/workspaceSlice'

export {
  workflowSlice,
  loadWorkflow,
  createWorkflow,
  saveWorkflow,
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  removeConnection,
  updateConnections,
  setNodesAndConnections,
  startExecution,
  endExecution,
  clearExecutionHistory,
  setSaving,
  setSaveError,
  setDirty,
  resetWorkflow,
  type WorkflowState,
} from './slices/workflowSlice'

export {
  nodesSlice,
  setRegistry,
  addNodeType,
  removeNodeType,
  setTemplates,
  addTemplate,
  removeTemplate,
  updateTemplate,
  setCategories,
  setLoading as setNodesLoading,
  setError as setNodesError,
  resetNodes,
  type NodesState,
} from './slices/nodesSlice'

export {
  asyncDataSlice,
  setRequestLoading,
  setRequestError,
  setRequestData,
  clearRequest,
  clearAllRequests,
  resetRequest,
  setGlobalLoading,
  setGlobalError,
  setRefetchInterval,
  fetchAsyncData,
  mutateAsyncData,
  refetchAsyncData,
  cleanupAsyncRequests,
  type AsyncDataState,
} from './slices/asyncDataSlice'

// Types
export type * from './types'

// Store utilities
export { useAppDispatch, useAppSelector, createAppStore } from './store'
export type { AppStore, AppDispatch, RootState } from './store'

// Import slices for reducer map
import { authSlice } from './slices/authSlice'
import { projectSlice } from './slices/projectSlice'
import { workspaceSlice } from './slices/workspaceSlice'
import { workflowSlice } from './slices/workflowSlice'
import { nodesSlice } from './slices/nodesSlice'
import { asyncDataSlice } from './slices/asyncDataSlice'

// Reducer map for configureStore
export const coreReducers = {
  auth: authSlice.reducer,
  project: projectSlice.reducer,
  workspace: workspaceSlice.reducer,
  workflow: workflowSlice.reducer,
  nodes: nodesSlice.reducer,
  asyncData: asyncDataSlice.reducer,
}

// Middleware and DevTools
export {
  getMiddlewareConfig,
  getDevToolsConfig,
  devToolsConfig,
  createLoggingMiddleware,
  createPerformanceMiddleware,
  createErrorMiddleware,
  createAnalyticsMiddleware,
  enableReduxDevTools,
} from './middleware'
