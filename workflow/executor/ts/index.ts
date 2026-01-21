/**
 * TypeScript Plugin Executor
 *
 * Default runtime for TypeScript/JavaScript plugins.
 * Uses direct module import for maximum performance.
 */

import type { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../../core/types';

export interface TypeScriptPluginLoader {
  load(pluginPath: string): Promise<INodeExecutor>;
}

/**
 * Load a TypeScript plugin from path
 */
export async function loadTypeScriptPlugin(pluginPath: string): Promise<INodeExecutor> {
  // Dynamic import for the plugin module
  const module = await import(pluginPath);

  // Find the executor class (convention: {PluginName}Executor)
  const executorKey = Object.keys(module).find(key => key.endsWith('Executor'));
  if (!executorKey) {
    throw new Error(`No executor found in plugin: ${pluginPath}`);
  }

  const ExecutorClass = module[executorKey];
  return new ExecutorClass();
}

/**
 * TypeScript plugin executor wrapper
 */
export class TypeScriptExecutor {
  private plugins: Map<string, INodeExecutor> = new Map();

  async loadPlugin(nodeType: string, pluginPath: string): Promise<void> {
    const executor = await loadTypeScriptPlugin(pluginPath);
    this.plugins.set(nodeType, executor);
  }

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const executor = this.plugins.get(node.nodeType);
    if (!executor) {
      throw new Error(`No TypeScript executor registered for: ${node.nodeType}`);
    }
    return executor.execute(node, context, state);
  }

  hasPlugin(nodeType: string): boolean {
    return this.plugins.has(nodeType);
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
