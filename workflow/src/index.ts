/**
 * MetaBuilder Workflow Engine v3.0.0
 * Enterprise-grade DAG workflow execution system
 *
 * @packageDocumentation
 */

// Core exports
export { DAGExecutor, ExecutionMetrics, NodeExecutorFn } from './executor/dag-executor';
export * from './types';

// Registry and plugins
export {
  NodeExecutorRegistry,
  NodeExecutorPlugin,
  getNodeExecutorRegistry,
  setNodeExecutorRegistry,
  resetNodeExecutorRegistry
} from './registry/node-executor-registry';
export { registerBuiltInExecutors } from './plugins/index';

// Utilities
export { PriorityQueue, QueueItem } from './utils/priority-queue';
export {
  interpolateTemplate,
  evaluateTemplate,
  TemplateContext,
  buildDefaultUtilities
} from './utils/template-engine';

// Built-in executors (for direct use)
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

/**
 * Initialize workflow engine with built-in executors
 * Call this once at application startup
 */
export function initializeWorkflowEngine() {
  const { registerBuiltInExecutors } = require('./plugins/index');
  registerBuiltInExecutors();
  console.log('✓ MetaBuilder Workflow Engine v3.0.0 initialized');
}

// Version
export const VERSION = '3.0.0';
export const ENGINE_NAME = '@metabuilder/workflow';
