/**
 * Node Executor Registry & Plugin System
 * Manages dynamic loading and registration of node executors
 *
 * This registry now uses the enhanced PluginRegistry for:
 * - Full metadata support with schema validation
 * - LRU caching with hit/miss tracking
 * - Performance metrics and statistics
 * - Error code categorization
 *
 * @see PluginRegistry for enhanced features
 */

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '../types';
import {
  PluginRegistry,
  PluginMetadata,
} from './plugin-registry';

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

/**
 * Node Executor Registry
 * Wrapper around PluginRegistry providing backward-compatible interface
 * while delegating to enhanced registry for new features
 */
export class NodeExecutorRegistry {
  private pluginRegistry: PluginRegistry;

  constructor() {
    this.pluginRegistry = new PluginRegistry();
  }

  /**
   * Register a node executor with optional plugin metadata
   * Converts NodeExecutorPlugin format to PluginMetadata format
   *
   * @param nodeType - Unique node type identifier
   * @param executor - Node executor implementation
   * @param plugin - Optional plugin with version and metadata
   */
  register(nodeType: string, executor: INodeExecutor, plugin?: NodeExecutorPlugin): void {
    if (plugin) {
      // Convert NodeExecutorPlugin to PluginMetadata
      const metadata: PluginMetadata = {
        nodeType: plugin.nodeType,
        version: plugin.version,
        category: plugin.metadata?.category || 'custom',
        description: plugin.metadata?.description,
        author: plugin.metadata?.author,
        icon: plugin.metadata?.icon
      };

      this.pluginRegistry.registerWithMetadata(nodeType, executor, metadata);
    } else {
      // Register with minimal metadata
      this.pluginRegistry.register(nodeType, executor);
    }
  }

  /**
   * Register multiple executors at once
   * @param executors - Array of executors to register
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
   * @param nodeType - Node type identifier
   * @returns Executor implementation or undefined
   */
  get(nodeType: string): INodeExecutor | undefined {
    return this.pluginRegistry.get(nodeType);
  }

  /**
   * Check if executor exists
   * @param nodeType - Node type identifier
   * @returns true if registered, false otherwise
   */
  has(nodeType: string): boolean {
    return this.pluginRegistry.has(nodeType);
  }

  /**
   * List all registered executors
   * @returns Array of node type identifiers
   */
  listExecutors(): string[] {
    return this.pluginRegistry.listExecutors();
  }

  /**
   * List all registered plugins
   * @returns Array of plugin metadata
   */
  listPlugins(): NodeExecutorPlugin[] {
    const plugins = this.pluginRegistry.listPlugins();
    return plugins.map((metadata) => ({
      nodeType: metadata.nodeType,
      version: metadata.version,
      executor: this.pluginRegistry.get(metadata.nodeType)!,
      metadata: {
        description: metadata.description,
        category: metadata.category,
        icon: metadata.icon,
        author: metadata.author
      }
    }));
  }

  /**
   * Get plugin metadata
   * @param nodeType - Node type identifier
   * @returns Plugin metadata or undefined
   */
  getPluginInfo(nodeType: string): NodeExecutorPlugin | undefined {
    const metadata = this.pluginRegistry.getMetadata(nodeType);
    if (!metadata) return undefined;

    const executor = this.pluginRegistry.get(nodeType);
    if (!executor) return undefined;

    return {
      nodeType: metadata.nodeType,
      version: metadata.version,
      executor,
      metadata: {
        description: metadata.description,
        category: metadata.category,
        icon: metadata.icon,
        author: metadata.author
      }
    };
  }

  /**
   * Execute node with registered executor
   * Uses enhanced registry for caching, metrics, and error handling
   *
   * @param nodeType - Node type identifier
   * @param node - Node configuration
   * @param context - Workflow context
   * @param state - Execution state
   * @returns Node result
   * @throws Error if executor not found or validation fails
   */
  async execute(
    nodeType: string,
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    return this.pluginRegistry.execute(nodeType, node, context, state);
  }

  /**
   * Unregister an executor
   * @param nodeType - Node type identifier
   * @returns true if removed, false if not found
   */
  unregister(nodeType: string): boolean {
    return this.pluginRegistry.unregister(nodeType);
  }

  /**
   * Clear all registered executors
   */
  clear(): void {
    this.pluginRegistry.clear();
  }

  /**
   * Get the underlying PluginRegistry for advanced features
   * Allows access to caching, statistics, and metadata validation
   *
   * @returns Internal PluginRegistry instance
   */
  getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }

  /**
   * Set the underlying PluginRegistry
   * Useful for testing or custom initialization
   *
   * @param registry - PluginRegistry instance
   */
  setPluginRegistry(registry: PluginRegistry): void {
    this.pluginRegistry = registry;
  }
}

/**
 * Global registry singleton
 */
let globalRegistry: NodeExecutorRegistry | null = null;

/**
 * Get or create the global node executor registry singleton
 * @returns Global NodeExecutorRegistry instance
 */
export function getNodeExecutorRegistry(): NodeExecutorRegistry {
  if (!globalRegistry) {
    globalRegistry = new NodeExecutorRegistry();
  }
  return globalRegistry;
}

/**
 * Set the global node executor registry singleton
 * @param registry - NodeExecutorRegistry instance
 */
export function setNodeExecutorRegistry(registry: NodeExecutorRegistry): void {
  globalRegistry = registry;
}

/**
 * Reset the global node executor registry singleton
 */
export function resetNodeExecutorRegistry(): void {
  globalRegistry = null;
}
