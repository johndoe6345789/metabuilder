/**
 * Workflow Integration Index
 *
 * Centralized exports for workflow functionality
 * - Service layer for execution
 * - Validation and loading (WorkflowLoaderV2)
 * - Caching infrastructure
 * - Types and interfaces
 * - React hooks
 * - Components
 */

// Service layer
export { WorkflowService } from './workflow-service'

// Validation and loading (WorkflowLoaderV2)
export {
  WorkflowLoaderV2,
  ValidationCache,
  getWorkflowLoader,
  resetWorkflowLoader,
  type WorkflowLoaderV2Options,
  type ExtendedValidationResult,
} from './workflow-loader-v2'

// Error handling and diagnostics
export {
  WorkflowErrorHandler,
  getWorkflowErrorHandler,
  resetWorkflowErrorHandler,
  WorkflowErrorCode,
} from './workflow-error-handler'

export type {
  ErrorContext,
  ErrorDiagnostics,
  FormattedError,
} from './workflow-error-handler'

// Multi-tenant context builder
export {
  MultiTenantContextBuilder,
  createContextFromRequest,
  canUserAccessWorkflow,
  extractRequestContext,
  sanitizeContextForLogging,
  createMockContext,
} from './multi-tenant-context'

export type {
  RequestContext,
  MultiTenantMetadata,
  ContextBuilderOptions,
  ExtendedWorkflowContext,
  ContextValidationResult,
  ContextValidationError,
  ContextValidationWarning,
} from './multi-tenant-context'

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
  WorkflowValidationResult,
  ValidationError,
} from '@metabuilder/workflow'

export type {
  BuiltInNodeType,
  INodeExecutor,
} from '@metabuilder/workflow'
