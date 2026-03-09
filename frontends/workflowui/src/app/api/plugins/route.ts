/**
 * Plugin Registry API
 * Serves available workflow plugins to the frontend
 * GET /api/plugins - returns all plugins with categories and language grouping
 */

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface NodeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
}

interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface PluginManifest {
  category: CategoryDefinition;
  nodes: NodeDefinition[];
}

interface NodeTypeDefinition extends NodeDefinition {
  type: string;
  category: string;
  categoryName: string;
  color: string;
  language: string;
}

// =============================================================================
// DEFAULT CATEGORIES
// =============================================================================

const DEFAULT_CATEGORIES: Record<string, CategoryDefinition> = {
  triggers: { id: 'triggers', name: 'Triggers', color: '#ff6b6b', icon: 'zap' },
  actions: { id: 'actions', name: 'Actions', color: '#4ecdc4', icon: 'play' },
  logic: { id: 'logic', name: 'Logic', color: '#45b7d1', icon: 'git-branch' },
  math: { id: 'math', name: 'Math', color: '#f39c12', icon: 'calculator' },
  string: { id: 'string', name: 'String', color: '#9b59b6', icon: 'type' },
  data: { id: 'data', name: 'Data', color: '#96ceb4', icon: 'database' },
  integrations: { id: 'integrations', name: 'Integrations', color: '#dda0dd', icon: 'plug' },
  utils: { id: 'utils', name: 'Utilities', color: '#ffeaa7', icon: 'tool' },
  // Python-specific categories
  core: { id: 'core', name: 'AI Core', color: '#e74c3c', icon: 'cpu' },
  tools: { id: 'tools', name: 'Dev Tools', color: '#3498db', icon: 'terminal' },
  web: { id: 'web', name: 'Web', color: '#2ecc71', icon: 'globe' },
  test: { id: 'test', name: 'Testing', color: '#9b59b6', icon: 'check-circle' },
  backend: { id: 'backend', name: 'Backend', color: '#34495e', icon: 'server' },
};

// =============================================================================
// PLUGIN SCANNER
// =============================================================================

function scanPluginDirectory(
  baseDir: string,
  language: string
): { nodes: NodeTypeDefinition[]; categories: Record<string, CategoryDefinition> } {
  const nodes: NodeTypeDefinition[] = [];
  const categories: Record<string, CategoryDefinition> = {};

  if (!fs.existsSync(baseDir)) {
    return { nodes, categories };
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginPath = path.join(baseDir, entry.name);
    const nodesJsonPath = path.join(pluginPath, 'nodes.json');
    const packageJsonPath = path.join(pluginPath, 'package.json');

    // Check for nodes.json (preferred)
    if (fs.existsSync(nodesJsonPath)) {
      try {
        const manifest: PluginManifest = JSON.parse(fs.readFileSync(nodesJsonPath, 'utf-8'));
        categories[manifest.category.id] = manifest.category;

        for (const node of manifest.nodes) {
          nodes.push({
            ...node,
            type: node.id.split('.')[0] || 'unknown',
            category: manifest.category.id,
            categoryName: manifest.category.name,
            color: manifest.category.color,
            language,
          });
        }
      } catch (err) {
        console.warn(`Failed to load nodes.json at ${nodesJsonPath}:`, err);
      }
    } else if (fs.existsSync(packageJsonPath)) {
      // Fallback: generate from package.json metadata
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.metadata) {
          const meta = pkg.metadata;
          const categoryId = meta.category || 'utils';
          const classes = meta.classes || [];
          const categoryDef = DEFAULT_CATEGORIES[categoryId] || DEFAULT_CATEGORIES.utils;
          categories[categoryId] = categoryDef;

          for (const className of classes) {
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
              type: categoryId,
              category: categoryId,
              categoryName: categoryDef.name,
              color: categoryDef.color,
              language,
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to load package.json at ${packageJsonPath}:`, err);
      }
    }

    // Check subdirectories (for nested plugins)
    const subResult = scanPluginDirectory(pluginPath, language);
    nodes.push(...subResult.nodes);
    Object.assign(categories, subResult.categories);
  }

  return { nodes, categories };
}

// =============================================================================
// API HANDLER
// =============================================================================

// Check if Python backend is available
async function checkPythonBackendHealth(): Promise<boolean> {
  try {
    // Try to connect to the Python workflow executor
    // This could be a Flask server or just check if Python is available
    const pythonPort = process.env.PYTHON_BACKEND_PORT || '5000';
    const response = await fetch(`http://localhost:${pythonPort}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    // Backend not available
    return false;
  }
}

export async function GET() {
  const workflowDir = path.resolve(process.cwd(), '../workflow/plugins');
  const languages = ['ts', 'python', 'go', 'rust', 'mojo'];

  const allNodes: NodeTypeDefinition[] = [];
  const allCategories: Record<string, CategoryDefinition> = { ...DEFAULT_CATEGORIES };
  const nodesByLanguage: Record<string, NodeTypeDefinition[]> = {};
  const nodesByCategory: Record<string, NodeTypeDefinition[]> = {};
  const languageHealth: Record<string, boolean> = {};

  // Check Python backend health
  const pythonHealthy = await checkPythonBackendHealth();
  languageHealth['python'] = pythonHealthy;
  languageHealth['ts'] = true; // TypeScript always available (runs in same process)

  for (const lang of languages) {
    const langDir = path.join(workflowDir, lang);
    const { nodes, categories } = scanPluginDirectory(langDir, lang);

    if (nodes.length > 0) {
      nodesByLanguage[lang] = nodes;
      allNodes.push(...nodes);
      Object.assign(allCategories, categories);
    }
  }

  // Group by category
  for (const node of allNodes) {
    if (!nodesByCategory[node.category]) {
      nodesByCategory[node.category] = [];
    }
    nodesByCategory[node.category].push(node);
  }

  return NextResponse.json({
    categories: Object.values(allCategories),
    nodes: allNodes,
    nodesByCategory,
    nodesByLanguage,
    languages: Object.keys(nodesByLanguage),
    languageHealth,
    totalNodes: allNodes.length,
  });
}
