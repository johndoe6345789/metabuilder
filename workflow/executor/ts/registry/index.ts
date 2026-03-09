/**
 * Plugin Registry System - Main Exports
 *
 * @packageDocumentation
 */

// Core Registry
export {
  PluginRegistry,
  PluginMetadata,
  RegistryStats,
  ValidationResult,
  UnknownNodeTypeError,
  ValidationError,
  getPluginRegistry,
  setPluginRegistry,
  resetPluginRegistry
} from './plugin-registry';

// Node Executor Registry (backward-compatible wrapper)
export {
  NodeExecutorRegistry,
  NodeExecutorPlugin,
  getNodeExecutorRegistry,
  setNodeExecutorRegistry,
  resetNodeExecutorRegistry
} from './node-executor-registry';

// Plugin Discovery System
export {
  PluginDiscoverySystem,
  PluginMetadata as DiscoveredPluginMetadata,
  type DiscoveryConfig
} from './plugin-discovery';

// Plugin Initialization Framework
export {
  PluginInitializationFramework,
  type InitializationConfig as PluginInitConfig,
  type InitializationResult,
  type PluginInitializer
} from './plugin-initialization';

// Built-In Plugin Executors
export {
  PlaywrightExecutor,
  StorybookExecutor,
  PLUGIN_REGISTRY_CONFIG,
  setupPluginRegistry,
  getRegisteredPlugins,
  getPluginsByCategory,
  validateAllPlugins,
  getPluginRegistryStats
} from './plugin-registry-setup';
