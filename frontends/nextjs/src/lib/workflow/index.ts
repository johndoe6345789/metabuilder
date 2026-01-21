/**
 * Workflow Integration Index
 *
 * Centralized exports for workflow functionality
 * - Service layer for execution
 * - Types and interfaces
 * - React hooks
 * - Components
 */

// Service layer
export {
  WorkflowExecutionEngine,
  getWorkflowExecutionEngine,
  initializeWorkflowEngine,
} from './workflow-service'

// Re-export workflow types from core package
export type {
  WorkflowDefinition,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ExecutionRecord,
  ExecutionMetrics,
  LogEntry,
  WorkflowNode,
  WorkflowTrigger,
  WorkflowSettings,
  ErrorHandlingPolicy,
  RetryPolicy,
  RateLimitPolicy,
  ValidationResult,
} from '@metabuilder/workflow'

export type {
  BuiltInNodeType,
  INodeExecutor,
} from '@metabuilder/workflow'
