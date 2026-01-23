/**
 * TypeScript Type Definitions for Plugin Discovery System
 * @packageDocumentation
 */

import { INodeExecutor, ValidationResult } from '../types';
import { NodeExecutorPlugin, NodeExecutorRegistry } from './node-executor-registry';

/**
 * Plugin metadata extracted from package.json and metabuilder config
 */
export interface PluginMetadata {
  /**
   * Unique plugin identifier
   */
  id: string;

  /**
   * Plugin display name
   */
  name: string;

  /**
   * Semantic version string (major.minor.patch)
   */
  version: string;

  /**
   * Long-form plugin description
   */
  description?: string;

  /**
   * Plugin category (e.g., 'integration', 'utility', 'control-flow')
   */
  category?: string;

  /**
   * Plugin author or maintainer
   */
  author?: string;

  /**
   * Search keywords for discoverability
   */
  keywords?: string[];

  /**
   * Primary node type (for single-node plugins)
   */
  nodeType?: string;

  /**
   * Multiple node types (for multi-node plugins)
   */
  nodeTypes?: string[];

  /**
   * Workflow engine versions this plugin is compatible with
   */
  compatibleVersions?: string[];

  /**
   * Icon path or identifier for UI display
   */
  icon?: string;

  /**
   * URL or path to documentation
   */
  documentation?: string;

  /**
   * Path to main export file (relative to plugin root)
   */
  exportPath?: string;

  /**
   * Name of factory function to instantiate executor
   */
  factoryFunction?: string;

  /**
   * Runtime dependency map
   */
  dependencies?: Record<string, string>;

  /**
   * Peer dependency map
   */
  peerDependencies?: Record<string, string>;
}

/**
 * Discovered plugin with all metadata and state
 */
export interface DiscoveredPlugin {
  /**
   * Unique plugin ID
   */
  id: string;

  /**
   * Absolute path to plugin directory
   */
  path: string;

  /**
   * Extracted plugin metadata
   */
  metadata: PluginMetadata;

  /**
   * Loaded executor instance (may be undefined if not dynamically loaded)
   */
  executor?: INodeExecutor;

  /**
   * Whether plugin has been registered with the executor registry
   */
  registered: boolean;

  /**
   * List of node types provided by this plugin
   */
  nodeTypes: string[];
}

/**
 * Individual plugin discovery failure with details
 */
export interface PluginDiscoveryFailure {
  /**
   * ID of plugin that failed to discover
   */
  pluginId: string;

  /**
   * Path where plugin was expected
   */
  path: string;

  /**
   * Human-readable error message
   */
  error: string;

  /**
   * Machine-readable error code
   */
  code: string;

  /**
   * When the failure occurred
   */
  timestamp: Date;
}

/**
 * Complete results of a plugin discovery operation
 */
export interface PluginDiscoveryResult {
  /**
   * Whether discovery completed without fatal errors
   */
  success: boolean;

  /**
   * Total plugins found in discovery paths
   */
  pluginsFound: number;

  /**
   * Plugins successfully loaded with executors
   */
  pluginsLoaded: number;

  /**
   * Plugins that failed to load or validate
   */
  pluginsFailed: number;

  /**
   * Detailed failure information
   */
  failures: PluginDiscoveryFailure[];

  /**
   * All discovered plugins
   */
  plugins: DiscoveredPlugin[];

  /**
   * Discovery duration in milliseconds
   */
  duration: number;

  /**
   * When discovery started
   */
  timestamp: Date;
}

/**
 * Plugin compatibility check results
 */
export interface PluginCompatibility {
  /**
   * Whether plugin is compatible with current environment
   */
  compatible: boolean;

  /**
   * List of compatibility issues found
   */
  issues: string[];

  /**
   * Minimum compatible version
   */
  minVersion?: string;

  /**
   * Maximum compatible version
   */
  maxVersion?: string;
}

/**
 * Logger interface for plugin discovery operations
 */
export interface IPluginDiscoveryLogger {
  /**
   * Log debug-level message
   */
  debug(message: string, data?: Record<string, any>): void;

  /**
   * Log informational message
   */
  info(message: string, data?: Record<string, any>): void;

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, any>): void;

  /**
   * Log error message
   */
  error(message: string, data?: Record<string, any>): void;
}

/**
 * Plugin Discovery Engine
 * Scans filesystem for plugins, extracts metadata, validates compatibility,
 * and registers with the executor registry.
 */
export class PluginDiscoveryEngine {
  /**
   * Create a new plugin discovery engine
   */
  constructor(
    logger?: IPluginDiscoveryLogger,
    registry?: NodeExecutorRegistry
  );

  /**
   * Add a filesystem path to scan for plugins
   * @param pluginPath - Absolute or relative path to plugin directory
   */
  addDiscoveryPath(pluginPath: string): void;

  /**
   * Remove a filesystem path from plugin scanning
   * @param pluginPath - Path to remove
   */
  removeDiscoveryPath(pluginPath: string): void;

  /**
   * Scan all registered discovery paths for plugins
   * @returns Complete discovery results with all plugins and failures
   */
  discover(): Promise<PluginDiscoveryResult>;

  /**
   * Validate a discovered plugin's structure
   * @param plugin - Plugin to validate
   * @returns Validation result with errors and warnings
   */
  validatePlugin(plugin: DiscoveredPlugin): ValidationResult;

  /**
   * Register all discovered plugins with executor registry
   * @param registry - Optional registry to register with (uses default if not provided)
   * @returns Number of executors registered
   */
  registerDiscovered(registry?: NodeExecutorRegistry): Promise<number>;

  /**
   * Get all discovered plugins
   * @returns Array of all discovered plugins
   */
  getDiscoveredPlugins(): DiscoveredPlugin[];

  /**
   * Get a specific plugin by ID
   * @param pluginId - ID of plugin to retrieve
   * @returns Plugin if found, undefined otherwise
   */
  getPlugin(pluginId: string): DiscoveredPlugin | undefined;

  /**
   * Get only the registered plugins
   * @returns Array of registered plugins
   */
  getRegisteredPlugins(): DiscoveredPlugin[];

  /**
   * Get all discovery failures
   * @returns Array of failed plugins with error details
   */
  getFailures(): PluginDiscoveryFailure[];

  /**
   * Reload a specific plugin's metadata and module
   * @param pluginId - ID of plugin to reload
   * @returns Whether reload was successful
   */
  reloadPlugin(pluginId: string): Promise<boolean>;

  /**
   * Clear all discovered plugins and failures
   */
  clear(): void;
}

/**
 * Get the global plugin discovery engine instance
 * @param logger - Optional custom logger
 * @param registry - Optional custom executor registry
 * @returns Singleton plugin discovery engine
 */
export function getPluginDiscoveryEngine(
  logger?: IPluginDiscoveryLogger,
  registry?: NodeExecutorRegistry
): PluginDiscoveryEngine;

/**
 * Set the global plugin discovery engine instance
 * @param engine - New discovery engine to use globally
 */
export function setPluginDiscoveryEngine(engine: PluginDiscoveryEngine): void;

/**
 * Reset the global plugin discovery engine to null
 * Next call to getPluginDiscoveryEngine will create a new instance
 */
export function resetPluginDiscoveryEngine(): void;

/**
 * Default console-based logger implementation
 */
export class ConsoleLogger implements IPluginDiscoveryLogger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, data?: Record<string, any>): void;
}
