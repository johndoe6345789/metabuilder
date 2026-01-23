/**
 * Workflow Type Definitions
 * Core types for workflow editor and execution
 */

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
 * Workflow node instance
 */
export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  description?: string;
  disabled?: boolean;
}

/**
 * Connection between nodes
 */
export interface WorkflowConnection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tenantId: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  lastModifiedBy?: string;
  isPublished?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Execution result for node
 */
export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startTime: number;
  endTime?: number;
  duration?: number;
  data?: any;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Complete execution result
 */
export interface ExecutionResult {
  id: string;
  workflowId: string;
  workflowName: string;
  tenantId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'stopped';
  startTime: number;
  endTime?: number;
  duration?: number;
  nodes: NodeExecutionResult[];
  error?: {
    code: string;
    message: string;
    nodeId?: string;
  };
  input?: Record<string, any>;
  output?: Record<string, any>;
  triggeredBy?: string;
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
