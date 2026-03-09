/**
 * Shared Project Types
 *
 * Canonical type definitions for projects and workspaces.
 */

/**
 * Workspace containing multiple projects
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Project within a workspace
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  tenantId: string;
  color?: string;
  starred?: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Canvas position
 */
export interface CanvasPosition {
  x: number;
  y: number;
}

/**
 * Canvas size
 */
export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Project canvas item (workflow card on canvas)
 */
export interface ProjectCanvasItem {
  id: string;
  projectId: string;
  workflowId: string;
  position: CanvasPosition;
  size: CanvasSize;
  zIndex: number;
  color?: string;
  minimized?: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Canvas state for zoom, pan, selection
 */
export interface ProjectCanvasState {
  zoom: number;
  pan: CanvasPosition;
  selectedItemIds: Set<string>;
  isDragging: boolean;
  isResizing: boolean;
  gridSnap: boolean;
  showGrid: boolean;
  snapSize: number;
}

// Request interfaces moved to @metabuilder/interfaces/requests.ts
// Re-export for backwards compatibility
export type {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '../interfaces/requests';
