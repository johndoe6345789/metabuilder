/**
 * Security Scanner
 * Scans for vulnerabilities and security anti-patterns
 */

import { execSync } from 'child_process';
import {
  AnalysisResult,
  SecurityMetrics,
  Vulnerability,
  SecurityAntiPattern,
  PerformanceIssue,
  Finding,
  AnalysisErrorClass,
  Status,
} from '../types/index.js';
import { readFile, getSourceFiles, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';

/**
 * Security Scanner
 * Extends BaseAnalyzer to implement SOLID principles
 */
export class SecurityScanner extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'SecurityScanner',
        enabled: true,
        timeout: 60000,
        retryAttempts: 1,
      }
    );
  }

  /**
   * Scan for security issues
   */
  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('SecurityScanner validation failed');
      }

      this.startTiming();

      const vulnerabilities = this.scanVulnerabilities();
      const codePatterns = this.detectSecurityPatterns(filePaths);
      const performanceIssues = this.checkPerformanceIssues(filePaths);

      const metrics: SecurityMetrics = {
        vulnerabilities,
        codePatterns,
        performanceIssues,
      };

      this.generateFindings(metrics);
      const score = this.calculateScore(metrics);

      const executionTime = this.getExecutionTime();

      this.logProgress('Security analysis complete', {
        vulnerabilities: vulnerabilities.length,
        patterns: codePatterns.length,
      });

      return {
        category: 'security' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      };
    }, 'security analysis');
  }

  /**
   * Validate analyzer configuration and preconditions
   */
  validate(): boolean {
    if (!this.validateConfig()) {
      return false;
    }

    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`);
      return false;
    }

    return true;
  }

  /**
   * Scan for vulnerabilities using npm audit
   */
  private scanVulnerabilities(): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const output = execSync('npm audit --json', {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const data = JSON.parse(output);

      if (data.vulnerabilities) {
        for (const [pkgName, vulnData] of Object.entries(data.vulnerabilities)) {
          const vuln = vulnData as any;

          vulnerabilities.push({
            package: pkgName,
            currentVersion: vuln.installed || 'unknown',
            vulnerabilityType: vuln.type || 'unknown',
            severity: vuln.severity || 'medium',
            description: vuln.via?.[0]?.title || vuln.description || 'No description',
            fixedInVersion: vuln.via?.[0]?.fixed || 'No fix available',
          });
        }
      }
    } catch (error) {
      logger.warn('npm audit scan failed', {
        error: (error as Error).message,
      });
    }

    return vulnerabilities;
  }

  /**
   * Detect security anti-patterns in code
   */
  private detectSecurityPatterns(filePaths: string[]): SecurityAntiPattern[] {
    const patterns: SecurityAntiPattern[] = [];

    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      try {
        const content = readFile(filePath);
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;

          // Check for hard-coded secrets
          if (this.isHardcodedSecret(line)) {
            patterns.push({
              type: 'secret',
              severity: 'critical',
              file: normalizeFilePath(filePath),
              line: lineNum,
              column: line.indexOf(line.match(/password|secret|token|apiKey|API_KEY/i)![0]),
              message: 'Possible hard-coded secret detected',
              remediation: 'Use environment variables or secure configuration management for sensitive data',
              evidence: line.substring(0, 50) + '...',
            });
          }

          // Check for dangerous patterns
          if (line.includes('dangerouslySetInnerHTML')) {
            patterns.push({
              type: 'unsafeDom',
              severity: 'high',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'dangerouslySetInnerHTML used',
              remediation: 'Use safe HTML rendering methods or sanitize HTML content with DOMPurify',
              evidence: 'dangerouslySetInnerHTML',
            });
          }

          if (line.includes('eval(')) {
            patterns.push({
              type: 'unsafeDom',
              severity: 'critical',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'eval() usage detected',
              remediation: 'Never use eval(). Use alternative approaches like JSON.parse() or Function constructor with caution',
              evidence: 'eval(',
            });
          }

          if (line.includes('innerHTML =')) {
            patterns.push({
              type: 'unsafeDom',
              severity: 'high',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'Direct innerHTML assignment',
              remediation: 'Use textContent for text or createElement/appendChild for safe DOM manipulation',
              evidence: 'innerHTML =',
            });
          }

          // Check for XSS risks
          if (
            (line.includes('innerHTML') || line.includes('dangerouslySetInnerHTML')) &&
            (line.includes('user') || line.includes('input') || line.includes('data'))
          ) {
            patterns.push({
              type: 'xss',
              severity: 'high',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'Potential XSS vulnerability: unescaped user input in HTML',
              remediation: 'Escape HTML entities or use a library like DOMPurify',
              evidence: line.substring(0, 60) + '...',
            });
          }
        }
      } catch (error) {
        logger.debug(`Failed to scan security patterns in ${filePath}`);
      }
    }

    return patterns.slice(0, 20);
  }

  /**
   * Check if a line contains hard-coded secrets
   */
  private isHardcodedSecret(line: string): boolean {
    const secretPatterns = [
      /password\s*[:=]\s*['"]/i,
      /secret\s*[:=]\s*['"]/i,
      /token\s*[:=]\s*['"]/i,
      /apiKey\s*[:=]\s*['"]/i,
      /api_key\s*[:=]\s*['"]/i,
      /authorization\s*[:=]\s*['"]/i,
      /auth\s*[:=]\s*['"]/i,
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for performance issues
   */
  private checkPerformanceIssues(filePaths: string[]): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const filePath of filePaths) {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) continue;

      try {
        const content = readFile(filePath);
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;

          // Check for inline functions in JSX
          if (line.includes('onClick={') && line.includes('=>')) {
            issues.push({
              type: 'inlineFunction',
              severity: 'medium',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'Inline function definition in JSX',
              suggestion: 'Define function outside JSX or use useCallback to prevent unnecessary re-renders',
              estimatedImpact: 'Performance degradation in large lists',
            });
          }

          // Check for missing keys in lists
          if (
            line.includes('.map(') &&
            !line.includes('key=') &&
            i + 1 < lines.length &&
            (lines[i + 1].includes('key=') === false)
          ) {
            issues.push({
              type: 'missingKey',
              severity: 'high',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'List items missing key prop',
              suggestion: 'Add unique key prop to each list item',
              estimatedImpact: 'Rendering issues and performance problems',
            });
          }

          // Check for inline objects/arrays in props
          if (line.includes('={{') || line.includes('={[')) {
            issues.push({
              type: 'inlineObject',
              severity: 'medium',
              file: normalizeFilePath(filePath),
              line: lineNum,
              message: 'Inline object/array literal in JSX props',
              suggestion: 'Move to state or memoize with useMemo',
              estimatedImpact: 'Unnecessary re-renders of child components',
            });
          }
        }
      } catch (error) {
        logger.debug(`Failed to check performance issues in ${filePath}`);
      }
    }

    return issues.slice(0, 20);
  }

  /**
   * Generate findings from metrics
   */
  private generateFindings(metrics: SecurityMetrics): void {
    // Vulnerability findings
    for (const vuln of metrics.vulnerabilities.slice(0, 5)) {
      this.addFinding({
        id: `vuln-${vuln.package}`,
        severity: vuln.severity === 'critical' ? 'critical' : 'high',
        category: 'security',
        title: `Vulnerability in ${vuln.package}`,
        description: vuln.description,
        remediation: `Update ${vuln.package} to version ${vuln.fixedInVersion}`,
        evidence: `${vuln.severity} severity in ${vuln.vulnerabilityType}`,
      });
    }

    // Code pattern findings
    for (const pattern of metrics.codePatterns.slice(0, 5)) {
      this.addFinding({
        id: `pattern-${pattern.file}-${pattern.line}`,
        severity: pattern.severity,
        category: 'security',
        title: pattern.message,
        description: `${pattern.type} vulnerability detected`,
        location: {
          file: pattern.file,
          line: pattern.line,
        },
        remediation: pattern.remediation,
        evidence: pattern.evidence,
      });
    }
  }

  /**
   * Calculate security score
   */
  private calculateScore(metrics: SecurityMetrics): number {
    let score = 100;

    // Vulnerabilities
    const criticalVulns = metrics.vulnerabilities.filter((v) => v.severity === 'critical').length;
    const highVulns = metrics.vulnerabilities.filter((v) => v.severity === 'high').length;
    score -= criticalVulns * 25 + highVulns * 10;

    // Code patterns
    const criticalPatterns = metrics.codePatterns.filter((p) => p.severity === 'critical').length;
    const highPatterns = metrics.codePatterns.filter((p) => p.severity === 'high').length;
    score -= criticalPatterns * 15 + highPatterns * 5;

    // Performance issues
    score -= Math.min(metrics.performanceIssues.length * 2, 20);

    return Math.max(0, score);
  }
}

export const securityScanner = new SecurityScanner();
