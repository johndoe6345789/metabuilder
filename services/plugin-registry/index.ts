/**
 * Plugin Registry Service
 * Scans workflow/plugins/ folders and loads node definitions dynamically
 * Supports multiple languages (ts, python, go) with proper grouping
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

export interface NodeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface PluginManifest {
  category: CategoryDefinition;
  nodes: NodeDefinition[];
}

export interface LoadedPlugin {
  language: 'ts' | 'python' | 'go' | 'rust' | 'mojo';
  pluginPath: string;
  packageJson: Record<string, unknown>;
  manifest: PluginManifest | null;
}

export interface PluginRegistry {
  categories: Record<string, CategoryDefinition>;
  nodes: NodeTypeDefinition[];
  nodesByCategory: Record<string, NodeTypeDefinition[]>;
  nodesByLanguage: Record<string, NodeTypeDefinition[]>;
  plugins: LoadedPlugin[];
}

export interface NodeTypeDefinition extends NodeDefinition {
  type: string;
  category: string;
  categoryName: string;
  color: string;
  language: string;
  pluginPath: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SUPPORTED_LANGUAGES = ['ts', 'python', 'go', 'rust', 'mojo'] as const;

const DEFAULT_CATEGORIES: Record<string, CategoryDefinition> = {
  triggers: { id: 'triggers', name: 'Triggers', color: '#ff6b6b', icon: 'zap' },
  actions: { id: 'actions', name: 'Actions', color: '#4ecdc4', icon: 'play' },
  logic: { id: 'logic', name: 'Logic', color: '#45b7d1', icon: 'git-branch' },
  math: { id: 'math', name: 'Math', color: '#f39c12', icon: 'calculator' },
  string: { id: 'string', name: 'String', color: '#9b59b6', icon: 'type' },
  data: { id: 'data', name: 'Data', color: '#96ceb4', icon: 'database' },
  integrations: { id: 'integrations', name: 'Integrations', color: '#dda0dd', icon: 'plug' },
  utils: { id: 'utils', name: 'Utilities', color: '#ffeaa7', icon: 'tool' },
};

// =============================================================================
// PLUGIN SCANNER
// =============================================================================

/**
 * Scan a directory for plugin folders (those with package.json)
 */
function scanPluginDirectory(baseDir: string, language: string): LoadedPlugin[] {
  const plugins: LoadedPlugin[] = [];

  if (!fs.existsSync(baseDir)) {
    return plugins;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginPath = path.join(baseDir, entry.name);
    const packageJsonPath = path.join(pluginPath, 'package.json');
    const nodesJsonPath = path.join(pluginPath, 'nodes.json');

    // Check for package.json
    if (!fs.existsSync(packageJsonPath)) {
      // Check subdirectories (for nested plugins like integration/email/*)
      const subPlugins = scanPluginDirectory(pluginPath, language);
      plugins.push(...subPlugins);
      continue;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Load nodes.json manifest if it exists
      let manifest: PluginManifest | null = null;
      if (fs.existsSync(nodesJsonPath)) {
        manifest = JSON.parse(fs.readFileSync(nodesJsonPath, 'utf-8'));
      }

      plugins.push({
        language: language as LoadedPlugin['language'],
        pluginPath,
        packageJson,
        manifest,
      });
    } catch (err) {
      console.warn(`Failed to load plugin at ${pluginPath}:`, err);
    }
  }

  return plugins;
}

/**
 * Convert a plugin to node type definitions
 */
