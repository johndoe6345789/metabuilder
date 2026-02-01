/**
 * Node Discovery System
 *
 * Automatically discovers and validates plugins in the codebase.
 * Scans package.json files and generates node type registry entries.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'
import type { NodeTypeDefinition, PluginDefinition, NodeRegistry } from './types'

export interface PluginPackageJson {
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  metaBuilder?: {
    nodeTypes?: string[]
    nodeTypesPath?: string
    entryPoint?: string
  }
}

export class NodeDiscovery {
  /**
   * Discover all plugins in the codebase
   */
  async discoverPlugins(baseDir: string = process.cwd()): Promise<PluginDefinition[]> {
    const plugins: PluginDefinition[] = []

    try {
      // Find all package.json files in packages and plugins directories
      const packageFiles = await glob('packages/*/package.json', { cwd: baseDir })
      const pluginFiles = await glob('workflow/plugins/*/package.json', { cwd: baseDir })

      const allFiles = [...packageFiles, ...pluginFiles]

      for (const file of allFiles) {
        const filePath = path.join(baseDir, file)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const packageJson: PluginPackageJson = JSON.parse(content)

          // Check if this package has MetaBuilder node type configuration
          if (packageJson.metaBuilder?.nodeTypes) {
            const plugin = this.createPluginDefinition(packageJson, filePath, baseDir)
            plugins.push(plugin)
          }
        } catch (error) {
          console.warn(`Failed to process ${file}:`, error instanceof Error ? error.message : String(error))
        }
      }

      return plugins
    } catch (error) {
      throw new Error(`Plugin discovery failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Discover node types in a specific directory
   */
  async discoverNodeTypes(pluginDir: string): Promise<NodeTypeDefinition[]> {
    const nodeTypes: NodeTypeDefinition[] = []

    try {
      // Look for node type definitions
      const nodeTypeFiles = await glob('**/node-type.json', { cwd: pluginDir })

      for (const file of nodeTypeFiles) {
        const filePath = path.join(pluginDir, file)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const nodeType: NodeTypeDefinition = JSON.parse(content)
          nodeTypes.push(nodeType)
        } catch (error) {
          console.warn(`Failed to load node type ${file}:`, error instanceof Error ? error.message : String(error))
        }
      }

      return nodeTypes
    } catch (error) {
      throw new Error(
        `Node type discovery failed for ${pluginDir}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Validate plugin structure
   */
  async validatePlugin(pluginDir: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Check for package.json
      const packageJsonPath = path.join(pluginDir, 'package.json')
      try {
        await fs.access(packageJsonPath)
      } catch {
        errors.push(`Missing package.json in ${pluginDir}`)
      }

      // Check for entry point if specified
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson: PluginPackageJson = JSON.parse(packageJsonContent)

      if (packageJson.metaBuilder?.entryPoint) {
        const entryPointPath = path.join(pluginDir, packageJson.metaBuilder.entryPoint)
        try {
          await fs.access(entryPointPath)
        } catch {
          errors.push(`Entry point not found: ${packageJson.metaBuilder.entryPoint}`)
        }
      }

      // Check for node type definitions
      if (packageJson.metaBuilder?.nodeTypes) {
        for (const nodeType of packageJson.metaBuilder.nodeTypes) {
          // Try to find node type definition file
          const nodeTypeFile = path.join(pluginDir, `${nodeType}.json`)
          try {
            await fs.access(nodeTypeFile)
          } catch {
            // Node type might be defined in entry point or other file
            console.warn(`Node type definition not found: ${nodeType}`)
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
      }
    }
  }

  /**
   * Generate registry from discovered plugins
   */
  async generateRegistry(baseDir: string = process.cwd()): Promise<NodeRegistry> {
    const plugins = await this.discoverPlugins(baseDir)
    const allNodeTypes: NodeTypeDefinition[] = []
    const categories = new Map<string, string>()

    // Discover node types from each plugin
    for (const plugin of plugins) {
      const pluginDir = path.join(baseDir, path.dirname(`packages/${plugin.id}/package.json`))

      try {
        const nodeTypes = await this.discoverNodeTypes(pluginDir)
        allNodeTypes.push(...nodeTypes)

        // Collect categories
        for (const nodeType of nodeTypes) {
          categories.set(nodeType.group, nodeType.group)
        }
      } catch (error) {
        console.warn(`Failed to discover node types for ${plugin.id}:`, error)
      }
    }

    // Build category definitions
    const categoryDefs = Array.from(categories.values()).map((cat) => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      description: `${cat.charAt(0).toUpperCase() + cat.slice(1)} node types`,
    }))

    return {
      version: '1.0.0',
      description: 'Auto-generated MetaBuilder Node Registry',
      nodeTypes: allNodeTypes,
      categories: categoryDefs,
      plugins,
      lastUpdated: new Date().toISOString(),
    }
  }

  // ====== Private Helper Methods ======

  private createPluginDefinition(
    packageJson: PluginPackageJson,
    filePath: string,
    baseDir: string
  ): PluginDefinition {
    const pluginDir = path.dirname(filePath)
    const relativeDir = path.relative(baseDir, pluginDir)
    const pluginId = packageJson.name || path.basename(relativeDir)

    return {
      id: pluginId,
      name: packageJson.name || pluginId,
      version: packageJson.version || '1.0.0',
      nodeTypes: packageJson.metaBuilder?.nodeTypes || [],
      languages: this.detectLanguages(pluginDir),
      repository: this.detectRepository(pluginDir, baseDir),
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license,
    }
  }

  private detectLanguages(pluginDir: string): string[] {
    const languages: string[] = []

    // Simple heuristic: check for file extensions
    // This is synchronous check, so just return defaults
    // In production, you'd want to make this async

    return languages.length > 0 ? languages : ['ts']
  }

  private detectRepository(pluginDir: string, baseDir: string): string {
    // Check if plugin is in packages/ (internal)
    const relPath = path.relative(baseDir, pluginDir)
    if (relPath.startsWith('packages/')) {
      return 'internal'
    }

    // Check if plugin is in workflow/plugins/ (internal)
    if (relPath.startsWith('workflow/plugins/')) {
      return 'internal'
    }

    // Default to internal
    return 'internal'
  }
}

/**
 * Discover and print all available node types
 */
export async function discoverAndPrint(baseDir?: string): Promise<void> {
  const discovery = new NodeDiscovery()

  console.log('\n📦 Discovering plugins...\n')

  const plugins = await discovery.discoverPlugins(baseDir)
  console.log(`Found ${plugins.length} plugins:\n`)

  for (const plugin of plugins) {
    console.log(`  📌 ${plugin.name} (${plugin.version})`)
    if (plugin.description) {
      console.log(`     ${plugin.description}`)
    }
    console.log(`     Node types: ${plugin.nodeTypes.join(', ')}`)
    console.log()
  }

  console.log(`\n🔍 Generating registry...\n`)
  const registry = await discovery.generateRegistry(baseDir)

  console.log(`Registry Summary:`)
  console.log(`  Total node types: ${registry.nodeTypes.length}`)
  console.log(`  Total categories: ${registry.categories.length}`)
  console.log(`  Total plugins: ${registry.plugins.length}`)
  console.log()

  if (registry.categories.length > 0) {
    console.log(`Categories:`)
    for (const cat of registry.categories) {
      console.log(`  - ${cat.name}`)
    }
    console.log()
  }

  return
}

/**
 * CLI entrypoint
 */
if (require.main === module) {
  discoverAndPrint(process.cwd()).catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
}
