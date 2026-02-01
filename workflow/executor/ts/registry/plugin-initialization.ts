/**
 * Plugin Initialization Framework - Setup and initialization of plugins
 * @packageDocumentation
 */

import { PluginDiscoverySystem, PluginMetadata } from './plugin-discovery'

export interface InitializationConfig {
  timeout?: number
  parallelInitialization?: boolean
  maxParallel?: number
  failFast?: boolean
}

export interface InitializationResult {
  pluginId: string
  success: boolean
  error?: Error
  duration: number
  metadata?: any
}

export type PluginInitializer = (metadata: PluginMetadata) => Promise<any>

export class PluginInitializationFramework {
  private discovery: PluginDiscoverySystem
  private initializers: Map<string, PluginInitializer> = new Map()
  private initializedPlugins: Map<string, any> = new Map()
  private initializationResults: InitializationResult[] = []
  private readonly config: Required<InitializationConfig> = {
    timeout: 30000,
    parallelInitialization: true,
    maxParallel: 5,
    failFast: false
  }

  constructor(discovery: PluginDiscoverySystem, config?: InitializationConfig) {
    this.discovery = discovery
    this.config = { ...this.config, ...config }
  }

  /**
   * Register plugin initializer
   */
  registerInitializer(pluginType: string, initializer: PluginInitializer): void {
    this.initializers.set(pluginType, initializer)
  }

  /**
   * Initialize single plugin
   */
  async initializePlugin(pluginId: string): Promise<InitializationResult> {
    const plugin = this.discovery.getPlugin(pluginId)
    if (!plugin) {
      return {
        pluginId,
        success: false,
        error: new Error(`Plugin not found: ${pluginId}`),
        duration: 0
      }
    }

    const start = Date.now()

    try {
      const initializer = this.initializers.get(plugin.type)
      if (!initializer) {
        throw new Error(`No initializer for plugin type: ${plugin.type}`)
      }

      const metadata = await Promise.race([
        initializer(plugin),
        this.timeout(this.config.timeout)
      ])

      this.initializedPlugins.set(pluginId, metadata)

      const result: InitializationResult = {
        pluginId,
        success: true,
        duration: Date.now() - start,
        metadata
      }

      this.initializationResults.push(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      const result: InitializationResult = {
        pluginId,
        success: false,
        error: err,
        duration: Date.now() - start
      }

      this.initializationResults.push(result)

      if (this.config.failFast) {
        throw err
      }

      return result
    }
  }

  /**
   * Initialize all plugins
   */
  async initializeAll(): Promise<InitializationResult[]> {
    const plugins = this.discovery.getAllPlugins()

    if (this.config.parallelInitialization) {
      return this.initializeParallel(plugins)
    } else {
      return this.initializeSequential(plugins)
    }
  }

  /**
   * Initialize plugins in sequence
   */
  private async initializeSequential(
    plugins: PluginMetadata[]
  ): Promise<InitializationResult[]> {
    const results: InitializationResult[] = []

    for (const plugin of plugins) {
      const result = await this.initializePlugin(plugin.id)
      results.push(result)

      if (!result.success && this.config.failFast) {
        break
      }
    }

    return results
  }

  /**
   * Initialize plugins in parallel with max concurrency
   */
  private async initializeParallel(
    plugins: PluginMetadata[]
  ): Promise<InitializationResult[]> {
    const results: InitializationResult[] = []
    const queue = [...plugins]
    const inProgress = new Set<Promise<InitializationResult>>()

    while (queue.length > 0 || inProgress.size > 0) {
      // Fill up to max parallel
      while (queue.length > 0 && inProgress.size < this.config.maxParallel) {
        const plugin = queue.shift()!
        const promise = this.initializePlugin(plugin.id)

        promise.then(result => {
          results.push(result)
          inProgress.delete(promise)
        })

        inProgress.add(promise)
      }

      // Wait for at least one to complete
      if (inProgress.size > 0) {
        await Promise.race(inProgress)
      }
    }

    return results
  }

  /**
   * Get initialized plugin
   */
  getInitializedPlugin(pluginId: string): any {
    return this.initializedPlugins.get(pluginId)
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(pluginId: string): boolean {
    return this.initializedPlugins.has(pluginId)
  }

  /**
   * Get initialization result
   */
  getResult(pluginId: string): InitializationResult | undefined {
    return this.initializationResults.find(r => r.pluginId === pluginId)
  }

  /**
   * Get all results
   */
  getAllResults(): InitializationResult[] {
    return [...this.initializationResults]
  }

  /**
   * Get initialization statistics
   */
  getStats() {
    const stats = {
      total: this.initializationResults.length,
      successful: 0,
      failed: 0,
      totalDuration: 0,
      averageDuration: 0,
      failures: [] as InitializationResult[]
    }

    this.initializationResults.forEach(result => {
      if (result.success) {
        stats.successful++
      } else {
        stats.failed++
        stats.failures.push(result)
      }
      stats.totalDuration += result.duration
    })

    if (stats.total > 0) {
      stats.averageDuration = stats.totalDuration / stats.total
    }

    return stats
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Initialization timeout after ${ms}ms`)), ms)
    )
  }

  /**
   * Clear initialization state
   */
  clear(): void {
    this.initializedPlugins.clear()
    this.initializationResults = []
  }
}