function pluginToNodeTypes(plugin: LoadedPlugin): NodeTypeDefinition[] {
  const nodes: NodeTypeDefinition[] = [];

  if (plugin.manifest) {
    const category = plugin.manifest.category;

    for (const node of plugin.manifest.nodes) {
      nodes.push({
        ...node,
        type: node.id.split('.')[0] || 'unknown',
        category: category.id,
        categoryName: category.name,
        color: category.color,
        language: plugin.language,
        pluginPath: plugin.pluginPath,
      });
    }
  } else if (plugin.packageJson.metadata) {
    // Fallback: generate from package.json metadata
    const meta = plugin.packageJson.metadata as Record<string, unknown>;
    const category = (meta.category as string) || 'utils';
    const classes = (meta.classes as string[]) || [];
    const categoryDef = DEFAULT_CATEGORIES[category] || DEFAULT_CATEGORIES.utils;

    for (const className of classes) {
      // Convert class name to node type (e.g., LogicAnd -> logic.and)
      const nodeType = className
        .replace(/([A-Z])/g, '.$1')
        .toLowerCase()
        .replace(/^\./, '');

      nodes.push({
        id: nodeType,
        name: className.replace(/([A-Z])/g, ' $1').trim(),
        description: `${className} operation`,
        icon: categoryDef.icon,
        inputs: ['main'],
        outputs: ['main'],
        defaultConfig: {},
        type: category,
        category: category,
        categoryName: categoryDef.name,
        color: categoryDef.color,
        language: plugin.language,
        pluginPath: plugin.pluginPath,
      });
    }
  }

  return nodes;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Load all plugins from the workflow/plugins directory
 */
export function loadPluginRegistry(workflowDir: string): PluginRegistry {
  const pluginsDir = path.join(workflowDir, 'plugins');
  const allPlugins: LoadedPlugin[] = [];

  // Scan each language directory
  for (const language of SUPPORTED_LANGUAGES) {
    const langDir = path.join(pluginsDir, language);
    const plugins = scanPluginDirectory(langDir, language);
    allPlugins.push(...plugins);
  }

  // Build registry
  const categories: Record<string, CategoryDefinition> = { ...DEFAULT_CATEGORIES };
  const nodes: NodeTypeDefinition[] = [];
  const nodesByCategory: Record<string, NodeTypeDefinition[]> = {};
  const nodesByLanguage: Record<string, NodeTypeDefinition[]> = {};

  for (const plugin of allPlugins) {
    const pluginNodes = pluginToNodeTypes(plugin);

    for (const node of pluginNodes) {
      nodes.push(node);

      // Index by category
      if (!nodesByCategory[node.category]) {
        nodesByCategory[node.category] = [];
      }
      nodesByCategory[node.category].push(node);

      // Index by language
      if (!nodesByLanguage[node.language]) {
        nodesByLanguage[node.language] = [];
      }
      nodesByLanguage[node.language].push(node);

      // Add category if from manifest
      if (plugin.manifest) {
        categories[plugin.manifest.category.id] = plugin.manifest.category;
      }
    }
  }

  return {
    categories,
    nodes,
    nodesByCategory,
    nodesByLanguage,
    plugins: allPlugins,
  };
}

/**
 * Get registry as JSON (for API responses)
 */
export function getRegistryAsJSON(registry: PluginRegistry): {
  categories: CategoryDefinition[];
  nodes: NodeTypeDefinition[];
  languages: string[];
} {
  return {
    categories: Object.values(registry.categories),
    nodes: registry.nodes,
    languages: Object.keys(registry.nodesByLanguage),
  };
}

// =============================================================================
// CLI (for testing)
// =============================================================================

if (require.main === module) {
  const workflowDir = path.resolve(__dirname, '../../workflow');
  const registry = loadPluginRegistry(workflowDir);

  console.log('=== Plugin Registry ===');
  console.log(`Total plugins: ${registry.plugins.length}`);
  console.log(`Total nodes: ${registry.nodes.length}`);
  console.log(`Categories: ${Object.keys(registry.categories).join(', ')}`);
  console.log(`Languages: ${Object.keys(registry.nodesByLanguage).join(', ')}`);
  console.log('\nNodes by language:');
  for (const [lang, nodes] of Object.entries(registry.nodesByLanguage)) {
    console.log(`  ${lang}: ${nodes.length} nodes`);
  }
  console.log('\nNodes by category:');
  for (const [cat, nodes] of Object.entries(registry.nodesByCategory)) {
    console.log(`  ${cat}: ${nodes.length} nodes`);
  }
}
