/**
 * MetaBuilder Workflow Engine v3.0.0
 * Enterprise-grade DAG workflow execution system
 *
 * @packageDocumentation
 */

// ============================================================================
// CORE EXECUTOR & EXECUTION
// ============================================================================

export { DAGExecutor, ExecutionMetrics, NodeExecutorFn } from './executor/dag-executor';
export * from './types';

// ============================================================================
// REGISTRY CLASSES & ERROR TYPES
// ============================================================================

export {
  NodeExecutorRegistry,
  NodeExecutorPlugin,
  getNodeExecutorRegistry,
  setNodeExecutorRegistry,
  resetNodeExecutorRegistry
} from './registry/node-executor-registry';

// ============================================================================
// MULTI-TENANT INTERFACES & SAFETY ENFORCEMENT
// ============================================================================

export type {
  MultiTenancyPolicy,
  WorkflowContext,
  CredentialBinding,
  TenantPolicy,
  TenantContext,
  MultiTenantErrorType
} from './types';

export { MultiTenantError } from './types';

export {
  TenantSafetyEnforcer,
  getTenantSafetyEnforcer,
  resetTenantSafetyEnforcer,
  type TenantAuditEntry
} from './multi-tenant/tenant-safety';

// ============================================================================
// VALIDATION & ERROR HANDLING
// ============================================================================

export {
  WorkflowValidator,
  validateWorkflow,
  type ValidationError,
  type WorkflowValidationResult
} from './utils/workflow-validator';

// ============================================================================
// UTILITIES & TEMPLATE ENGINE
// ============================================================================

export { PriorityQueue, QueueItem } from './utils/priority-queue';
export {
  interpolateTemplate,
  evaluateTemplate,
  TemplateContext,
  buildDefaultUtilities
} from './utils/template-engine';

// ============================================================================
// PLUGIN SYSTEM & FUNCTION ADAPTER
// ============================================================================

export {
  createExecutor,
  createExecutorsFromMap,
  registerPluginMap,
  type PluginFunction,
  type PluginMeta
} from './plugins/function-executor-adapter';

// ============================================================================
// BUILT-IN EXECUTORS & REGISTRY
// ============================================================================

export { registerBuiltInExecutors, getAvailableNodeTypes, getNodeTypesByCategory } from './plugins/index';

// Re-export class-based executors for direct use
export {
  dbalReadExecutor,
  dbalWriteExecutor,
  httpRequestExecutor,
  conditionExecutor,
  emailSendExecutor,
  setEmailService,
  webhookResponseExecutor,
  transformExecutor,
  waitExecutor,
  setVariableExecutor
} from './plugins/index';

// Re-export function-based plugin maps
export {
  stringPlugins,
  mathPlugins,
  logicPlugins,
  listPlugins,
  dictPlugins,
  convertPlugins,
  varPlugins
} from './plugins/index';

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize workflow engine with built-in executors
 * Call this once at application startup
 *
 * @example
 * ```typescript
 * import { initializeWorkflowEngine } from '@metabuilder/workflow';
 *
 * // In application startup
 * initializeWorkflowEngine();
 * ```
 */
export function initializeWorkflowEngine() {
  const { registerBuiltInExecutors } = require('./plugins/index');
  registerBuiltInExecutors();
  console.log('✓ MetaBuilder Workflow Engine v3.0.0 initialized');
}

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '3.0.0';
export const ENGINE_NAME = '@metabuilder/workflow';
