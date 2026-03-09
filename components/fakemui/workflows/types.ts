/**
 * Workflow Components Type Definitions
 * Types for canvas items, workflow cards, and editor nodes
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

// =============================================================================
// WORKFLOW EDITOR TYPES
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface NodeType {
  id: string;
  type: string;
  category: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: Position;
  config: Record<string, unknown>;
  inputs: string[];
  outputs: string[];
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

export interface NodeCategory {
  name: string;
  color: string;
}
