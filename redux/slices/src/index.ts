/**
 * @metabuilder/redux-slices
 * Redux Toolkit slices for workflow state management
 */

// Workflow
export { workflowSlice, type WorkflowState } from './slices/workflowSlice'
export { 
  loadWorkflow, createWorkflow, saveWorkflow,
  addNode, updateNode, deleteNode,
  addConnection, removeConnection,
  setNodesAndConnections,
  startExecution, endExecution,
  clearExecutionHistory,
  setSaving, setDirty, resetWorkflow
} from './slices/workflowSlice'

// Canvas
export { canvasSlice } from './slices/canvasSlice'
export { 
  setCanvasZoom, setCanvasPan, panCanvas,
  selectCanvasItem, addToSelection, toggleSelection,
  clearSelection, setDragging, setResizing,
  setGridSnap, setShowGrid, setSnapSize
} from './slices/canvasSlice'

// Canvas Items
export { canvasItemsSlice } from './slices/canvasItemsSlice'
export {
  setCanvasItems, addCanvasItem, updateCanvasItem, removeCanvasItem,
  bulkUpdateCanvasItems, deleteCanvasItems, duplicateCanvasItems,
  applyAutoLayout, clearCanvasItems
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
  restoreFromStorage
} from './slices/authSlice'

// Project
export { projectSlice } from './slices/projectSlice'
export {
  setProjects, addProject, updateProject,
  removeProject, setCurrentProject, clearProject
} from './slices/projectSlice'

// Workspace
export { workspaceSlice } from './slices/workspaceSlice'
export {
  setWorkspaces, addWorkspace, updateWorkspace,
  removeWorkspace, setCurrentWorkspace, clearWorkspaces
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
