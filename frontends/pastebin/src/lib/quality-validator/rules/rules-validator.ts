/**
 * Rule validation logic for RulesLoader
 */

import type {
  CustomRule,
  PatternRule,
  ComplexityRule,
  NamingRule,
  StructureRule,
  BaseRule,
} from './RulesEngine.js'
import type { ValidationResult } from './RulesLoader.js'

function validatePattern(
  rule: CustomRule,
  errors: string[],
  prefix: string,
): void {
  const p = rule as PatternRule
  if (!p.pattern) {
    errors.push(`${prefix} (${rule.id}): Pattern rule missing 'pattern'`)
  } else {
    try {
      new RegExp(p.pattern)
    } catch (e) {
      errors.push(
        // eslint-disable-next-line max-len
        `${prefix} (${rule.id}): Invalid regex '${p.pattern}': ${(e as Error).message}`,
      )
    }
  }
  if (p.excludePatterns) {
    for (const ep of p.excludePatterns) {
      try {
        new RegExp(ep)
      } catch (e) {
        errors.push(
          // eslint-disable-next-line max-len
          `${prefix} (${rule.id}): Invalid exclude pattern '${ep}': ${(e as Error).message}`,
        )
      }
    }
  }
}

function validateComplexity(
  rule: CustomRule,
  errors: string[],
  prefix: string,
): void {
  const c = rule as ComplexityRule
  const valid = ['lines', 'parameters', 'nesting', 'cyclomaticComplexity']
  if (!c.complexityType) {
    errors.push(
      `${prefix} (${rule.id}): Complexity rule missing 'complexityType'`,
    )
  } else if (!valid.includes(c.complexityType)) {
    errors.push(
      `${prefix} (${rule.id}): Invalid complexityType '${c.complexityType}'`,
    )
  }
  if (typeof c.threshold !== 'number' || c.threshold < 0) {
    errors.push(
      `${prefix} (${rule.id}): Complexity rule needs positive 'threshold'`,
    )
  }
}

function validateNaming(
  rule: CustomRule,
  errors: string[],
  prefix: string,
): void {
  const n = rule as NamingRule
  const valid = ['function', 'variable', 'class', 'constant', 'interface']
  if (!n.nameType) {
    errors.push(`${prefix} (${rule.id}): Naming rule missing 'nameType'`)
  } else if (!valid.includes(n.nameType)) {
    errors.push(`${prefix} (${rule.id}): Invalid nameType '${n.nameType}'`)
  }
  if (!n.pattern) {
    errors.push(`${prefix} (${rule.id}): Naming rule missing 'pattern'`)
  } else {
    try {
      new RegExp(n.pattern)
    } catch (e) {
      errors.push(
        // eslint-disable-next-line max-len
        `${prefix} (${rule.id}): Invalid regex '${n.pattern}': ${(e as Error).message}`,
      )
    }
  }
}

function validateStructure(
  rule: CustomRule,
  errors: string[],
  prefix: string,
): void {
  const s = rule as StructureRule
  const valid = [
    'maxFileSize',
    'missingExports',
    'invalidDependency',
    'orphanedFile',
  ]
  if (!s.check) {
    errors.push(`${prefix} (${rule.id}): Structure rule missing 'check'`)
  } else if (!valid.includes(s.check)) {
    errors.push(`${prefix} (${rule.id}): Invalid check type '${s.check}'`)
  }
  if (s.check === 'maxFileSize' && !s.threshold) {
    errors.push(
      `${prefix} (${rule.id}): maxFileSize check requires 'threshold' in KB`,
    )
  }
}

export function validateRulesConfig(rules: CustomRule[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!rules || !Array.isArray(rules)) {
    errors.push('Rules must be an array')
    return { valid: false, errors, warnings }
  }
  if (rules.length === 0) warnings.push('No rules defined')

  const ruleIds = new Set<string>()

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const ruleBase = rule as BaseRule
    const prefix = `Rule ${i + 1}`

    if (!rule.id) {
      errors.push(`${prefix}: Missing required field 'id'`)
      continue
    }
    if (ruleIds.has(rule.id)) {
      errors.push(`${prefix}: Duplicate rule ID '${rule.id}'`)
    }
    ruleIds.add(rule.id)

    if (!ruleBase.type) {
      errors.push(`${prefix} (${rule.id}): Missing 'type'`)
    } else if (
      !['pattern', 'complexity', 'naming', 'structure'].includes(ruleBase.type)
    ) {
      errors.push(`${prefix} (${rule.id}): Invalid type '${ruleBase.type}'`)
    }

    if (!ruleBase.severity) {
      errors.push(`${prefix} (${rule.id}): Missing 'severity'`)
    } else if (!['critical', 'warning', 'info'].includes(ruleBase.severity)) {
      errors.push(
        `${prefix} (${rule.id}): Invalid severity '${ruleBase.severity}'`,
      )
    }

    if (!ruleBase.message)
      errors.push(`${prefix} (${rule.id}): Missing 'message'`)

    switch (rule.type) {
      case 'pattern':
        validatePattern(rule, errors, prefix)
        break
      case 'complexity':
        validateComplexity(rule, errors, prefix)
        break
      case 'naming':
        validateNaming(rule, errors, prefix)
        break
      case 'structure':
        validateStructure(rule, errors, prefix)
        break
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
