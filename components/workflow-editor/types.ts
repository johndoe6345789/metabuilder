/**
 * Workflow Editor Types
 * Type definitions for the visual workflow editor
 */

export interface Position {
  x: number;
  y: number;
}

export interface NodeType {
  id: string;
  type: string;
  category: string;
  categoryName?: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
  language?: string;
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
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type NodeCategories = Record<string, NodeCategory>;
