/**
 * @metabuilder/redux-slices
 * Redux Toolkit slices for workflow state management
 */

// Types
export type {
  CanvasPosition,
  CanvasSize,
  Workspace,
  Project,
  ProjectCanvasItem,
  ProjectCanvasState,
  CollaborativeUser,
  CanvasUpdateEvent
} from './types/project'

// Workflow
export { workflowSlice, type WorkflowState } from './slices/workflowSlice'

// Workflow types
export type {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  NodeExecutionResult,
  ExecutionResult
} from './types/workflow'
export {
  loadWorkflow, createWorkflow, saveWorkflow,
  addNode, updateNode, deleteNode,
  addConnection, removeConnection,
  setNodesAndConnections,
  startExecution, endExecution,
  clearExecutionHistory,
  setSaving, setDirty, resetWorkflow,
  // Selectors
  selectCurrentWorkflow, selectWorkflowNodes, selectWorkflowConnections,
  selectWorkflowIsDirty, selectWorkflowIsSaving,
  selectCurrentExecution, selectExecutionHistory,
  selectLastSaved, selectSaveError
} from './slices/workflowSlice'

// Canvas
export { canvasSlice } from './slices/canvasSlice'
export {
  setCanvasZoom, setCanvasPan, panCanvas,
  selectCanvasItem, addToSelection, toggleSelection,
  clearSelection, setDragging, setResizing,
  setGridSnap, setShowGrid, setSnapSize,
  resetCanvasView, removeFromSelection, setSelection, resetCanvasState
} from './slices/canvasSlice'

// Canvas selectors
export {
  selectCanvasZoom, selectCanvasPan, selectGridSnap,
  selectShowGrid, selectSnapSize, selectIsDragging,
  selectIsResizing, selectSelectedItemIds
} from './slices/canvasSlice'

// Canvas Items
export { canvasItemsSlice } from './slices/canvasItemsSlice'
export {
  setCanvasItems, addCanvasItem, updateCanvasItem, removeCanvasItem,
  bulkUpdateCanvasItems, deleteCanvasItems, duplicateCanvasItems,
  applyAutoLayout, clearCanvasItems
} from './slices/canvasItemsSlice'

// Canvas Items selectors
export {
  selectCanvasItems, selectCanvasItemCount,
  selectCanvasItemById, selectCanvasItemsByIds
} from './slices/canvasItemsSlice'

// Editor
export { editorSlice, type EditorState } from './slices/editorSlice'
export {
  setZoom, zoomIn, zoomOut, resetZoom,
  setPan, panBy, selectNode, toggleNodeSelection,
  showContextMenu, hideContextMenu, setCanvasSize
} from './slices/editorSlice'

// Connection
export { connectionSlice, type ConnectionState } from './slices/connectionSlice'
export {
  startConnection, updateConnectionPosition,
  validateConnection, completeConnection,
  cancelConnection, setValidationError,
  resetConnection
} from './slices/connectionSlice'

// UI
export { uiSlice, type UIState } from './slices/uiSlice'
export {
  openModal, closeModal, toggleModal,
  setNotification, removeNotification, clearNotifications,
  setTheme, toggleTheme,
  setSidebarOpen, toggleSidebar,
  setLoading as setUILoading, setLoadingMessage
} from './slices/uiSlice'

// Auth
export { authSlice, type AuthState, type User } from './slices/authSlice'
export {
  setLoading as setAuthLoading, setError, setAuthenticated,
  setUser, logout, clearError,
  restoreFromStorage,
  selectUser, selectIsAuthenticated,
  selectIsLoading as selectAuthLoading,
  selectError as selectAuthError
} from './slices/authSlice'

// Project
export { projectSlice } from './slices/projectSlice'
export {
  setProjects, addProject, updateProject,
  removeProject, setCurrentProject, clearProject,
  setLoading as setProjectLoading, setError as setProjectError,
  selectProjects, selectCurrentProject, selectCurrentProjectId,
  selectProjectIsLoading, selectProjectError
} from './slices/projectSlice'

// Workflows list (distinct from workflowSlice which manages a single open DAG)
export { workflowsSlice, type WorkflowsState } from './slices/workflowsSlice'
export {
  setWorkflows, addWorkflowToList, updateWorkflowInList,
  removeWorkflowFromList, clearWorkflows,
  setLoading as setWorkflowsLoading, setError as setWorkflowsError,
  selectWorkflows, selectWorkflowsIsLoading, selectWorkflowsError
} from './slices/workflowsSlice'

// Workspace
export { workspaceSlice } from './slices/workspaceSlice'
export {
  setWorkspaces, addWorkspace, updateWorkspace,
  removeWorkspace, setCurrentWorkspace, clearWorkspaces,
  setLoading as setWorkspaceLoading, setError as setWorkspaceError,
  selectWorkspaces, selectCurrentWorkspace, selectCurrentWorkspaceId,
  selectWorkspaceIsLoading, selectWorkspaceError
} from './slices/workspaceSlice'

// Nodes
export { nodesSlice, type NodesState } from './slices/nodesSlice'
export {
  setRegistry, addNodeType, removeNodeType,
  setTemplates, addTemplate, removeTemplate,
  updateTemplate, setCategories,
  resetNodes
} from './slices/nodesSlice'

// Collaboration
export { collaborationSlice } from './slices/collaborationSlice'
export {
  addActivityEntry, setActivityFeed, clearActivityFeed,
  addConflict, resolveConflict, resolveAllConflicts,
  updateConflictResolution, clearConflicts
} from './slices/collaborationSlice'

// Real-time
export { realtimeSlice } from './slices/realtimeSlice'
export {
  setConnected, addConnectedUser, removeConnectedUser,
  updateRemoteCursor, lockItem, releaseItem,
  clearRemoteCursor, clearAllRemote
} from './slices/realtimeSlice'

// Documentation
export { documentationSlice } from './slices/documentationSlice'
export {
  openHelp, closeHelp, navigateToPage,
  setCategory, setSearchQuery, setSearchResults,
  goBack, clearSearch, clearHistory
} from './slices/documentationSlice'

// Store Types - Types used by hooks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatch = any
// RootState includes all slice state types for selector compatibility
export interface RootState {
  workflow: import('./slices/workflowSlice').WorkflowState;
  workflows: import('./slices/workflowsSlice').WorkflowsState;
  canvas: any;
  canvasItems: any;
  editor: any;
  connection: any;
  ui: any;
  auth: any;
  project: any;
  workspace: any;
  nodes: any;
  collaboration: any;
  realtime: any;
  documentation: any;
  asyncData: any;
  [key: string]: any;
}

// Async Data
export { asyncDataSlice, type AsyncRequest } from './slices/asyncDataSlice'
export {
  fetchAsyncData, mutateAsyncData, refetchAsyncData, cleanupAsyncRequests,
  setRequestLoading, setRequestError, setRequestData,
  clearRequest, clearAllRequests, resetRequest,
  setGlobalLoading, setGlobalError, setRefetchInterval,
  selectAsyncRequest, selectAsyncData, selectAsyncError,
  selectAsyncLoading, selectAsyncRefetching, selectAllAsyncRequests,
  selectGlobalLoading, selectGlobalError
} from './slices/asyncDataSlice'
