/**
 * Custom Rules Engine for Quality Validator
 */

import type { Finding } from '../types/index.js';
import { logger } from '../utils/logger.js';
import type {
  CustomRule, RuleType, RuleSeverity, BaseRule,
  RuleViolation, RulesEngineConfig, RulesExecutionResult,
} from './rule-types.js';
import {
  executePatternRule, executeComplexityRule,
  executeNamingRule, executeStructureRule,
} from './rule-executor.js';
import {
  validateRule, buildRulesResult, emptyRulesResult,
  violationsToFindings, checkRulesConfig,
} from './rules-engine-helpers.js';

export type {
  RuleType, RuleSeverity, BaseRule, CustomRule,
  RuleViolation, RulesEngineConfig, RulesExecutionResult,
} from './rule-types.js';
export {
  PatternRule, ComplexityRule, NamingRule, StructureRule,
} from './rule-types.js';

export class RulesEngine {
  private config: RulesEngineConfig;
  private rules: CustomRule[] = [];
  private violations: RuleViolation[] = [];
  constructor(config: RulesEngineConfig) { this.config = config; }

  async loadRules(): Promise<boolean> {
    if (!this.config.enabled) { logger.debug('Rules disabled'); return true; }
    try {
      const { readFileSync } = await import('fs');
      const parsed = JSON.parse(
        readFileSync(this.config.rulesFilePath, 'utf-8')
      );
      if (!parsed.rules || !Array.isArray(parsed.rules)) {
        logger.warn('Invalid rules config: missing rules array');
        return false;
      }
      this.rules = parsed.rules.filter((r: CustomRule) => validateRule(r));
      logger.info(`Loaded ${this.rules.length} custom rules`);
      return true;
    } catch (e) {
      logger.warn(`Failed to load rules: ${(e as Error).message}`);
      return false;
    }
  }

  async executeRules(files: string[]): Promise<RulesExecutionResult> {
    const t0 = performance.now();
    this.violations = [];
    if (!this.config.enabled || !this.rules.length) {
      return emptyRulesResult(t0);
    }
    const enabled = this.rules.filter(r => r.enabled);
    for (const rule of enabled) {
      try {
        switch (rule.type) {
          case 'pattern':
            await executePatternRule(rule, files, this.violations); break;
          case 'complexity':
            await executeComplexityRule(rule, files, this.violations); break;
          case 'naming':
            await executeNamingRule(rule, files, this.violations); break;
          case 'structure':
            await executeStructureRule(rule, files, this.violations); break;
        }
        if (
          this.config.stopOnCritical &&
          this.violations.some(v => v.severity === 'critical')
        ) { logger.warn('Stopping on critical'); break; }
      } catch (e) {
        logger.error(`Rule ${rule.id}: ${(e as Error).message}`);
      }
    }
    return buildRulesResult(
      this.violations, enabled.length, t0, this.config
    );
  }

  convertToFindings(v: RuleViolation[]): Finding[] {
    return violationsToFindings(v);
  }
  getRules = () => [...this.rules];
  getRulesByType = (t: RuleType) => this.rules.filter(r => r.type === t);
  validateRulesConfig = () => checkRulesConfig(this.rules);
}

export default RulesEngine;
