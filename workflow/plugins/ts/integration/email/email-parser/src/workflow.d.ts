/**
 * Workflow Plugin Type Definitions
 * These types define the interface for workflow node executors
 */

export interface WorkflowNode {
  id: string;
  type: string;
  parameters: Record<string, any>;
  connections?: string[];
}

export interface WorkflowContext {
  tenantId?: string;
  userId?: string;
  triggerData?: Record<string, any>;
  [key: string]: any;
}

export interface ExecutionState {
  nodeId?: string;
  executedNodes?: Set<string>;
  variables?: Record<string, any>;
  [key: string]: any;
}

export interface NodeResult {
  status: 'success' | 'error' | 'partial' | 'skipped';
  output?: Record<string, any>;
  error?: string;
  errorCode?: string;
  timestamp: number;
  duration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface INodeExecutor {
  nodeType: string;
  category: string;
  description: string;
  execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult>;
  validate(node: WorkflowNode): ValidationResult;
}
