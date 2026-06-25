/**
 * Custom Rules Engine Exports
 * Central export point for the rules engine and related utilities
 */
export { RulesEngine, } from './RulesEngine.js';
export { RulesLoader, } from './RulesLoader.js';
export { RulesScoringIntegration, DEFAULT_RULES_SCORING_CONFIG, } from './RulesScoringIntegration.js';
// Create and export singletons
import { RulesEngine } from './RulesEngine.js';
import { RulesLoader } from './RulesLoader.js';
import { RulesScoringIntegration } from './RulesScoringIntegration.js';
const RULES_DIRECTORY = '.quality';
const RULES_FILE_NAME = 'custom-rules.json';
export const rulesLoader = new RulesLoader({
    rulesDirectory: RULES_DIRECTORY,
    rulesFileName: RULES_FILE_NAME,
});
export const rulesEngine = new RulesEngine({
    enabled: true,
    rulesFilePath: `${RULES_DIRECTORY}/${RULES_FILE_NAME}`,
    maxViolations: 100,
    stopOnCritical: false,
});
export const rulesScoringIntegration = new RulesScoringIntegration();
