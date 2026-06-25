/**
 * Custom Rules Engine for Quality Validator
 */
import { logger } from '../utils/logger.js';
import { executePatternRule, executeComplexityRule, executeNamingRule, executeStructureRule, } from './rule-executor.js';
import { validateRule, buildRulesResult, emptyRulesResult, violationsToFindings, checkRulesConfig, } from './rules-engine-helpers.js';
export class RulesEngine {
    constructor(config) {
        this.rules = [];
        this.violations = [];
        this.getRules = () => [...this.rules];
        this.getRulesByType = (t) => this.rules.filter(r => r.type === t);
        this.validateRulesConfig = () => checkRulesConfig(this.rules);
        this.config = config;
    }
    async loadRules() {
        if (!this.config.enabled) {
            logger.debug('Rules disabled');
            return true;
        }
        try {
            const { readFileSync } = await import('fs');
            const parsed = JSON.parse(readFileSync(this.config.rulesFilePath, 'utf-8'));
            if (!parsed.rules || !Array.isArray(parsed.rules)) {
                logger.warn('Invalid rules config: missing rules array');
                return false;
            }
            this.rules = parsed.rules.filter((r) => validateRule(r));
            logger.info(`Loaded ${this.rules.length} custom rules`);
            return true;
        }
        catch (e) {
            logger.warn(`Failed to load rules: ${e.message}`);
            return false;
        }
    }
    async executeRules(files) {
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
                        await executePatternRule(rule, files, this.violations);
                        break;
                    case 'complexity':
                        await executeComplexityRule(rule, files, this.violations);
                        break;
                    case 'naming':
                        await executeNamingRule(rule, files, this.violations);
                        break;
                    case 'structure':
                        await executeStructureRule(rule, files, this.violations);
                        break;
                }
                if (this.config.stopOnCritical &&
                    this.violations.some(v => v.severity === 'critical')) {
                    logger.warn('Stopping on critical');
                    break;
                }
            }
            catch (e) {
                logger.error(`Rule ${rule.id}: ${e.message}`);
            }
        }
        return buildRulesResult(this.violations, enabled.length, t0, this.config);
    }
    convertToFindings(v) {
        return violationsToFindings(v);
    }
}
export default RulesEngine;
