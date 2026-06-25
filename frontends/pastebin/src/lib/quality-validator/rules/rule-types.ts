/**
 * Type definitions for the custom Rules Engine
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Finding, Severity } from '../types/index.js'

export type RuleType = 'pattern' | 'complexity' | 'naming' | 'structure'
export type RuleSeverity = 'critical' | 'warning' | 'info'

export interface BaseRule {
  id: string
  type: RuleType
  severity: RuleSeverity
  message: string
  enabled: boolean
  description?: string
}

export interface PatternRule extends BaseRule {
  type: 'pattern'
  pattern: string
  excludePatterns?: string[]
  fileExtensions?: string[]
}

export interface ComplexityRule extends BaseRule {
  type: 'complexity'
  complexityType: 'lines' | 'parameters' | 'nesting' | 'cyclomaticComplexity'
  threshold: number
}

export interface NamingRule extends BaseRule {
  type: 'naming'
  nameType: 'function' | 'variable' | 'class' | 'constant' | 'interface'
  pattern: string
  excludePatterns?: string[]
}

export interface StructureRule extends BaseRule {
  type: 'structure'
  check: 'maxFileSize' | 'missingExports' | 'invalidDependency' | 'orphanedFile'
  threshold?: number
  config?: Record<string, unknown>
}

export type CustomRule =
  | PatternRule
  | ComplexityRule
  | NamingRule
  | StructureRule

export interface RuleViolation {
  ruleId: string
  ruleName: string
  file: string
  line?: number
  column?: number
  message: string
  severity: RuleSeverity
  evidence?: string
}

export interface RulesEngineConfig {
  enabled: boolean
  rulesFilePath: string
  maxViolations?: number
  stopOnCritical?: boolean
}

export interface RulesExecutionResult {
  violations: RuleViolation[]
  totalViolations: number
  violationsBySeverity: {
    critical: number
    warning: number
    info: number
  }
  scoreAdjustment: number
  executionTime: number
  rulesApplied: number
}
