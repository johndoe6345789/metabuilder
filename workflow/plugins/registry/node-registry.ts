/**
 * Node Registry Implementation
 *
 * Manages node type definitions, validation, and execution constraint enforcement.
 * Provides discovery and lookup for all available node types in the system.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type {
  NodeRegistry,
  NodeTypeDefinition,
  NodeTypeQuery,
  PluginDefinition,
  RegistryStats,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PropertyDefinition,
} from './types'

export class NodeRegistryManager {
  private registry: NodeRegistry
  private nodeTypeMap: Map<string, NodeTypeDefinition>
  private pluginMap: Map<string, PluginDefinition>
  private categoryMap: Map<string, string[]>

  constructor() {
    this.registry = {
      version: '1.0.0',
      nodeTypes: [],
      categories: [],
      plugins: [],
    }
    this.nodeTypeMap = new Map()
    this.pluginMap = new Map()
    this.categoryMap = new Map()
  }

  /**
   * Load registry from JSON file
   */
  async loadRegistry(registryPath: string): Promise<void> {
    try {
      const content = await fs.readFile(registryPath, 'utf-8')
      this.registry = JSON.parse(content) as NodeRegistry
      this.buildMaps()
    } catch (error) {
      throw new Error(`Failed to load registry: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Build internal lookup maps for fast access
   */
  private buildMaps(): void {
    this.nodeTypeMap.clear()
    this.pluginMap.clear()
    this.categoryMap.clear()

    // Build node type map
    for (const nodeType of this.registry.nodeTypes) {
      this.nodeTypeMap.set(nodeType.name, nodeType)
    }

    // Build plugin map
    for (const plugin of this.registry.plugins) {
      this.pluginMap.set(plugin.id, plugin)
    }

    // Build category to node types map
    for (const nodeType of this.registry.nodeTypes) {
      const group = nodeType.group
      if (!this.categoryMap.has(group)) {
        this.categoryMap.set(group, [])
      }
      this.categoryMap.get(group)!.push(nodeType.name)
    }
  }

  /**
   * Get node type definition by name
   */
  getNodeType(nodeTypeName: string): NodeTypeDefinition | undefined {
    return this.nodeTypeMap.get(nodeTypeName)
  }

  /**
   * Query for node type existence and details
   */
  queryNodeType(nodeTypeName: string): NodeTypeQuery {
    const definition = this.nodeTypeMap.get(nodeTypeName)
    if (!definition) {
      return {
        nodeType: nodeTypeName,
        found: false,
      }
    }

    // Find plugin for this node type
    let plugin: PluginDefinition | undefined
    for (const p of this.registry.plugins) {
      if (p.nodeTypes.includes(nodeTypeName)) {
        plugin = p
        break
      }
    }

    return {
      nodeType: nodeTypeName,
      found: true,
      definition,
      plugin,
    }
  }

  /**
   * Get all node types in a category
   */
  getNodesByCategory(categoryId: string): NodeTypeDefinition[] {
    const nodeNames = this.categoryMap.get(categoryId) || []
    return nodeNames.map((name) => this.nodeTypeMap.get(name)!).filter(Boolean)
  }

  /**
   * Get all available categories
   */
  getCategories() {
    return this.registry.categories
  }

  /**
   * Get all plugins
   */
  getPlugins(): PluginDefinition[] {
    return this.registry.plugins
  }

  /**
   * Validate node properties against node type definition
   */
  validateNodeProperties(
    nodeTypeName: string,
    properties: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const nodeType = this.getNodeType(nodeTypeName)
    if (!nodeType) {
      return {
        valid: false,
        errors: [`Node type not found: ${nodeTypeName}`],
      }
    }

    const errors: string[] = []

    // Check required properties
    for (const prop of nodeType.properties) {
      if (prop.required && !(prop.name in properties)) {
        errors.push(`Missing required property: ${prop.displayName}`)
      }

      // Type validation
      if (prop.name in properties) {
        const value = properties[prop.name]
        const expectedType = this.getPropertyTypeString(prop.type)
        const actualType = typeof value

        if (!this.isTypeCompatible(actualType, expectedType)) {
          errors.push(
            `Property ${prop.displayName} has wrong type. Expected ${expectedType}, got ${actualType}`
          )
        }

        // Enum validation
        if (prop.type === 'options' && prop.options) {
          const validValues = prop.options.map((o) => o.value)
          if (!validValues.includes(value)) {
            errors.push(`Property ${prop.displayName} has invalid value: ${value}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate execution constraints are met
   */
  validateExecutionConstraints(nodeTypeName: string): { valid: boolean; constraints: Record<string, any> } {
    const nodeType = this.getNodeType(nodeTypeName)
    if (!nodeType) {
      return {
        valid: false,
        constraints: {},
      }
    }

    return {
      valid: true,
      constraints: {
        modes: nodeType.execution.modes,
        maxTimeout: nodeType.execution.maxTimeout,
        retryable: nodeType.execution.retryable,
      },
    }
  }

  /**
   * Search node types by keyword
   */
  searchNodeTypes(keyword: string): NodeTypeDefinition[] {
    const lowerKeyword = keyword.toLowerCase()
    return Array.from(this.nodeTypeMap.values()).filter(
      (nt) =>
        nt.name.toLowerCase().includes(lowerKeyword) ||
        nt.displayName.toLowerCase().includes(lowerKeyword) ||
        nt.description.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStats {
    const stats: RegistryStats = {
      totalNodeTypes: this.nodeTypeMap.size,
      totalCategories: this.registry.categories.length,
      totalPlugins: this.registry.plugins.length,
      languageSupport: {},
      groupDistribution: {},
    }

    // Count language support
    for (const nodeType of this.nodeTypeMap.values()) {
      if (nodeType.multiLanguage) {
        for (const lang of Object.keys(nodeType.multiLanguage)) {
          stats.languageSupport[lang] = (stats.languageSupport[lang] || 0) + 1
        }
      }
    }

    // Count group distribution
    for (const nodeType of this.nodeTypeMap.values()) {
      stats.groupDistribution[nodeType.group] = (stats.groupDistribution[nodeType.group] || 0) + 1
    }

    return stats
  }

  /**
   * Validate entire registry structure
   */
  validateRegistry(): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check for duplicate node types
    const nodeNames = new Set<string>()
    for (const nt of this.registry.nodeTypes) {
      if (nodeNames.has(nt.name)) {
        errors.push({
          path: `nodeTypes.${nt.name}`,
          message: `Duplicate node type: ${nt.name}`,
          code: 'DUPLICATE_NODE_TYPE',
          severity: 'error',
        })
      }
      nodeNames.add(nt.name)
    }

    // Check for missing node type references in plugins
    for (const plugin of this.registry.plugins) {
      for (const nodeTypeName of plugin.nodeTypes) {
        if (!this.nodeTypeMap.has(nodeTypeName)) {
          errors.push({
            path: `plugins.${plugin.id}`,
            message: `Plugin references non-existent node type: ${nodeTypeName}`,
            code: 'MISSING_NODE_TYPE',
            severity: 'error',
          })
        }
      }
    }

    // Check for unused node types
    const usedNodeTypes = new Set<string>()
    for (const plugin of this.registry.plugins) {
      plugin.nodeTypes.forEach((nt) => usedNodeTypes.add(nt))
    }

    for (const nodeType of this.registry.nodeTypes) {
      if (!usedNodeTypes.has(nodeType.name)) {
        warnings.push({
          path: `nodeTypes.${nodeType.name}`,
          message: `Node type is not referenced by any plugin`,
          code: 'UNUSED_NODE_TYPE',
          severity: 'warning',
        })
      }
    }

    // Check node type execution timeouts are reasonable
    for (const nodeType of this.registry.nodeTypes) {
      if (nodeType.execution.maxTimeout < 1000) {
        warnings.push({
          path: `nodeTypes.${nodeType.name}.execution.maxTimeout`,
          message: `Timeout is very short (${nodeType.execution.maxTimeout}ms), may cause premature failures`,
          code: 'TIMEOUT_TOO_SHORT',
          severity: 'warning',
        })
      }

      if (nodeType.execution.maxTimeout > 3600000) {
        warnings.push({
          path: `nodeTypes.${nodeType.name}.execution.maxTimeout`,
          message: `Timeout is very long (${nodeType.execution.maxTimeout}ms), may waste resources`,
          code: 'TIMEOUT_TOO_LONG',
          severity: 'warning',
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Export registry to JSON
   */
  async saveRegistry(outputPath: string): Promise<void> {
    try {
      const json = JSON.stringify(this.registry, null, 2)
      await fs.writeFile(outputPath, json + '\n', 'utf-8')
    } catch (error) {
      throw new Error(`Failed to save registry: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // ====== Private Helper Methods ======

  private getPropertyTypeString(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      object: 'object',
      array: 'object',
      options: 'string',
    }
    return typeMap[type] || type
  }

  private isTypeCompatible(actual: string, expected: string): boolean {
    if (actual === expected) return true
    if (expected === 'object' && actual === 'object') return true
    return false
  }
}

/**
 * Global registry instance
 */
let globalRegistry: NodeRegistryManager | null = null

/**
 * Get or initialize global registry
 */
export async function getNodeRegistry(): Promise<NodeRegistryManager> {
  if (!globalRegistry) {
    globalRegistry = new NodeRegistryManager()
    const registryPath = path.join(__dirname, 'node-registry.json')
    await globalRegistry.loadRegistry(registryPath)
  }
  return globalRegistry
}

/**
 * Reset global registry (for testing)
 */
export function resetNodeRegistry(): void {
  globalRegistry = null
}
