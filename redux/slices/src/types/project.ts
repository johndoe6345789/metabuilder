/**
 * Re-export project types from shared types package
 */
export type {
  Workspace,
  Project,
  CanvasPosition,
  CanvasSize,
  ProjectCanvasItem,
  ProjectCanvasState,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest
} from '@metabuilder/types';

import type { CanvasPosition, CanvasSize, ProjectCanvasItem } from '@metabuilder/types';

/**
 * Collaborative presence for real-time sync
 */
export interface CollaborativeUser {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  lastSeen: number;
}

/**
 * Canvas update event for real-time sync
 */
export interface CanvasUpdateEvent {
  projectId: string;
  itemId: string;
  userId: string;
  timestamp: number;
  position?: CanvasPosition;
  size?: CanvasSize;
  zIndex?: number;
  color?: string;
  minimized?: boolean;
}

/**
 * Cursor update event for collaborative features
 */
export interface CursorUpdateEvent {
  projectId: string;
  userId: string;
  userName: string;
  position: CanvasPosition;
  color: string;
  timestamp: number;
}

/**
 * Activity feed entry
 */
export interface ActivityFeedEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'join' | 'leave';
  entityType: 'workflow' | 'project' | 'user';
  entityId?: string;
  entityName?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Conflict resolution for simultaneous edits
 */
export interface ConflictItem {
  itemId: string;
  conflictingUsers: string[];
  localChange: Partial<ProjectCanvasItem>;
  remoteChange: Partial<ProjectCanvasItem>;
  resolution: 'local' | 'remote' | 'merge';
}

/**
 * API request/response types
 */

export interface CreateCanvasItemRequest {
  workflowId: string;
  position?: CanvasPosition;
  size?: CanvasSize;
  color?: string;
}

export interface UpdateCanvasItemRequest {
  position?: CanvasPosition;
  size?: CanvasSize;
  zIndex?: number;
  color?: string;
  minimized?: boolean;
}

export interface BulkUpdateCanvasItemsRequest {
  items: Array<{
    id: string;
    position?: CanvasPosition;
    size?: CanvasSize;
    zIndex?: number;
    color?: string;
    minimized?: boolean;
  }>;
}

/**
 * API response types
 */

export interface WorkspaceListResponse {
  workspaces: import('@metabuilder/types').Workspace[];
  count: number;
  total: number;
}

export interface ProjectListResponse {
  projects: import('@metabuilder/types').Project[];
  count: number;
  total: number;
}

export interface CanvasItemListResponse {
  items: ProjectCanvasItem[];
  count: number;
}

export interface BulkUpdateCanvasItemsResponse {
  items: ProjectCanvasItem[];
  count: number;
}
