/**
 * Configuration Loader for Quality Validator
 * Handles loading, validation, and merging of configurations
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Configuration,
  CodeQualityConfig,
  TestCoverageConfig,
  ArchitectureConfig,
  SecurityConfig,
  ScoringConfig,
  ReportingConfig,
  HistoryConfig,
  ConfigurationError,
  CommandLineOptions,
} from '../types/index.js';
import { profileManager, ProfileDefinition } from './ProfileManager';

/**
 * Default configuration with sensible defaults for all quality checks
 */
const DEFAULT_CONFIG: Configuration = {
  projectName: 'snippet-pastebin',
  codeQuality: {
    enabled: true,
    complexity: {
      enabled: true,
      max: 15,
      warning: 12,
      ignorePatterns: ['**/node_modules/**', '**/dist/**'],
    },
    duplication: {
      enabled: true,
      maxPercent: 5,
      warningPercent: 3,
      minBlockSize: 4,
      ignoredPatterns: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts', '**/*.test.ts'],
    },
    linting: {
      enabled: true,
      maxErrors: 3,
      maxWarnings: 15,
      ignoredRules: [],
      customRules: [],
    },
  },
  testCoverage: {
    enabled: true,
    minimumPercent: 80,
    warningPercent: 60,
    byType: {
      line: 80,
      branch: 75,
      function: 80,
      statement: 80,
    },
    effectivenessScore: {
      minAssertionsPerTest: 1,
      maxMockUsagePercent: 50,
      checkTestNaming: true,
      checkTestIsolation: true,
    },
    ignoredFiles: ['**/node_modules/**', '**/dist/**'],
  },
  architecture: {
    enabled: true,
    components: {
      enabled: true,
      maxLines: 500,
      warningLines: 300,
      validateAtomicDesign: true,
      validatePropTypes: true,
    },
    dependencies: {
      enabled: true,
      allowCircularDependencies: false,
      allowCrossLayerDependencies: false,
      maxExternalDeps: undefined,
    },
    patterns: {
      enabled: true,
      validateRedux: true,
      validateHooks: true,
      validateReactBestPractices: true,
    },
  },
  security: {
    enabled: true,
    vulnerabilities: {
      enabled: true,
      allowCritical: 0,
      allowHigh: 2,
      checkTransitive: true,
    },
    patterns: {
      enabled: true,
      checkSecrets: true,
      checkDangerousPatterns: true,
      checkInputValidation: true,
      checkXssRisks: true,
    },
    performance: {
      enabled: true,
      checkRenderOptimization: true,
      checkBundleSize: true,
      checkUnusedDeps: true,
    },
  },
  scoring: {
    weights: {
      codeQuality: 0.3,
      testCoverage: 0.35,
      architecture: 0.2,
      security: 0.15,
    },
    passingGrade: 'B',
    passingScore: 80,
  },
  reporting: {
    defaultFormat: 'console',
    colors: true,
    verbose: false,
    outputDirectory: '.quality',
    includeRecommendations: true,
    includeTrends: true,
  },
  history: {
    enabled: true,
    keepRuns: 10,
    storePath: '.quality/history.json',
    compareToPrevious: true,
  },
  excludePaths: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/__tests__/**',
    '.next/**',
    'build/**',
  ],
};

/**
 * Loads configuration from various sources with precedence:
 * 1. CLI options (highest priority)
 * 2. .qualityrc.json file in project root
 * 3. Environment variables
 * 4. Default configuration (lowest priority)
 */
export class ConfigLoader {
  private static instance: ConfigLoader;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Load configuration from file or use defaults
   */
  async loadConfiguration(configPath?: string): Promise<Configuration> {
    let config: Partial<Configuration> = {};

    // 0. Initialize profile manager
    await profileManager.initialize();

    // 1. Start with defaults (deep copy to avoid mutating DEFAULT_CONFIG)
    const finalConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // 2. Load from config file if exists
    if (configPath) {
      config = this.loadConfigFile(configPath);
    } else {
      // Try default locations
      const defaultLocations = ['.qualityrc.json', '.quality/config.json'];
      for (const loc of defaultLocations) {
        if (fs.existsSync(loc)) {
          config = this.loadConfigFile(loc);
          break;
        }
      }
    }

    // 3. Load from environment variables
    const envConfig = this.loadFromEnvironment();

    // 4. Merge all sources (CLI > env > file > defaults)
    const merged = this.deepMerge(finalConfig, config, envConfig);

    // 5. Validate configuration first (before applying profile)
    this.validateConfiguration(merged);

    // 6. Apply profile if specified (only after validation passes)
    const profileName = merged.profile || process.env.QUALITY_PROFILE || 'moderate';
    try {
      const profile = profileManager.getProfile(profileName);
      merged.scoring.weights = profile.weights;
      merged.profile = profileName;
    } catch (error) {
      // If profile is not found, log warning but continue with defaults
      console.warn(`Profile not found: ${profileName}, using defaults`);
    }

    return merged;
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfigFile(filePath: string): Partial<Configuration> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new ConfigurationError(
          `Configuration file not found: ${filePath}`,
          `Looked for config at: ${path.resolve(filePath)}`
        );
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);

      if (typeof config !== 'object' || config === null) {
        throw new ConfigurationError(
          'Configuration must be a JSON object',
          `Got: ${typeof config}`
        );
      }

      return config as Partial<Configuration>;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new ConfigurationError(
          `Invalid JSON in configuration file: ${filePath}`,
          (error as Error).message
        );
      }
      throw new ConfigurationError(
        `Failed to read configuration file: ${filePath}`,
        (error as Error).message
      );
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): Partial<Configuration> {
    const config: Partial<Configuration> = {};

    // Project name
    if (process.env.QUALITY_PROJECT_NAME) {
      config.projectName = process.env.QUALITY_PROJECT_NAME;
    }

    // Profile
    if (process.env.QUALITY_PROFILE) {
      config.profile = process.env.QUALITY_PROFILE;
    }

    // Format and output (would normally go to CLI options)
    // These are handled separately in CLI

    // Analysis toggles
    if (process.env.QUALITY_SKIP_COMPLEXITY === 'true') {
      config.codeQuality = { ...DEFAULT_CONFIG.codeQuality, enabled: false };
    }
    if (process.env.QUALITY_SKIP_COVERAGE === 'true') {
      config.testCoverage = { ...DEFAULT_CONFIG.testCoverage, enabled: false };
    }
    if (process.env.QUALITY_SKIP_ARCHITECTURE === 'true') {
      config.architecture = { ...DEFAULT_CONFIG.architecture, enabled: false };
    }
    if (process.env.QUALITY_SKIP_SECURITY === 'true') {
      config.security = { ...DEFAULT_CONFIG.security, enabled: false };
    }

    // Reporting toggles
    if (process.env.QUALITY_NO_COLOR === 'true') {
      config.reporting = { ...DEFAULT_CONFIG.reporting, colors: false };
    }
    if (process.env.QUALITY_VERBOSE === 'true') {
      config.reporting = { ...DEFAULT_CONFIG.reporting, verbose: true };
    }

    return config;
  }

  /**
   * Deep merge configurations
   */
  private deepMerge(base: any, ...sources: any[]): any {
    const result = { ...base };

    for (const source of sources) {
      if (!source) continue;

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const sourceValue = source[key];
          const baseValue = result[key];

          if (sourceValue === null || sourceValue === undefined) {
            continue;
          }

          if (
            typeof baseValue === 'object' &&
            !Array.isArray(baseValue) &&
            baseValue !== null &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue)
          ) {
            result[key] = this.deepMerge(baseValue, sourceValue);
          } else {
            result[key] = sourceValue;
          }
        }
      }
    }

    return result;
  }

  /**
   * Validate configuration schema and values
   */
  private validateConfiguration(config: Configuration): void {
    // Validate weights sum to 1.0
    const weights = config.scoring.weights;
    const sum = weights.codeQuality + weights.testCoverage + weights.architecture + weights.security;

    if (Math.abs(sum - 1.0) > 0.001) {
      throw new ConfigurationError(
        'Scoring weights must sum to 1.0',
        `Got: ${sum.toFixed(4)}. Weights: ${JSON.stringify(weights)}`
      );
    }

    // Validate percentage ranges
    if (config.testCoverage.minimumPercent < 0 || config.testCoverage.minimumPercent > 100) {
      throw new ConfigurationError(
        'testCoverage.minimumPercent must be between 0 and 100',
        `Got: ${config.testCoverage.minimumPercent}`
      );
    }

    // Validate thresholds
    if (config.codeQuality.complexity.warning > config.codeQuality.complexity.max) {
      throw new ConfigurationError(
        'Complexity warning threshold must be less than max threshold',
        `Warning: ${config.codeQuality.complexity.warning}, Max: ${config.codeQuality.complexity.max}`
      );
    }

    if (config.codeQuality.duplication.warningPercent > config.codeQuality.duplication.maxPercent) {
      throw new ConfigurationError(
        'Duplication warning threshold must be less than max threshold',
        `Warning: ${config.codeQuality.duplication.warningPercent}%, Max: ${config.codeQuality.duplication.maxPercent}%`
      );
    }

    // Validate passing grade
    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    if (!validGrades.includes(config.scoring.passingGrade)) {
      throw new ConfigurationError(
        'Invalid passing grade',
        `Got: ${config.scoring.passingGrade}. Must be one of: ${validGrades.join(', ')}`
      );
    }
  }

  /**
   * Apply CLI options to configuration
   */
  applyCliOptions(config: Configuration, options: CommandLineOptions): Configuration {
    const result = JSON.parse(JSON.stringify(config));

    // Apply profile if specified via CLI
    if (options.profile) {
      try {
        const profile = profileManager.getProfile(options.profile);
        result.scoring.weights = profile.weights;
        result.profile = options.profile;
      } catch (error) {
        throw new ConfigurationError(
          `Invalid profile: ${options.profile}`,
          `Available profiles: ${profileManager.getAllProfileNames().join(', ')}`
        );
      }
    }

    // Toggle analyses based on CLI options
    if (options.skipCoverage) {
      result.testCoverage.enabled = false;
    }
    if (options.skipSecurity) {
      result.security.enabled = false;
    }
    if (options.skipArchitecture) {
      result.architecture.enabled = false;
    }
    if (options.skipComplexity) {
      result.codeQuality.enabled = false;
    }

    // Apply reporting options
    if (options.noColor) {
      result.reporting.colors = false;
    }
    if (options.verbose) {
      result.reporting.verbose = true;
    }

    return result;
  }

  /**
   * Get default configuration
   */
  getDefaults(): Configuration {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  /**
   * Create a minimal configuration for testing
   */
  getMinimalConfig(): Configuration {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

export const configLoader = ConfigLoader.getInstance();
