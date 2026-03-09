/**
 * Shared Workflow Types
 *
 * Canonical type definitions used across all workflow-related packages:
 * - @metabuilder/redux-slices
 * - @metabuilder/service-adapters
 * - @metabuilder/hooks-data
 * - @metabuilder/workflow
 */

/**
 * Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tenantId: string;
  tags?: string[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  active?: boolean;
}

/**
 * Workflow node
 */
export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  parameters: Record<string, unknown>;
  data?: Record<string, unknown>;
  disabled?: boolean;
  notes?: string;
}

/**
 * Connection between nodes
 */
export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Node execution result
 */
export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  output?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Execution status
 */
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'error'
  | 'stopped'
  | 'cancelled'
  | 'skipped';

/**
 * Complete execution result
 */
export interface ExecutionResult {
  id: string;
  workflowId: string;
  workflowName: string;
  tenantId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  nodes: NodeExecutionResult[];
  error?: {
    code: string;
    message: string;
    nodeId?: string;
  };
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  triggeredBy?: string;
}

/**
 * Execution statistics
 */
export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecutionTime?: number;
}

/**
 * Execution state - maps node IDs to their results
 */
export interface ExecutionState {
  [nodeId: string]: NodeResult;
}

/**
 * Node result from execution
 */
export interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending';
  output?: unknown;
  error?: string;
  errorCode?: string;
  timestamp: number;
  duration?: number;
  retries?: number;
  inputData?: unknown;
  outputData?: unknown;
  recoveryApplied?: boolean;
  fallbackNodeType?: string;
  validationErrors?: string[];
}

/**
 * Log entry for execution
 */
export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  nodeId?: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Execution metrics
 */
export interface ExecutionMetrics {
  nodesExecuted: number;
  successNodes: number;
  failedNodes: number;
  retriedNodes: number;
  totalRetries: number;
  peakMemory: number;
  dataProcessed: number;
  apiCallsMade: number;
}

/**
 * Complete execution record
 */
export interface ExecutionRecord {
  id: string;
  workflowId: string;
  tenantId: string;
  userId: string;
  triggeredBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'success' | 'error' | 'aborted' | 'timeout';
  state: ExecutionState;
  metrics: ExecutionMetrics;
  logs: LogEntry[];
  error?: {
    message: string;
    code: string;
    nodeId?: string;
  };
}
