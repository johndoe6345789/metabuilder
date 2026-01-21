/**
 * Rules Loader and Validator
 * Handles loading, validating, and managing custom rules configuration
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import type { CustomRule, PatternRule, ComplexityRule, NamingRule, StructureRule } from './RulesEngine.js';

/**
 * Configuration for rules loader
 */
export interface RulesLoaderConfig {
  rulesDirectory: string;
  rulesFileName: string;
}

/**
 * Rules configuration file structure
 */
export interface RulesConfigFile {
  version?: string;
  description?: string;
  rules: CustomRule[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Rules Loader
 */
export class RulesLoader {
  private config: RulesLoaderConfig;

  constructor(config: RulesLoaderConfig) {
    this.config = config;
  }

  /**
   * Load rules from file
   */
  async loadRulesFromFile(): Promise<CustomRule[]> {
    const filePath = this.getFilePath();

    if (!existsSync(filePath)) {
      logger.info(`No custom rules file found at ${filePath}`);
      return [];
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const rulesConfig: RulesConfigFile = JSON.parse(content);

      if (!rulesConfig.rules || !Array.isArray(rulesConfig.rules)) {
        logger.warn('Invalid rules configuration: missing rules array');
        return [];
      }

      logger.info(`Loaded ${rulesConfig.rules.length} rules from ${filePath}`);
      return rulesConfig.rules;
    } catch (error) {
      logger.error(`Failed to load rules from ${filePath}: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Save rules to file
   */
  async saveRulesToFile(rules: CustomRule[]): Promise<boolean> {
    try {
      const filePath = this.getFilePath();
      const directory = this.config.rulesDirectory;

      // Ensure directory exists
      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      const config: RulesConfigFile = {
        version: '1.0.0',
        description: 'Custom code quality rules',
        rules,
      };

      writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
      logger.info(`Saved ${rules.length} rules to ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save rules: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Validate rules configuration
   */
  validateRulesConfig(rules: CustomRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rules || !Array.isArray(rules)) {
      errors.push('Rules must be an array');
      return { valid: false, errors, warnings };
    }

    if (rules.length === 0) {
      warnings.push('No rules defined');
    }

    const ruleIds = new Set<string>();

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const rulePrefix = `Rule ${i + 1}`;

      // Validate base fields
      if (!rule.id) {
        errors.push(`${rulePrefix}: Missing required field 'id'`);
        continue;
      }

      if (ruleIds.has(rule.id)) {
        errors.push(`${rulePrefix}: Duplicate rule ID '${rule.id}'`);
      }
      ruleIds.add(rule.id);

      if (!rule.type) {
        errors.push(`${rulePrefix} (${rule.id}): Missing required field 'type'`);
      } else if (!['pattern', 'complexity', 'naming', 'structure'].includes(rule.type)) {
        errors.push(`${rulePrefix} (${rule.id}): Invalid type '${rule.type}'`);
      }

      if (!rule.severity) {
        errors.push(`${rulePrefix} (${rule.id}): Missing required field 'severity'`);
      } else if (!['critical', 'warning', 'info'].includes(rule.severity)) {
        errors.push(`${rulePrefix} (${rule.id}): Invalid severity '${rule.severity}'`);
      }

      if (!rule.message) {
        errors.push(`${rulePrefix} (${rule.id}): Missing required field 'message'`);
      }

      // Type-specific validation
      this.validateRuleByType(rule, errors, warnings, rulePrefix);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate rule based on type
   */
  private validateRuleByType(
    rule: CustomRule,
    errors: string[],
    warnings: string[],
    prefix: string
  ): void {
    const ruleId = rule.id;

    switch (rule.type) {
      case 'pattern': {
        const patternRule = rule as PatternRule;
        if (!patternRule.pattern) {
          errors.push(`${prefix} (${ruleId}): Pattern rule missing 'pattern' field`);
        } else {
          // Validate regex
          try {
            new RegExp(patternRule.pattern);
          } catch (e) {
            errors.push(
              `${prefix} (${ruleId}): Invalid regex pattern '${patternRule.pattern}': ${(e as Error).message}`
            );
          }
        }

        if (patternRule.excludePatterns) {
          for (const pattern of patternRule.excludePatterns) {
            try {
              new RegExp(pattern);
            } catch (e) {
              errors.push(
                `${prefix} (${ruleId}): Invalid exclude pattern '${pattern}': ${(e as Error).message}`
              );
            }
          }
        }
        break;
      }

      case 'complexity': {
        const complexRule = rule as ComplexityRule;
        if (!complexRule.complexityType) {
          errors.push(`${prefix} (${ruleId}): Complexity rule missing 'complexityType' field`);
        } else if (!['lines', 'parameters', 'nesting', 'cyclomaticComplexity'].includes(complexRule.complexityType)) {
          errors.push(`${prefix} (${ruleId}): Invalid complexityType '${complexRule.complexityType}'`);
        }

        if (typeof complexRule.threshold !== 'number' || complexRule.threshold < 0) {
          errors.push(`${prefix} (${ruleId}): Complexity rule must have a positive numeric 'threshold'`);
        }
        break;
      }

      case 'naming': {
        const namingRule = rule as NamingRule;
        if (!namingRule.nameType) {
          errors.push(`${prefix} (${ruleId}): Naming rule missing 'nameType' field`);
        } else if (!['function', 'variable', 'class', 'constant', 'interface'].includes(namingRule.nameType)) {
          errors.push(`${prefix} (${ruleId}): Invalid nameType '${namingRule.nameType}'`);
        }

        if (!namingRule.pattern) {
          errors.push(`${prefix} (${ruleId}): Naming rule missing 'pattern' field`);
        } else {
          try {
            new RegExp(namingRule.pattern);
          } catch (e) {
            errors.push(
              `${prefix} (${ruleId}): Invalid regex pattern '${namingRule.pattern}': ${(e as Error).message}`
            );
          }
        }
        break;
      }

      case 'structure': {
        const structRule = rule as StructureRule;
        if (!structRule.check) {
          errors.push(`${prefix} (${ruleId}): Structure rule missing 'check' field`);
        } else if (!['maxFileSize', 'missingExports', 'invalidDependency', 'orphanedFile'].includes(structRule.check)) {
          errors.push(`${prefix} (${ruleId}): Invalid check type '${structRule.check}'`);
        }

        if (structRule.check === 'maxFileSize' && !structRule.threshold) {
          errors.push(`${prefix} (${ruleId}): maxFileSize check requires a 'threshold' in KB`);
        }
        break;
      }
    }
  }

  /**
   * Create sample rules file
   */
  async createSampleRulesFile(): Promise<boolean> {
    const sampleRules: RulesConfigFile = {
      version: '1.0.0',
      description: 'Custom code quality rules - customize these based on your project needs',
      rules: [
        {
          id: 'no-console-logs',
          type: 'pattern',
          severity: 'warning',
          pattern: 'console\\.(log|warn|error)\\s*\\(',
          message: 'Remove console.log statements',
          enabled: true,
          description: 'Avoid leaving console logs in production code',
          fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
          excludePatterns: ['// console.log'],
        } as PatternRule,
        {
          id: 'max-function-lines',
          type: 'complexity',
          severity: 'warning',
          complexityType: 'lines',
          threshold: 50,
          message: 'Function exceeds 50 lines',
          enabled: true,
          description: 'Functions should be kept under 50 lines for readability',
        } as ComplexityRule,
        {
          id: 'function-naming-convention',
          type: 'naming',
          severity: 'info',
          nameType: 'function',
          pattern: '^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*Async$',
          message: 'Function names should use camelCase',
          enabled: true,
          description: 'Enforce camelCase naming for functions',
          excludePatterns: ['React.memo', 'export default'],
        } as NamingRule,
        {
          id: 'max-file-size',
          type: 'structure',
          severity: 'warning',
          check: 'maxFileSize',
          threshold: 300, // 300 KB
          message: 'File exceeds maximum size',
          enabled: true,
          description: 'Large files should be broken into smaller modules',
        } as StructureRule,
        {
          id: 'no-todo-comments',
          type: 'pattern',
          severity: 'info',
          pattern: '//\\s*TODO|//\\s*FIXME',
          message: 'TODO/FIXME comments should be addressed',
          enabled: false,
          fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
        } as PatternRule,
        {
          id: 'max-parameters',
          type: 'complexity',
          severity: 'warning',
          complexityType: 'parameters',
          threshold: 5,
          message: 'Function has too many parameters',
          enabled: true,
          description: 'Functions with more than 5 parameters are hard to use',
        } as ComplexityRule,
      ],
    };

    try {
      const filePath = this.getFilePath();
      const directory = this.config.rulesDirectory;

      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      writeFileSync(filePath, JSON.stringify(sampleRules, null, 2), 'utf-8');
      logger.info(`Created sample rules file at ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to create sample rules file: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get full path to rules file
   */
  private getFilePath(): string {
    return join(this.config.rulesDirectory, this.config.rulesFileName);
  }

  /**
   * Check if rules file exists
   */
  rulesFileExists(): boolean {
    return existsSync(this.getFilePath());
  }

  /**
   * Get rules file path (public method)
   */
  getRulesFilePath(): string {
    return this.getFilePath();
  }

  /**
   * List all rules in configuration
   */
  async listRules(): Promise<void> {
    const rules = await this.loadRulesFromFile();

    if (rules.length === 0) {
      logger.info('No custom rules defined');
      return;
    }

    logger.info(`Found ${rules.length} custom rules:`);
    console.log('');

    const groupedByType: Record<string, CustomRule[]> = {};
    for (const rule of rules) {
      if (!groupedByType[rule.type]) {
        groupedByType[rule.type] = [];
      }
      groupedByType[rule.type].push(rule);
    }

    for (const [type, typeRules] of Object.entries(groupedByType)) {
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
