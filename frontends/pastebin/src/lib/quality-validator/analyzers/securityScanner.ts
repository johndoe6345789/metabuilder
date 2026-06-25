/**
 * Security Scanner
 * Scans for vulnerabilities and security anti-patterns
 */

import { execSync } from 'child_process'
import {
  AnalysisResult,
  SecurityMetrics,
  Vulnerability,
} from '../types/index.js'
import { logger } from '../utils/logger.js'
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js'
import {
  detectSecurityPatterns,
  checkPerformanceIssues,
} from './security-patterns.js'

export class SecurityScanner extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'SecurityScanner',
        enabled: true,
        timeout: 60000,
        retryAttempts: 1,
      },
    )
  }

  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('SecurityScanner validation failed')
      }

      this.startTiming()

      const vulnerabilities = this.scanVulnerabilities()
      const codePatterns = detectSecurityPatterns(filePaths)
      const performanceIssues = checkPerformanceIssues(filePaths)

      const metrics: SecurityMetrics = {
        vulnerabilities,
        codePatterns,
        performanceIssues,
      }

      this.generateFindings(metrics)
      const score = this.calculateScore(metrics)
      const executionTime = this.getExecutionTime()

      this.logProgress('Security analysis complete', {
        vulnerabilities: vulnerabilities.length,
        patterns: codePatterns.length,
      })

      return {
        category: 'security' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      }
    }, 'security analysis')
  }

  validate(): boolean {
    if (!this.validateConfig()) return false
    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`)
      return false
    }
    return true
  }

  private scanVulnerabilities(): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []

    try {
      const output = execSync('npm audit --json', {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      const data = JSON.parse(output)

      if (data.vulnerabilities) {
        for (const [pkgName, vulnData] of Object.entries(
          data.vulnerabilities,
        )) {
          const vuln = vulnData as any
          vulnerabilities.push({
            package: pkgName,
            currentVersion: vuln.installed || 'unknown',
            vulnerabilityType: vuln.type || 'unknown',
            severity: vuln.severity || 'medium',
            description:
              vuln.via?.[0]?.title || vuln.description || 'No description',
            fixedInVersion: vuln.via?.[0]?.fixed || 'No fix available',
          })
        }
      }
    } catch (error) {
      logger.warn('npm audit scan failed', {
        error: (error as Error).message,
      })
    }

    return vulnerabilities
  }

  private generateFindings(metrics: SecurityMetrics): void {
    for (const vuln of metrics.vulnerabilities.slice(0, 5)) {
      this.addFinding({
        id: `vuln-${vuln.package}`,
        severity: vuln.severity === 'critical' ? 'critical' : 'high',
        category: 'security',
        title: `Vulnerability in ${vuln.package}`,
        description: vuln.description,
        remediation: `Update ${vuln.package} to version ${vuln.fixedInVersion}`,
        evidence: `${vuln.severity} severity in ${vuln.vulnerabilityType}`,
      })
    }

    for (const pattern of metrics.codePatterns.slice(0, 5)) {
      this.addFinding({
        id: `pattern-${pattern.file}-${pattern.line}`,
        severity: pattern.severity,
        category: 'security',
        title: pattern.message,
        description: `${pattern.type} vulnerability detected`,
        location: { file: pattern.file, line: pattern.line },
        remediation: pattern.remediation,
        evidence: pattern.evidence,
      })
    }
  }

  private calculateScore(metrics: SecurityMetrics): number {
    let score = 100
    const criticalVulns = metrics.vulnerabilities.filter(
      v => v.severity === 'critical',
    ).length
    const highVulns = metrics.vulnerabilities.filter(
      v => v.severity === 'high',
    ).length
    score -= criticalVulns * 25 + highVulns * 10

    const criticalPatterns = metrics.codePatterns.filter(
      p => p.severity === 'critical',
    ).length
    const highPatterns = metrics.codePatterns.filter(
      p => p.severity === 'high',
    ).length
    score -= criticalPatterns * 15 + highPatterns * 5

    score -= Math.min(metrics.performanceIssues.length * 2, 20)
    return Math.max(0, score)
  }
}

export const securityScanner = new SecurityScanner()
