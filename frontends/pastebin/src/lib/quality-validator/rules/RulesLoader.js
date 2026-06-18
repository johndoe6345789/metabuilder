/**
 * Rules Loader and Validator
 * Handles loading, validating, and managing custom rules configuration
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { SAMPLE_RULES_CONFIG } from './sample-rules.js';
import { validateRulesConfig } from './rules-validator.js';
export class RulesLoader {
    constructor(config) {
        this.config = config;
    }
    async loadRulesFromFile() {
        const filePath = this.getFilePath();
        if (!existsSync(filePath)) {
            logger.info(`No custom rules file found at ${filePath}`);
            return [];
        }
        try {
            const content = readFileSync(filePath, 'utf-8');
            const rulesConfig = JSON.parse(content);
            if (!rulesConfig.rules || !Array.isArray(rulesConfig.rules)) {
                logger.warn('Invalid rules configuration: missing rules array');
                return [];
            }
            logger.info(`Loaded ${rulesConfig.rules.length} rules from ${filePath}`);
            return rulesConfig.rules;
        }
        catch (error) {
            logger.error(`Failed to load rules from ${filePath}: ${error.message}`);
            return [];
        }
    }
    async saveRulesToFile(rules) {
        try {
            const filePath = this.getFilePath();
            const directory = this.config.rulesDirectory;
            if (!existsSync(directory))
                mkdirSync(directory, { recursive: true });
            const cfg = {
                version: '1.0.0',
                description: 'Custom code quality rules',
                rules,
            };
            writeFileSync(filePath, JSON.stringify(cfg, null, 2), 'utf-8');
            logger.info(`Saved ${rules.length} rules to ${filePath}`);
            return true;
        }
        catch (error) {
            logger.error(`Failed to save rules: ${error.message}`);
            return false;
        }
    }
    validateRulesConfig(rules) {
        return validateRulesConfig(rules);
    }
    async createSampleRulesFile() {
        try {
            const filePath = this.getFilePath();
            const directory = this.config.rulesDirectory;
            if (!existsSync(directory))
                mkdirSync(directory, { recursive: true });
            writeFileSync(filePath, JSON.stringify(SAMPLE_RULES_CONFIG, null, 2), 'utf-8');
            logger.info(`Created sample rules file at ${filePath}`);
            return true;
        }
        catch (error) {
            logger.error(`Failed to create sample rules file: ${error.message}`);
            return false;
        }
    }
    getFilePath() {
        return join(this.config.rulesDirectory, this.config.rulesFileName);
    }
    rulesFileExists() {
        return existsSync(this.getFilePath());
    }
    getRulesFilePath() {
        return this.getFilePath();
    }
    async listRules() {
        const rules = await this.loadRulesFromFile();
        if (rules.length === 0) {
            logger.info('No custom rules defined');
            return;
        }
        logger.info(`Found ${rules.length} custom rules:`);
        console.log('');
        const grouped = {};
        for (const rule of rules) {
            if (!grouped[rule.type])
                grouped[rule.type] = [];
            grouped[rule.type].push(rule);
        }
        for (const [type, typeRules] of Object.entries(grouped)) {
            console.log(`  ${type.toUpperCase()} Rules:`);
            for (const rule of typeRules) {
                const status = rule.enabled ? 'ENABLED' : 'DISABLED';
                console.log(`    - [${status}] ${rule.id} (${rule.severity})`);
                console.log(`      ${rule.message}`);
            }
            console.log('');
        }
    }
}
export default RulesLoader;
