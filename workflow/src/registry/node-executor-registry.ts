/**
 * Node Executor Registry & Plugin System
 * Manages dynamic loading and registration of node executors
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';

export interface NodeExecutorPlugin {
  nodeType: string;
  version: string;
  executor: INodeExecutor;
  metadata?: {
    description?: string;
    category?: string;
    icon?: string;
    author?: string;
  };
}

export class NodeExecutorRegistry {
  private executors: Map<string, INodeExecutor> = new Map();
  private plugins: Map<string, NodeExecutorPlugin> = new Map();

  /**
   * Register a node executor
   */
  register(nodeType: string, executor: INodeExecutor, plugin?: NodeExecutorPlugin): void {
    if (this.executors.has(nodeType)) {
      console.warn(`Overwriting existing executor for node type: ${nodeType}`);
    }

    this.executors.set(nodeType, executor);

    if (plugin) {
      this.plugins.set(nodeType, plugin);
      console.log(`Registered plugin: ${plugin.nodeType} v${plugin.version}`);
    }
  }

  /**
   * Register multiple executors at once
   */
  registerBatch(
    executors: Array<{ nodeType: string; executor: INodeExecutor; plugin?: NodeExecutorPlugin }>
  ): void {
    executors.forEach(({ nodeType, executor, plugin }) => {
      this.register(nodeType, executor, plugin);
    });
  }

  /**
   * Get executor for node type
   */
  get(nodeType: string): INodeExecutor | undefined {
    return this.executors.get(nodeType);
  }

  /**
   * Check if executor exists
   */
  has(nodeType: string): boolean {
    return this.executors.has(nodeType);
  }

  /**
   * List all registered executors
   */
  listExecutors(): string[] {
    return Array.from(this.executors.keys());
  }

  /**
   * List all registered plugins
   */
  listPlugins(): NodeExecutorPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin metadata
   */
  getPluginInfo(nodeType: string): NodeExecutorPlugin | undefined {
    return this.plugins.get(nodeType);
  }

  /**
   * Execute node with registered executor
   */
  async execute(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const executor = this.get(nodeType);

    if (!executor) {
      throw new Error(`No executor registered for node type: ${nodeType}`);
    }

    // Validate node before execution
    const validation = executor.validate(node);
    if (!validation.valid) {
      throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn(`Node validation warnings for ${node.id}:`, validation.warnings);
    }

    // Execute node
    return await executor.execute(node, context, state);
  }

  /**
   * Unregister an executor
   */
  unregister(nodeType: string): boolean {
    const had = this.executors.has(nodeType);
    this.executors.delete(nodeType);
    this.plugins.delete(nodeType);
    return had;
  }

  /**
   * Clear all registered executors
   */
  clear(): void {
    this.executors.clear();
    this.plugins.clear();
  }
}

/**
 * Global registry singleton
 */
let globalRegistry: NodeExecutorRegistry | null = null;

export function getNodeExecutorRegistry(): NodeExecutorRegistry {
  if (!globalRegistry) {
    globalRegistry = new NodeExecutorRegistry();
  }
  return globalRegistry;
}

export function setNodeExecutorRegistry(registry: NodeExecutorRegistry): void {
  globalRegistry = registry;
}

export function resetNodeExecutorRegistry(): void {
  globalRegistry = null;
}
