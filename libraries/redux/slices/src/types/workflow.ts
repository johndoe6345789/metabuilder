/**
 * Re-export workflow types from shared types package
 */
export type {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  NodeExecutionResult,
  ExecutionResult,
  ExecutionStatus,
  ExecutionStats
} from '@metabuilder/types';

/**
 * Node parameter definition
 */
export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'select' | 'textarea';
  required?: boolean;
  default?: any;
  description?: string;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

/**
 * Node type definition (from plugin registry)
 */
export interface NodeType {
  id: string;
  name: string;
  category: string;
  version: string;
  description?: string;
  icon?: string;
  parameters: Record<string, NodeParameter>;
  tags?: string[];
  experimental?: boolean;
  author?: string;
}

/**
 * Node selection state
 */
export interface SelectionState {
  selectedNodes: Set<string>;
  selectedConnections: Set<string>;
}

/**
 * Editor viewport state
 */
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Node template
 */
export interface NodeTemplate {
  id: string;
  name: string;
  nodeType: string;
  description?: string;
  tags?: string[];
  parameters: Record<string, any>;
  category?: string;
}
