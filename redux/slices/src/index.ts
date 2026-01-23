/**
 * @metabuilder/redux-slices
 * Redux Toolkit slices for workflow state management
 * 
 * Includes slices for:
 * - Workflow state (nodes, connections, execution)
 * - Canvas state (zoom, pan, selection, settings)
 * - Editor state (zoom, pan, nodes, edges, selection)
 * - UI state (modals, notifications, theme, loading)
 * - Auth state (user, token, authentication)
 * - Project & Workspace management
 * - Real-time collaboration features
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
export { canvasSlice, type CanvasState } from './slices/canvasSlice'
export { 
  setCanvasZoom, setCanvasPan, panCanvas,
  selectCanvasItem, addToSelection, toggleSelection,
  clearSelection, setDragging, setResizing,
  setGridSnap, setShowGrid, setSnapSize
} from './slices/canvasSlice'

// Canvas Items
export { canvasItemsSlice, type CanvasItemsState } from './slices/canvasItemsSlice'
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
  setLoading, setLoadingMessage
} from './slices/uiSlice'

// Auth
export { authSlice, type AuthState, type User } from './slices/authSlice'
export {
  setLoading, setError, setAuthenticated,
  setUser, logout, clearError,
  restoreFromStorage
} from './slices/authSlice'

// Project
export { projectSlice, type ProjectState } from './slices/projectSlice'
export {
  setProjects, addProject, updateProject,
  removeProject, setCurrentProject, clearProject
} from './slices/projectSlice'

// Workspace
export { workspaceSlice, type WorkspaceState } from './slices/workspaceSlice'
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
export { collaborationSlice, type CollaborationState } from './slices/collaborationSlice'
export {
  addActivityEntry, setActivityFeed, clearActivityFeed,
  addConflict, resolveConflict, resolveAllConflicts,
  updateConflictResolution, clearConflicts
} from './slices/collaborationSlice'

// Real-time
export { realtimeSlice, type RealtimeState } from './slices/realtimeSlice'
export {
  setConnected, addConnectedUser, removeConnectedUser,
  updateRemoteCursor, lockItem, releaseItem,
  clearRemoteCursor, clearAllRemote
} from './slices/realtimeSlice'

// Documentation
export { documentationSlice, type DocumentationState } from './slices/documentationSlice'
export {
  openHelp, closeHelp, navigateToPage,
  setCategory, setSearchQuery, setSearchResults,
  goBack, clearSearch, clearHistory
} from './slices/documentationSlice'

// Store types
export type RootState = {
  workflow: WorkflowState
  canvas: CanvasState
  canvasItems: CanvasItemsState
  editor: EditorState
  connection: ConnectionState
  ui: UIState
  auth: AuthState
  project: ProjectState
  workspace: WorkspaceState
  nodes: NodesState
  collaboration: CollaborationState
  realtime: RealtimeState
  documentation: DocumentationState
}

export type AppDispatch = any // Will be typed in store.ts
