/**
 * Function Executor Adapter
 * Wraps simple plugin functions into INodeExecutor interface
 * @packageDocumentation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '../types';

/**
 * Type for plugin functions that follow the standard signature
 */
export type PluginFunction = (
  node: WorkflowNode,
  context: WorkflowContext,
  state: ExecutionState
) => Promise<NodeResult>;

/**
 * Plugin metadata for documentation and discovery
 */
export interface PluginMeta {
  description?: string;
  category?: string;
  requiredParams?: string[];
  optionalParams?: string[];
}

/**
 * Creates an INodeExecutor from a simple function
 * This adapter allows function-based plugins to be used with the registry
 */
export function createExecutor(
  nodeType: string,
  fn: PluginFunction,
  meta?: PluginMeta
): INodeExecutor {
  return {
    nodeType,
    async execute(
      node: WorkflowNode,
      context: WorkflowContext,
      state: ExecutionState
    ): Promise<NodeResult> {
      return fn(node, context, state);
    },
    validate(node: WorkflowNode): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required parameters if specified
      if (meta?.requiredParams) {
        for (const param of meta.requiredParams) {
          if (!(param in node.parameters)) {
            errors.push(`Missing required parameter: ${param}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    }
  };
}

/**
 * Batch create executors from a plugin map
 * @param plugins Map of nodeType -> function or class constructor
 * @param category Category name for all plugins
 */
export function createExecutorsFromMap(
  plugins: Record<string, PluginFunction | (new () => any)>,
  category?: string
): INodeExecutor[] {
  return Object.entries(plugins).map(([nodeType, fnOrClass]) => {
    if (typeof fnOrClass === 'function' && fnOrClass.prototype && fnOrClass.prototype.execute) {
      // Class constructor - instantiate and wrap
      const instance = new (fnOrClass as new () => any)();
      return createExecutor(nodeType, (node, context, state) => {
        const result = instance.execute({ node, context, state });
        return Promise.resolve(result);
      }, { category });
    }
    return createExecutor(nodeType, fnOrClass as PluginFunction, { category });
  });
}

/**
 * Register a map of plugins to the registry
 */
export function registerPluginMap(
  registry: { register(nodeType: string, executor: INodeExecutor): void },
  plugins: Record<string, PluginFunction | (new () => any)>,
  category?: string
): void {
  const executors = createExecutorsFromMap(plugins, category);
  for (const executor of executors) {
    registry.register(executor.nodeType, executor);
  }
}
