/**
 * Project System Type Definitions
 * Types for workspaces, projects, and canvas items
 */
/**
 * Workspace - Top-level container for organizing projects
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
 * Project - Container within a workspace for organizing workflows
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
 * ProjectCanvasItem - Workflow card positioned on the project canvas
 */
export interface ProjectCanvasItem {
    id: string;
    projectId: string;
    workflowId: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    zIndex: number;
    color?: string;
    minimized?: boolean;
    createdAt: number;
    updatedAt: number;
}
/**
 * Canvas state for zoom, pan, and selection
 */
export interface ProjectCanvasState {
    zoom: number;
    pan: {
        x: number;
        y: number;
    };
    selectedItemIds: Set<string>;
    isDragging: boolean;
    isResizing: boolean;
    gridSnap: boolean;
    showGrid: boolean;
    snapSize: number;
}
/**
 * Collaborative presence for real-time sync
 */
export interface CollaborativeUser {
    userId: string;
    userName: string;
    color: string;
    cursorPosition?: {
        x: number;
        y: number;
    };
    lastSeen: number;
}
/**
 * Canvas position and size data
 */
export interface CanvasPosition {
    x: number;
    y: number;
}
export interface CanvasSize {
    width: number;
    height: number;
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
export interface CreateWorkspaceRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    tenantId?: string;
}
export interface UpdateWorkspaceRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
}
export interface CreateProjectRequest {
    name: string;
    description?: string;
    workspaceId: string;
    color?: string;
    tenantId?: string;
}
export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    color?: string;
    starred?: boolean;
}
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
    workspaces: Workspace[];
    count: number;
    total: number;
}
export interface ProjectListResponse {
    projects: Project[];
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
//# sourceMappingURL=project.d.ts.map