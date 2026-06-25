/**
 * Plugin Discovery System - Dynamic plugin loading and registration
 * @packageDocumentation
 */

import * as fs from 'fs'
import * as path from 'path'

export interface PluginMetadata {
  id: string
  name: string
  version: string
  type: string
  category: string
  description?: string
  entry: string
  dependencies?: string[]
  tags?: string[]
}

export interface DiscoveryConfig {
  pluginDirs: string[]
  cacheDiscovery?: boolean
  validationMode?: 'strict' | 'loose'
}

export class PluginDiscoverySystem {
  private discoveredPlugins: Map<string, PluginMetadata> = new Map()
  private pluginPaths: Map<string, string> = new Map()
  private readonly config: DiscoveryConfig
  private isInitialized = false

  constructor(config: DiscoveryConfig) {
    this.config = {
      cacheDiscovery: true,
      validationMode: 'strict',
      ...config
    }
  }

  /**
   * Initialize discovery system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    for (const dir of this.config.pluginDirs) {
      await this.scanDirectory(dir)
    }

    this.isInitialized = true
  }

  /**
   * Scan directory for plugins
   */
  private async scanDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      console.warn(`Plugin directory not found: ${dir}`)
      return
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.discoverPlugin(path.join(dir, entry.name))
        }
      }
    } catch (error) {
      console.error(`Error scanning plugin directory ${dir}:`, error)
    }
  }

  /**
   * Discover single plugin
   */
  private async discoverPlugin(pluginDir: string): Promise<void> {
    const metadataPath = path.join(pluginDir, 'plugin.json')

    if (!fs.existsSync(metadataPath)) {
      return
    }

    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
      const metadata: PluginMetadata = JSON.parse(metadataContent)

      // Validate metadata
      if (this.config.validationMode === 'strict') {
        this.validateMetadata(metadata)
      }

      // Store plugin
      this.discoveredPlugins.set(metadata.id, metadata)
      this.pluginPaths.set(metadata.id, pluginDir)
    } catch (error) {
      if (this.config.validationMode === 'strict') {
        throw error
      }
      console.warn(`Failed to load plugin from ${pluginDir}:`, error)
    }
  }

  /**
   * Validate plugin metadata
   */
  private validateMetadata(metadata: PluginMetadata): void {
    const required = ['id', 'name', 'version', 'type', 'category', 'entry']
    for (const field of required) {
      if (!metadata[field as keyof PluginMetadata]) {
        throw new Error(
          `Plugin metadata missing required field: ${field}`
        )
      }
    }

    // Validate entry file exists
    const pluginDir = this.pluginPaths.get(metadata.id)
    if (pluginDir) {
      const entryPath = path.join(pluginDir, metadata.entry)
      if (!fs.existsSync(entryPath)) {
        throw new Error(
          `Plugin entry file not found: ${entryPath}`
        )
      }
    }
  }

  /**
   * Get plugin metadata
   */
  getPlugin(pluginId: string): PluginMetadata | undefined {
    return this.discoveredPlugins.get(pluginId)
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): PluginMetadata[] {
    return Array.from(this.discoveredPlugins.values())
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): PluginMetadata[] {
    return this.getAllPlugins().filter(p => p.category === category)
  }

  /**
   * Get plugins by type
   */
  getPluginsByType(type: string): PluginMetadata[] {
    return this.getAllPlugins().filter(p => p.type === type)
  }

  /**
   * Search plugins by tag
   */
  searchByTag(tag: string): PluginMetadata[] {
    return this.getAllPlugins().filter(p => p.tags?.includes(tag))
  }

  /**
   * Get plugin directory
   */
  getPluginDirectory(pluginId: string): string | undefined {
    return this.pluginPaths.get(pluginId)
  }

  /**
   * Get plugin entry path
   */
  getPluginEntry(pluginId: string): string | undefined {
    const plugin = this.discoveredPlugins.get(pluginId)
    const dir = this.pluginPaths.get(pluginId)

    if (!plugin || !dir) return undefined
    return path.join(dir, plugin.entry)
  }

  /**
   * Check if plugin exists
   */
  hasPlugin(pluginId: string): boolean {
    return this.discoveredPlugins.has(pluginId)
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>()
    this.discoveredPlugins.forEach(p => categories.add(p.category))
    return Array.from(categories).sort()
  }

  /**
   * Get discovery statistics
   */
  getStats() {
    const stats = {
      total: this.discoveredPlugins.size,
      byCategory: new Map<string, number>(),
      byType: new Map<string, number>(),
      categories: this.getCategories(),
      isInitialized: this.isInitialized
    }

    this.discoveredPlugins.forEach(plugin => {
      stats.byCategory.set(
        plugin.category,
        (stats.byCategory.get(plugin.category) || 0) + 1
      )
      stats.byType.set(
        plugin.type,
        (stats.byType.get(plugin.type) || 0) + 1
      )
    })

    return stats
  }

  /**
   * Reload plugins
   */
  async reload(): Promise<void> {
    this.discoveredPlugins.clear()
    this.pluginPaths.clear()
    this.isInitialized = false
    await this.initialize()
  }
}
