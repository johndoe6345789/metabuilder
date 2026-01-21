/**
 * Custom Rules Engine for Quality Validator
 * Allows users to define and execute custom code quality rules
 *
 * Features:
 * - Load custom rules from .quality/custom-rules.json
 * - Support multiple rule types: pattern, complexity, naming, structure
 * - Enable/disable rules individually
 * - Apply rule severity: critical, warning, info
 * - Calculate impact on overall score
 *
 * Architecture:
 * - RulesEngine: Main orchestrator for loading and executing rules
 * - RuleExecutor: Executes individual rules against source files
 * - RuleScoringCalculator: Calculates score adjustments based on violations
 */

import { Finding, Severity } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Supported rule types
 */
export type RuleType = 'pattern' | 'complexity' | 'naming' | 'structure';

/**
 * Severity levels for rules
 */
export type RuleSeverity = 'critical' | 'warning' | 'info';

/**
 * Base rule interface
 */
export interface BaseRule {
  id: string;
  type: RuleType;
  severity: RuleSeverity;
  message: string;
  enabled: boolean;
  description?: string;
}

/**
 * Pattern-based rule (regex matching)
 */
export interface PatternRule extends BaseRule {
  type: 'pattern';
  pattern: string;
  excludePatterns?: string[];
  fileExtensions?: string[];
}

/**
 * Complexity threshold rule
 */
export interface ComplexityRule extends BaseRule {
  type: 'complexity';
  complexityType: 'lines' | 'parameters' | 'nesting' | 'cyclomaticComplexity';
  threshold: number;
}

/**
 * Naming convention rule
 */
export interface NamingRule extends BaseRule {
  type: 'naming';
  nameType: 'function' | 'variable' | 'class' | 'constant' | 'interface';
  pattern: string; // regex pattern for valid names
  excludePatterns?: string[];
}

/**
 * Structure rule (file organization)
 */
export interface StructureRule extends BaseRule {
  type: 'structure';
  check: 'maxFileSize' | 'missingExports' | 'invalidDependency' | 'orphanedFile';
  threshold?: number; // for maxFileSize
  config?: Record<string, unknown>;
}

/**
 * Union type of all rule types
 */
export type CustomRule = PatternRule | ComplexityRule | NamingRule | StructureRule;

/**
 * Rule violation result
 */
export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  file: string;
  line?: number;
  column?: number;
  message: string;
  severity: RuleSeverity;
  evidence?: string;
}

/**
 * Rules engine configuration
 */
export interface RulesEngineConfig {
  enabled: boolean;
  rulesFilePath: string;
  maxViolations?: number;
  stopOnCritical?: boolean;
}

/**
 * Execution result
 */
export interface RulesExecutionResult {
  violations: RuleViolation[];
  totalViolations: number;
  violationsBySeverity: {
    critical: number;
    warning: number;
    info: number;
  };
  scoreAdjustment: number;
  executionTime: number;
  rulesApplied: number;
}

/**
 * Main Rules Engine implementation
 */
export class RulesEngine {
  private config: RulesEngineConfig;
  private rules: CustomRule[] = [];
  private violations: RuleViolation[] = [];
  private startTime: number = 0;

  constructor(config: RulesEngineConfig) {
    this.config = config;
  }

