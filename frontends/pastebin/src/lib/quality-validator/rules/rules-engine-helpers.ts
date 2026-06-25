/**
 * RulesEngine helper functions for validation and result building
 */

import type { Finding, Severity } from '../types/index.js'
import { logger } from '../utils/logger.js'
import type {
  CustomRule,
  BaseRule,
  RuleSeverity,
  RuleViolation,
  RulesEngineConfig,
  RulesExecutionResult,
} from './rule-types.js'

export function validateRule(rule: unknown): rule is CustomRule {
  const r = rule as Record<string, unknown>
  if (!r.id || !r.type || !r.severity || !r.message) {
    logger.warn(`Invalid rule: missing required fields in ${r.id}`)
    return false
  }
  const validTypes = ['pattern', 'complexity', 'naming', 'structure']
  if (!validTypes.includes(r.type as string)) {
    logger.warn(`Unknown rule type: ${r.type}`)
    return false
  }
  const validSev = ['critical', 'warning', 'info']
  if (!validSev.includes(r.severity as string)) {
    logger.warn(`Invalid severity: ${r.severity}`)
    return false
  }
  if (r.type === 'pattern' && !r.pattern) {
    logger.warn(`Pattern rule ${r.id} missing pattern`)
    return false
  }
  if (r.type === 'complexity' && typeof r.threshold !== 'number') {
    logger.warn(`Complexity rule ${r.id} missing threshold`)
    return false
  }
  if (r.type === 'naming' && !r.pattern) {
    logger.warn(`Naming rule ${r.id} missing pattern`)
    return false
  }
  return true
}

export function buildRulesResult(
  violations: RuleViolation[],
  rulesApplied: number,
  startTime: number,
  config: RulesEngineConfig,
): RulesExecutionResult {
  const bySev = {
    critical: violations.filter(v => v.severity === 'critical').length,
    warning: violations.filter(v => v.severity === 'warning').length,
    info: violations.filter(v => v.severity === 'info').length,
  }
  return {
    violations: violations.slice(0, config.maxViolations || 100),
    totalViolations: violations.length,
    violationsBySeverity: bySev,
    scoreAdjustment: Math.max(
      -bySev.critical * 2 - bySev.warning - bySev.info * 0.5,
      -10,
    ),
    executionTime: performance.now() - startTime,
    rulesApplied,
  }
}

export function emptyRulesResult(startTime: number): RulesExecutionResult {
  return {
    violations: [],
    totalViolations: 0,
    violationsBySeverity: { critical: 0, warning: 0, info: 0 },
    scoreAdjustment: 0,
    executionTime: performance.now() - startTime,
    rulesApplied: 0,
  }
}

export function mapRuleSeverity(s: RuleSeverity): Severity {
  const map: Record<RuleSeverity, Severity> = {
    critical: 'critical',
    warning: 'high',
    info: 'low',
  }
  return map[s]
}

export function violationsToFindings(violations: RuleViolation[]): Finding[] {
  return violations.map(v => ({
    id: `custom-rule-${v.ruleId}`,
    severity: mapRuleSeverity(v.severity),
    category: 'codeQuality',
    title: v.ruleName,
    description: v.message,
    location: v.file
      ? { file: v.file, line: v.line, column: v.column }
      : undefined,
    remediation: `Fix violation of rule: ${v.ruleName}`,
    evidence: v.evidence,
    moreInfo: `Custom rule ID: ${v.ruleId}`,
    affectedItems: 1,
  }))
}

export function checkRulesConfig(rules: CustomRule[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (!rules.length) {
    errors.push('No rules loaded')
    return { valid: false, errors }
  }
  for (const rule of rules) {
    if (!validateRule(rule)) {
      errors.push(`Invalid rule: ${(rule as BaseRule).id}`)
    }
  }
  return { valid: errors.length === 0, errors }
}
