/**
 * Analyzer Factory
 * Creates and manages analyzer instances using the Factory pattern
 * Implements SOLID principles:
 * - Single Responsibility: Factory only handles analyzer creation
 * - Open/Closed: Easy to add new analyzer types
 * - Dependency Inversion: Depends on abstractions (BaseAnalyzer)
 */

import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';
import { CodeQualityAnalyzer } from './codeQualityAnalyzer.js';
import { CoverageAnalyzer } from './coverageAnalyzer.js';
import { ArchitectureChecker } from './architectureChecker.js';
import { SecurityScanner } from './securityScanner.js';
import { logger } from '../utils/logger.js';

/**
 * Supported analyzer types
 */
export type AnalyzerType = 'codeQuality' | 'coverage' | 'architecture' | 'security';

/**
 * Analyzer constructor interface
 */
interface AnalyzerConstructor {
  new (config?: AnalyzerConfig): BaseAnalyzer;
}

/**
 * Factory for creating analyzer instances
 */
export class AnalyzerFactory {
  private static readonly analyzers = new Map<AnalyzerType, AnalyzerConstructor>();
  private static readonly instances = new Map<AnalyzerType, BaseAnalyzer>();

  /**
   * Register built-in analyzers
   */
  static {
    AnalyzerFactory.registerAnalyzer('codeQuality', CodeQualityAnalyzer);
    AnalyzerFactory.registerAnalyzer('coverage', CoverageAnalyzer);
    AnalyzerFactory.registerAnalyzer('architecture', ArchitectureChecker);
    AnalyzerFactory.registerAnalyzer('security', SecurityScanner);
  }

  /**
   * Register an analyzer type
   */
  static registerAnalyzer(type: AnalyzerType, constructor: AnalyzerConstructor): void {
    if (AnalyzerFactory.analyzers.has(type)) {
      logger.warn(`Analyzer type '${type}' is already registered, overwriting...`);
    }
    AnalyzerFactory.analyzers.set(type, constructor);
    logger.debug(`Registered analyzer type: ${type}`);
  }

  /**
   * Create an analyzer instance
   */
  static create(type: AnalyzerType, config?: AnalyzerConfig): BaseAnalyzer {
    const constructor = AnalyzerFactory.analyzers.get(type);

    if (!constructor) {
      throw new Error(`Unknown analyzer type: ${type}. Registered types: ${Array.from(AnalyzerFactory.analyzers.keys()).join(', ')}`);
    }

    logger.debug(`Creating analyzer instance: ${type}`);
    return new constructor(config);
  }

  /**
   * Get or create a singleton instance
   */
  static getInstance(type: AnalyzerType, config?: AnalyzerConfig): BaseAnalyzer {
    if (!AnalyzerFactory.instances.has(type)) {
      AnalyzerFactory.instances.set(type, AnalyzerFactory.create(type, config));
    }
    return AnalyzerFactory.instances.get(type)!;
  }

  /**
   * Get all registered analyzer types
   */
  static getRegisteredTypes(): AnalyzerType[] {
    return Array.from(AnalyzerFactory.analyzers.keys());
  }

  /**
   * Clear singleton instances (useful for testing)
   */
  static clearInstances(): void {
    AnalyzerFactory.instances.clear();
    logger.debug('Cleared analyzer singleton instances');
  }

  /**
   * Create all registered analyzers
   */
  static createAll(config?: AnalyzerConfig): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = new Map<AnalyzerType, BaseAnalyzer>();

    for (const type of AnalyzerFactory.getRegisteredTypes()) {
      analyzers.set(type, AnalyzerFactory.create(type, config));
    }

    return analyzers;
  }
}
