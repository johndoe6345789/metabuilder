/**
 * Dependency Container
 * Implements Dependency Injection for quality-validator components
 */

import { BaseAnalyzer } from '../analyzers/BaseAnalyzer.js'
import { AnalyzerFactory, AnalyzerType } from '../analyzers/AnalyzerFactory.js'
import { Configuration } from '../types/index.js'
import { logger } from './logger.js'

export interface IServiceProvider {
  get<T>(key: string): T | undefined
  register<T>(key: string, instance: T): void
}

export class DependencyContainer implements IServiceProvider {
  private services = new Map<string, any>()
  private config: Configuration | null = null

  constructor() {
    this.initializeDefaults()
  }

  private initializeDefaults(): void {
    this.register('logger', logger)
    logger.debug('DependencyContainer initialized')
  }

  register<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      logger.warn(`Service '${key}' already registered, overwriting`)
    }
    this.services.set(key, instance)
    logger.debug(`Service registered: ${key}`)
  }

  get<T>(key: string): T | undefined {
    const service = this.services.get(key)
    if (!service) logger.debug(`Service not found: ${key}`)
    return service as T
  }

  has(key: string): boolean {
    return this.services.has(key)
  }

  setConfiguration(config: Configuration): void {
    this.config = config
    this.register('config', config)
    logger.debug('Configuration registered in container')
  }

  getConfiguration(): Configuration | null {
    return this.config
  }

  registerAnalyzer(type: AnalyzerType, config?: any): BaseAnalyzer {
    const analyzer = AnalyzerFactory.create(type, config)
    this.register(`analyzer:${type}`, analyzer)
    return analyzer
  }

  getAnalyzer(type: AnalyzerType): BaseAnalyzer | undefined {
    return this.get<BaseAnalyzer>(`analyzer:${type}`)
  }

  registerAllAnalyzers(config?: any): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = AnalyzerFactory.createAll(config)
    for (const [type, analyzer] of analyzers) {
      this.register(`analyzer:${type}`, analyzer)
    }
    logger.debug('All analyzers registered in container')
    return analyzers
  }

  getAllAnalyzers(): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = new Map<AnalyzerType, BaseAnalyzer>()
    const types = AnalyzerFactory.getRegisteredTypes()
    for (const type of types) {
      const analyzer = this.getAnalyzer(type)
      if (analyzer) analyzers.set(type, analyzer)
    }
    return analyzers
  }

  clear(): void {
    this.services.clear()
    this.config = null
    this.initializeDefaults()
    logger.debug('DependencyContainer cleared')
  }

  getServiceKeys(): string[] {
    return Array.from(this.services.keys())
  }

  createScope(): DependencyContainer {
    const child = new DependencyContainer()
    child.config = this.config
    for (const [key, value] of this.services) {
      if (!key.startsWith('analyzer:')) {
        child.register(key, value)
      }
    }
    logger.debug('Child DependencyContainer scope created')
    return child
  }
}

let globalContainer: DependencyContainer | null = null

export function getGlobalContainer(): DependencyContainer {
  if (!globalContainer) {
    globalContainer = new DependencyContainer()
  }
  return globalContainer
}

export function resetGlobalContainer(): void {
  globalContainer = null
  logger.debug('Global DependencyContainer reset')
}
