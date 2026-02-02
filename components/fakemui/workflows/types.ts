/**
 * Workflow Components Type Definitions
 * Types for canvas items and workflow cards
 */

/**
 * ProjectCanvasItem - Workflow card positioned on the project canvas
 */
export interface ProjectCanvasItem {
  id: string;
  projectId: string;
  workflowId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  color?: string;
  minimized?: boolean;
  createdAt: number;
  updatedAt: number;
}
