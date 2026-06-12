import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js'
import { CodeQualityAnalyzer } from './codeQualityAnalyzer.js'
import { CoverageAnalyzer } from './coverageAnalyzer.js'
import { ArchitectureChecker } from './architectureChecker.js'
import { SecurityScanner } from './securityScanner.js'
import { logger } from '../utils/logger.js'

export type AnalyzerType =
  | 'codeQuality'
  | 'coverage'
  | 'architecture'
  | 'security'

type AnalyzerConstructor = new (config?: AnalyzerConfig) => BaseAnalyzer

export class AnalyzerFactory {
  private static readonly analyzers = new Map<
    AnalyzerType,
    AnalyzerConstructor
  >()
  private static readonly instances = new Map<AnalyzerType, BaseAnalyzer>()

  static {
    AnalyzerFactory.registerAnalyzer('codeQuality', CodeQualityAnalyzer)
    AnalyzerFactory.registerAnalyzer('coverage', CoverageAnalyzer)
    AnalyzerFactory.registerAnalyzer('architecture', ArchitectureChecker)
    AnalyzerFactory.registerAnalyzer('security', SecurityScanner)
  }

  static registerAnalyzer(
    type: AnalyzerType,
    constructor: AnalyzerConstructor,
  ): void {
    if (AnalyzerFactory.analyzers.has(type)) {
      logger.warn(
        `Analyzer type '${type}' is already registered, overwriting...`,
      )
    }
    AnalyzerFactory.analyzers.set(type, constructor)
    logger.debug(`Registered analyzer type: ${type}`)
  }

  static create(type: AnalyzerType, config?: AnalyzerConfig): BaseAnalyzer {
    const constructor = AnalyzerFactory.analyzers.get(type)

    if (!constructor) {
      throw new Error(
        // eslint-disable-next-line max-len
        `Unknown analyzer type: ${type}. Registered types: ${Array.from(AnalyzerFactory.analyzers.keys()).join(', ')}`,
      )
    }

    logger.debug(`Creating analyzer instance: ${type}`)
    return new constructor(config)
  }

  static getInstance(
    type: AnalyzerType,
    config?: AnalyzerConfig,
  ): BaseAnalyzer {
    if (!AnalyzerFactory.instances.has(type)) {
      AnalyzerFactory.instances.set(type, AnalyzerFactory.create(type, config))
    }
    return AnalyzerFactory.instances.get(type)!
  }

  static getRegisteredTypes(): AnalyzerType[] {
    return Array.from(AnalyzerFactory.analyzers.keys())
  }

  static clearInstances(): void {
    AnalyzerFactory.instances.clear()
    logger.debug('Cleared analyzer singleton instances')
  }

  static createAll(config?: AnalyzerConfig): Map<AnalyzerType, BaseAnalyzer> {
    const analyzers = new Map<AnalyzerType, BaseAnalyzer>()

    for (const type of AnalyzerFactory.getRegisteredTypes()) {
      analyzers.set(type, AnalyzerFactory.create(type, config))
    }

    return analyzers
  }
}
