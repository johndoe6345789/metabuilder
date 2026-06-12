/**
 * Architecture Checker
 * Validates component organization and architecture compliance
 */

import { AnalysisResult, ArchitectureMetrics } from '../types/index.js'
import { logger } from '../utils/logger.js'
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js'
import { analyzeComponents } from './arch-components.js'
import { analyzeDependencies } from './arch-dependencies.js'
import { analyzePatterns } from './arch-patterns.js'

export class ArchitectureChecker extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'ArchitectureChecker',
        enabled: true,
        timeout: 45000,
        retryAttempts: 1,
      },
    )
  }

  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('ArchitectureChecker validation failed')
      }

      this.startTiming()

      const components = analyzeComponents(filePaths)
      const dependencies = analyzeDependencies(filePaths)
      const patterns = analyzePatterns(filePaths)

      const metrics: ArchitectureMetrics = {
        components,
        dependencies,
        patterns,
      }

      this.generateFindings(metrics)
      const score = this.calculateScore(metrics)
      const executionTime = this.getExecutionTime()

      this.logProgress('Architecture analysis complete', {
        components: components.totalCount,
        circularDeps: dependencies.circularDependencies.length,
      })

      return {
        category: 'architecture' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      }
    }, 'architecture analysis')
  }

  validate(): boolean {
    if (!this.validateConfig()) return false
    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`)
      return false
    }
    return true
  }

  private generateFindings(metrics: ArchitectureMetrics): void {
    for (const component of metrics.components.oversized.slice(0, 3)) {
      this.addFinding({
        id: `oversized-${component.file}`,
        severity: 'medium',
        category: 'architecture',
        title: 'Oversized component',
        description:
          `Component '${component.name}' has ${component.lines} lines, ` +
          'recommended max is 300',
        location: { file: component.file },
        remediation: component.suggestion,
        evidence: `Lines: ${component.lines}`,
      })
    }

    for (const cycle of metrics.dependencies.circularDependencies) {
      this.addFinding({
        id: `circular-${cycle.files[0]}`,
        severity: 'high',
        category: 'architecture',
        title: 'Circular dependency detected',
        description: `Circular dependency: ${cycle.files.join(' → ')}`,
        remediation: 'Restructure modules to break the circular dependency',
        evidence: `Cycle: ${cycle.path.join(' → ')}`,
      })
    }

    for (const issue of metrics.patterns.reduxCompliance.issues.slice(0, 2)) {
      this.addFinding({
        id: `redux-${issue.file}`,
        severity: issue.severity,
        category: 'architecture',
        title: 'Redux pattern violation',
        description: issue.issue,
        location: { file: issue.file, line: issue.line },
        remediation: issue.suggestion,
      })
    }
  }

  private calculateScore(metrics: ArchitectureMetrics): number {
    const { components, dependencies, patterns } = metrics

    const componentScore = Math.max(0, 100 - components.oversized.length * 10)
    const dependencyScore = Math.max(
      0,
      100 - dependencies.circularDependencies.length * 20,
    )
    const patternScore =
      (patterns.reduxCompliance.score +
        patterns.hookUsage.score +
        patterns.reactBestPractices.score) /
      3

    return componentScore * 0.35 + dependencyScore * 0.35 + patternScore * 0.3
  }
}

export const architectureChecker = new ArchitectureChecker()