  /**
   * Load rules from configuration file
   */
  async loadRules(): Promise<boolean> {
    if (!this.config.enabled) {
      logger.debug('Rules engine disabled');
      return true;
    }

    try {
      const { readFileSync } = await import('fs');
      const rulesContent = readFileSync(this.config.rulesFilePath, 'utf-8');
      const rulesConfig = JSON.parse(rulesContent);

      if (!rulesConfig.rules || !Array.isArray(rulesConfig.rules)) {
        logger.warn('Invalid rules configuration: missing rules array');
        return false;
      }

      this.rules = rulesConfig.rules.filter((rule: CustomRule) => this.validateRule(rule));
      logger.info(`Loaded ${this.rules.length} custom rules`);

      return true;
    } catch (error) {
      logger.warn(`Failed to load custom rules: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Validate rule structure
   */
  private validateRule(rule: any): rule is CustomRule {
    if (!rule.id || !rule.type || !rule.severity || !rule.message) {
      logger.warn(`Invalid rule structure: missing required fields in rule ${rule.id}`);
      return false;
    }

    if (!['pattern', 'complexity', 'naming', 'structure'].includes(rule.type)) {
      logger.warn(`Unknown rule type: ${rule.type}`);
      return false;
    }

    if (!['critical', 'warning', 'info'].includes(rule.severity)) {
      logger.warn(`Invalid severity level: ${rule.severity}`);
      return false;
    }

    // Type-specific validation
    if (rule.type === 'pattern' && !rule.pattern) {
      logger.warn(`Pattern rule ${rule.id} missing pattern`);
      return false;
    }

    if (rule.type === 'complexity' && typeof rule.threshold !== 'number') {
      logger.warn(`Complexity rule ${rule.id} missing threshold`);
      return false;
    }

    if (rule.type === 'naming' && !rule.pattern) {
      logger.warn(`Naming rule ${rule.id} missing pattern`);
      return false;
    }

    return true;
  }

  /**
   * Execute all enabled rules against source files
   */
  async executeRules(sourceFiles: string[]): Promise<RulesExecutionResult> {
    const startTime = performance.now();
    this.violations = [];

    if (!this.config.enabled || this.rules.length === 0) {
      return this.createEmptyResult(startTime);
    }

    const enabledRules = this.rules.filter((r) => r.enabled);

    for (const rule of enabledRules) {
      try {
        switch (rule.type) {
          case 'pattern':
            await this.executePatternRule(rule as PatternRule, sourceFiles);
            break;
          case 'complexity':
            await this.executeComplexityRule(rule as ComplexityRule, sourceFiles);
            break;
          case 'naming':
            await this.executeNamingRule(rule as NamingRule, sourceFiles);
            break;
          case 'structure':
            await this.executeStructureRule(rule as StructureRule, sourceFiles);
            break;
        }

        if (
          this.config.stopOnCritical &&
          this.violations.some((v) => v.severity === 'critical')
        ) {
          logger.warn('Stopping rule execution due to critical violation');
          break;
        }
      } catch (error) {
        logger.error(`Error executing rule ${rule.id}: ${(error as Error).message}`);
      }
    }

    const executionTime = performance.now() - startTime;
    return this.buildExecutionResult(enabledRules.length, executionTime);
  }

  /**
   * Execute pattern-based rule
   */
  private async executePatternRule(rule: PatternRule, sourceFiles: string[]): Promise<void> {
    try {
      const regex = new RegExp(rule.pattern, 'gm');
      const fileExtensions = rule.fileExtensions || ['.ts', '.tsx', '.js', '.jsx'];
      const excludeRegex = rule.excludePatterns?.map((p) => new RegExp(p, 'gm'));

      for (const file of sourceFiles) {
        if (!fileExtensions.some((ext) => file.endsWith(ext))) continue;

        try {
          const { readFileSync } = await import('fs');
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');

          for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            let match;

            while ((match = regex.exec(line)) !== null) {
              // Check exclude patterns
              if (excludeRegex?.some((ex) => ex.test(line))) {
                continue;
              }

              this.violations.push({
                ruleId: rule.id,
                ruleName: rule.message,
                file,
                line: lineIndex + 1,
                column: match.index + 1,
                message: rule.message,
                severity: rule.severity,
                evidence: line.trim(),
              });
            }
          }
        } catch (error) {
          logger.debug(`Failed to read file ${file} for pattern rule: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      logger.error(`Pattern rule ${rule.id} error: ${(error as Error).message}`);
    }
  }

  /**
   * Execute complexity-based rule
   */
  private async executeComplexityRule(rule: ComplexityRule, sourceFiles: string[]): Promise<void> {
    try {
      for (const file of sourceFiles) {
        if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.jsx')) {
          continue;
        }

        try {
          const { readFileSync } = await import('fs');
          const content = readFileSync(file, 'utf-8');
          const metrics = this.calculateFileComplexity(content, rule.complexityType);

          if (metrics.value > rule.threshold) {
            this.violations.push({
              ruleId: rule.id,
              ruleName: rule.message,
              file,
              line: metrics.line,
              message: `${rule.message}: ${metrics.value} (threshold: ${rule.threshold})`,
              severity: rule.severity,
              evidence: `${rule.complexityType}: ${metrics.value}`,
            });
          }
        } catch (error) {
          logger.debug(`Failed to analyze complexity in ${file}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      logger.error(`Complexity rule ${rule.id} error: ${(error as Error).message}`);
    }
  }

  /**
   * Execute naming convention rule
   */
  private async executeNamingRule(rule: NamingRule, sourceFiles: string[]): Promise<void> {
    try {
      const nameRegex = new RegExp(rule.pattern);
      const excludeRegex = rule.excludePatterns?.map((p) => new RegExp(p));

      for (const file of sourceFiles) {
        if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.jsx')) {
          continue;
        }

        try {
          const { readFileSync } = await import('fs');
          const content = readFileSync(file, 'utf-8');
          const violations = this.extractNamingViolations(content, rule, nameRegex, excludeRegex);

          this.violations.push(...violations);
        } catch (error) {
          logger.debug(`Failed to check naming in ${file}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      logger.error(`Naming rule ${rule.id} error: ${(error as Error).message}`);
    }
  }

  /**
   * Execute structure-based rule
   */
  private async executeStructureRule(rule: StructureRule, sourceFiles: string[]): Promise<void> {
    try {
      const { statSync } = await import('fs');

      for (const file of sourceFiles) {
        try {
          const stats = statSync(file);

          if (rule.check === 'maxFileSize' && rule.threshold) {
            const fileSizeKb = stats.size / 1024;
            if (fileSizeKb > rule.threshold) {
              this.violations.push({
                ruleId: rule.id,
                ruleName: rule.message,
                file,
                message: `${rule.message}: ${fileSizeKb.toFixed(2)}KB (threshold: ${rule.threshold}KB)`,
                severity: rule.severity,
              });
            }
          }
        } catch (error) {
          logger.debug(`Failed to check structure for ${file}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      logger.error(`Structure rule ${rule.id} error: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate complexity metrics for a file
   */
  private calculateFileComplexity(content: string, complexityType: string): { value: number; line?: number } {
    let value = 0;

    switch (complexityType) {
      case 'lines': {
        value = content.split('\n').length;
        break;
      }
      case 'parameters': {
        // Count function parameters
        const funcRegex = /function\s+\w+\s*\(([^)]*)\)|const\s+\w+\s*=\s*\(([^)]*)\)/gm;
        let match;
        const maxParams: number[] = [];

        while ((match = funcRegex.exec(content)) !== null) {
          const params = (match[1] || match[2] || '').split(',').filter((p) => p.trim());
          maxParams.push(params.length);
        }

        value = maxParams.length > 0 ? Math.max(...maxParams) : 0;
        break;
      }
      case 'nesting': {
        // Count maximum nesting depth
        let maxDepth = 0;
        let currentDepth = 0;

        for (const char of content) {
          if (char === '{' || char === '[' || char === '(') {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
          } else if (char === '}' || char === ']' || char === ')') {
            currentDepth--;
          }
        }

        value = maxDepth;
        break;
      }
      case 'cyclomaticComplexity': {
        // Simplified cyclomatic complexity: count decision points
        const decisions = (content.match(/\b(if|else|case|catch|for|while|&&|\|\||switch)\b/g) || []).length;
        value = decisions + 1; // Base complexity is 1
        break;
      }
      default:
        value = 0;
    }

    return { value };
  }

  /**
   * Extract naming violations from code
   */
  private extractNamingViolations(
    content: string,
    rule: NamingRule,
    nameRegex: RegExp,
    excludeRegex?: RegExp[]
  ): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip if matches exclude pattern
      if (excludeRegex?.some((ex) => ex.test(line))) {
        continue;
      }

      let names: string[] = [];

      // Extract names based on type
      switch (rule.nameType) {
        case 'function': {
          const funcMatches = line.matchAll(/(?:function|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
          names = [...funcMatches].map((m) => m[1]);
          break;
        }
        case 'variable': {
          const varMatches = line.matchAll(/(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
          names = [...varMatches].map((m) => m[1]);
          break;
        }
        case 'class': {
          const classMatches = line.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
          names = [...classMatches].map((m) => m[1]);
          break;
        }
        case 'constant': {
          const constMatches = line.matchAll(/(?:const)\s+([A-Z_][A-Z0-9_]*)\s*=/g);
          names = [...constMatches].map((m) => m[1]);
          break;
        }
        case 'interface': {
          const intMatches = line.matchAll(/interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
          names = [...intMatches].map((m) => m[1]);
          break;
        }
      }

      for (const name of names) {
        if (!nameRegex.test(name)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.message,
            file: '', // Will be set by caller
            line: lineIndex + 1,
            column: line.indexOf(name) + 1,
            message: `${rule.message}: ${name}`,
            severity: rule.severity,
            evidence: line.trim(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * Build execution result from violations
   */
  private buildExecutionResult(rulesApplied: number, executionTime: number): RulesExecutionResult {
    const violationsBySeverity = {
      critical: this.violations.filter((v) => v.severity === 'critical').length,
      warning: this.violations.filter((v) => v.severity === 'warning').length,
      info: this.violations.filter((v) => v.severity === 'info').length,
    };

    const scoreAdjustment = this.calculateScoreAdjustment(violationsBySeverity);

    return {
      violations: this.violations.slice(0, this.config.maxViolations || 100),
      totalViolations: this.violations.length,
      violationsBySeverity,
      scoreAdjustment,
      executionTime,
      rulesApplied,
    };
  }

  /**
   * Create empty result when engine is disabled
   */
  private createEmptyResult(startTime: number): RulesExecutionResult {
    return {
      violations: [],
      totalViolations: 0,
      violationsBySeverity: { critical: 0, warning: 0, info: 0 },
      scoreAdjustment: 0,
      executionTime: performance.now() - startTime,
      rulesApplied: 0,
    };
  }

  /**
   * Calculate score adjustment based on violations
   * Formula: critical -2, warning -1, info -0.5
   * Max penalty: -10 points
   */
  private calculateScoreAdjustment(violationsBySeverity: Record<string, number>): number {
    let adjustment = 0;

    // Apply penalties by severity
    adjustment -= violationsBySeverity.critical * 2;
    adjustment -= violationsBySeverity.warning * 1;
    adjustment -= violationsBySeverity.info * 0.5;

    // Cap at -10 points maximum
    return Math.max(adjustment, -10);
  }

  /**
   * Convert rule violations to findings
   */
  convertToFindings(violations: RuleViolation[]): Finding[] {
    return violations.map((violation) => ({
      id: `custom-rule-${violation.ruleId}`,
      severity: this.mapSeverity(violation.severity),
      category: 'codeQuality',
      title: violation.ruleName,
      description: violation.message,
      location: violation.file
        ? {
            file: violation.file,
            line: violation.line,
            column: violation.column,
          }
        : undefined,
      remediation: `Fix violation of rule: ${violation.ruleName}`,
      evidence: violation.evidence,
      moreInfo: `Custom rule ID: ${violation.ruleId}`,
      affectedItems: 1,
    }));
  }

  /**
   * Map rule severity to Finding severity
   */
  private mapSeverity(ruleSeverity: RuleSeverity): Severity {
    const severityMap: Record<RuleSeverity, Severity> = {
      critical: 'critical',
      warning: 'high',
      info: 'low',
    };
    return severityMap[ruleSeverity];
  }

  /**
   * Get all loaded rules
   */
  getRules(): CustomRule[] {
    return [...this.rules];
  }

  /**
   * Get rules by type
   */
  getRulesByType(type: RuleType): CustomRule[] {
    return this.rules.filter((r) => r.type === type);
  }

  /**
   * Validate rules configuration
   */
  validateRulesConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.rules || this.rules.length === 0) {
      errors.push('No rules loaded');
      return { valid: false, errors };
    }

    for (const rule of this.rules) {
      if (!this.validateRule(rule)) {
        errors.push(`Invalid rule: ${rule.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default RulesEngine;
