/**
 * Dependency Container
 * Implements Dependency Injection pattern for quality-validator components
 * Implements SOLID principles:
 * - Single Responsibility: Container only manages dependencies
 * - Dependency Inversion: Depends on abstractions through interfaces
 */

import { BaseAnalyzer } from '../analyzers/BaseAnalyzer.js';
import { AnalyzerFactory, AnalyzerType } from '../analyzers/AnalyzerFactory.js';
import { Configuration } from '../types/index.js';
import { logger } from './logger.js';

/**
 * Service interface for type-safe dependency retrieval
 */
export interface IServiceProvider {
  get<T>(key: string): T | undefined;
  register<T>(key: string, instance: T): void;
}

/**
 * Dependency container for quality-validator
 */
export class DependencyContainer implements IServiceProvider {
  private services = new Map<string, any>();
  private config: Configuration | null = null;

  constructor() {
    this.initializeDefaults();
  }

  /**
   * Initialize default services
   */
  private initializeDefaults(): void {
    // Register logger
    this.register('logger', logger);

    logger.debug('DependencyContainer initialized with default services');
  }

  /**
   * Register a service instance
   */
  register<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      logger.warn(`Service '${key}' already registered, overwriting...`);
    }
    this.services.set(key, instance);
    logger.debug(`Service registered: ${key}`);
  }

  /**
   * Get a registered service
   */
  get<T>(key: string): T | undefined {
    const service = this.services.get(key);
    if (!service) {
      logger.debug(`Service not found: ${key}`);
    }
    return service as T;
  }

  /**
   * Check if a service is registered
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Set the quality validator configuration
   */
  setConfiguration(config: Configuration): void {
    this.config = config;
    this.register('config', config);
    logger.debug('Configuration registered in container');
  }

  /**
   * Get the quality validator configuration
   */
  getConfiguration(): Configuration | null {
    return this.config;
  }

  /**
   * Register an analyzer by type
   */
  registerAnalyzer(type: AnalyzerType, config?: any): BaseAnalyzer {
    const analyzer = AnalyzerFactory.create(type, config);
    this.register(`analyzer:${type}`, analyzer);
    return analyzer;
  }

  /**
   * Get a registered analyzer
   */
  getAnalyzer(type: AnalyzerType): BaseAnalyzer | undefined {
    return this.get<BaseAnalyzer>(`analyzer:${type}`);
  }

  /**
   * Register all analyzers
   */
  registerAllAnalyzers(config?: any): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = AnalyzerFactory.createAll(config);

    for (const [type, analyzer] of analyzers) {
      this.register(`analyzer:${type}`, analyzer);
    }

    logger.debug('All analyzers registered in container');
    return analyzers;
  }

  /**
   * Get all registered analyzers
   */
  getAllAnalyzers(): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = new Map<AnalyzerType, BaseAnalyzer>();
    const types = AnalyzerFactory.getRegisteredTypes();

    for (const type of types) {
      const analyzer = this.getAnalyzer(type);
      if (analyzer) {
        analyzers.set(type, analyzer);
      }
    }

    return analyzers;
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
    this.config = null;
    this.initializeDefaults();
    logger.debug('DependencyContainer cleared');
  }

  /**
   * Get all registered service keys
   */
  getServiceKeys(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Create a child container (for scoped dependencies)
   */
  createScope(): DependencyContainer {
    const child = new DependencyContainer();
    child.config = this.config;

    // Copy non-scoped services
    for (const [key, value] of this.services) {
      if (!key.startsWith('analyzer:')) {
        child.register(key, value);
      }
    }

    logger.debug('Child DependencyContainer scope created');
    return child;
  }
}

/**
 * Global singleton instance
 */
let globalContainer: DependencyContainer | null = null;

/**
 * Get or create global container
 */
export function getGlobalContainer(): DependencyContainer {
  if (!globalContainer) {
    globalContainer = new DependencyContainer();
  }
  return globalContainer;
}

/**
 * Reset global container (useful for testing)
 */
export function resetGlobalContainer(): void {
  globalContainer = null;
  logger.debug('Global DependencyContainer reset');
}
