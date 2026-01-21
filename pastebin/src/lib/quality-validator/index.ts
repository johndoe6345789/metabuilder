/**
 * Quality Validation CLI Tool
 * Main entry point and command orchestration
 */

import { CommandLineOptions, Configuration, ExitCode } from './types/index.js';
import { configLoader } from './config/ConfigLoader.js';
import { profileManager } from './config/ProfileManager.js';
import { logger } from './utils/logger.js';
import { getSourceFiles, writeFile, ensureDirectory } from './utils/fileSystem.js';
import { codeQualityAnalyzer } from './analyzers/codeQualityAnalyzer.js';
import { coverageAnalyzer } from './analyzers/coverageAnalyzer.js';
import { architectureChecker } from './analyzers/architectureChecker.js';
import { securityScanner } from './analyzers/securityScanner.js';
import { scoringEngine } from './scoring/scoringEngine.js';
import { consoleReporter } from './reporters/ConsoleReporter.js';
import { jsonReporter } from './reporters/JsonReporter.js';
import { htmlReporter } from './reporters/HtmlReporter.js';
import { csvReporter } from './reporters/CsvReporter.js';

/**
 * Main Quality Validation orchestrator
 */
export class QualityValidator {
  private config: Configuration | null = null;

  /**
   * Run quality validation analysis
   */
  async validate(options: CommandLineOptions = {}): Promise<number> {
    try {
      // Configure logger
      logger.configure({
        verbose: options.verbose || false,
        useColors: !options.noColor,
      });

      logger.info('Quality Validation starting...');

      // Initialize profile manager first
      await profileManager.initialize();

      // Handle profile management commands
      if (options.listProfiles) {
        return this.handleListProfiles();
      }

      if (options.showProfile) {
        return this.handleShowProfile(options.showProfile);
      }

      if (options.createProfile) {
        return this.handleCreateProfile(options.createProfile);
      }

      // Load configuration
      this.config = await configLoader.loadConfiguration(options.config);
      this.config = configLoader.applyCliOptions(this.config, options);

      // Get source files
      const sourceFiles = getSourceFiles(this.config.excludePaths);
      logger.info(`Found ${sourceFiles.length} source files to analyze`);

      if (sourceFiles.length === 0) {
        logger.warn('No source files found to analyze');
        return ExitCode.SUCCESS;
      }

      // Run analyses in parallel
      const startTime = performance.now();

      const analyses = await Promise.all([
        this.config.codeQuality.enabled ? codeQualityAnalyzer.analyze(sourceFiles) : Promise.resolve(null),
        this.config.testCoverage.enabled ? coverageAnalyzer.analyze() : Promise.resolve(null),
        this.config.architecture.enabled ? architectureChecker.analyze(sourceFiles) : Promise.resolve(null),
        this.config.security.enabled ? securityScanner.analyze(sourceFiles) : Promise.resolve(null),
      ]);

      const [codeQualityResult, testCoverageResult, architectureResult, securityResult] = analyses;

      // Collect findings
      const findings = [
        ...(codeQualityResult?.findings || []),
        ...(testCoverageResult?.findings || []),
        ...(architectureResult?.findings || []),
        ...(securityResult?.findings || []),
      ];

      logger.info(`Analysis complete: ${findings.length} findings`);

      // Extract metrics for scoring
      const codeQualityMetrics = codeQualityResult?.metrics as any;
      const testCoverageMetrics = testCoverageResult?.metrics as any;
      const architectureMetrics = architectureResult?.metrics as any;
      const securityMetrics = securityResult?.metrics as any;

      // Calculate score
      const analysisTime = performance.now() - startTime;
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: this.config,
      };

      const scoringResult = scoringEngine.calculateScore(
        codeQualityMetrics,
        testCoverageMetrics,
        architectureMetrics,
        securityMetrics,
        this.config.scoring.weights,
        findings,
        metadata
      );

      // Generate reports
      await this.generateReports(scoringResult, options);

      // Determine exit code
      const exitCode =
        scoringResult.overall.status === 'pass'
          ? ExitCode.SUCCESS
          : ExitCode.QUALITY_FAILURE;

      logger.info(
        `Quality validation ${scoringResult.overall.status}: ${scoringResult.overall.grade} (${scoringResult.overall.score.toFixed(1)}%)`
      );

      return exitCode;
    } catch (error) {
      logger.error('Quality validation failed', {
        error: (error as Error).message,
      });

      if (error instanceof SyntaxError) {
        return ExitCode.CONFIGURATION_ERROR;
      }

      return ExitCode.EXECUTION_ERROR;
    }
  }

  /**
   * Handle --list-profiles command
   */
  private handleListProfiles(): number {
    const profiles = profileManager.getAllProfiles();
    const currentProfile = profileManager.getCurrentProfileName();

    console.log('\n' + '='.repeat(70));
    console.log('Available Quality Profiles');
    console.log('='.repeat(70) + '\n');

    for (const profile of profiles) {
      const isCurrent = profile.name === currentProfile ? ' (CURRENT)' : '';
      console.log(`${profile.name.toUpperCase()}${isCurrent}`);
      console.log(`  Description: ${profile.description}`);
      console.log(`  Weights: Code Quality: ${profile.weights.codeQuality}, Test Coverage: ${profile.weights.testCoverage}, Architecture: ${profile.weights.architecture}, Security: ${profile.weights.security}`);
      console.log(`  Minimum Scores: Code Quality: ${profile.minimumScores.codeQuality}, Test Coverage: ${profile.minimumScores.testCoverage}, Architecture: ${profile.minimumScores.architecture}, Security: ${profile.minimumScores.security}`);
      console.log();
    }

    console.log('='.repeat(70));
    console.log('Usage: quality-validator --profile <name>\n');

    return ExitCode.SUCCESS;
  }

  /**
   * Handle --show-profile command
   */
  private handleShowProfile(profileName: string): number {
    try {
      const profile = profileManager.getProfile(profileName);
      console.log('\n' + '='.repeat(70));
      console.log(`Profile: ${profile.name}`);
      console.log('='.repeat(70) + '\n');
      console.log(JSON.stringify(profile, null, 2));
      console.log('\n' + '='.repeat(70) + '\n');
      return ExitCode.SUCCESS;
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      return ExitCode.CONFIGURATION_ERROR;
    }
  }

  /**
   * Handle --create-profile command
   */
  private handleCreateProfile(profileName: string): number {
    console.log(`\nCreating custom profile: ${profileName}`);
    console.log('This feature requires interactive input. Please use the API directly.');
    console.log('Example:');
    console.log(`
  const { profileManager } = require('./quality-validator');
  const newProfile = {
    name: '${profileName}',
    description: 'Your custom profile description',
    weights: {
      codeQuality: 0.3,
      testCoverage: 0.35,
      architecture: 0.2,
      security: 0.15
    },
    minimumScores: {
      codeQuality: 80,
      testCoverage: 70,
      architecture: 80,
      security: 85
    }
  };
  profileManager.createProfile('${profileName}', newProfile);
    `);
    return ExitCode.SUCCESS;
  }

  /**
   * Generate reports in requested formats
   */
  private async generateReports(scoringResult: any, options: CommandLineOptions): Promise<void> {
    const format = options.format || this.config?.reporting.defaultFormat || 'console';
    const outputPath = options.output;

    // Generate console report by default
    if (!options.output || format === 'console') {
      const report = consoleReporter.generate(
        scoringResult,
        !options.noColor
      );
      console.log(report);
    }

    // Generate other formats if requested
    switch (format) {
      case 'json':
        {
          const report = jsonReporter.generate(scoringResult);
          if (outputPath) {
            writeFile(outputPath, report);
            logger.info(`JSON report written to: ${outputPath}`);
          } else {
            console.log(report);
          }
        }
        break;

      case 'html':
        {
          const report = htmlReporter.generate(scoringResult);
          const path = outputPath || '.quality/report.html';
          ensureDirectory('.quality');
          writeFile(path, report);
          logger.info(`HTML report written to: ${path}`);
        }
        break;

      case 'csv':
        {
          const report = csvReporter.generate(scoringResult);
          const path = outputPath || '.quality/report.csv';
          ensureDirectory('.quality');
          writeFile(path, report);
          logger.info(`CSV report written to: ${path}`);
        }
        break;
    }
  }
}

/**
 * Run quality validation from command line
 */
export async function runQualityCheck(args?: string[]): Promise<void> {
  try {
    const validator = new QualityValidator();

    // Parse command line options (simplified)
    const options = parseCliArgs(args || process.argv.slice(2));

    const exitCode = await validator.validate(options);
    process.exit(exitCode);
  } catch (error) {
    console.error('Fatal error:', (error as Error).message);
    process.exit(ExitCode.EXECUTION_ERROR);
  }
}

/**
 * Simple CLI argument parser
 */
function parseCliArgs(args: string[]): CommandLineOptions {
  const options: CommandLineOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' && i + 1 < args.length) {
      options.format = args[++i] as any;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === '--config' && i + 1 < args.length) {
      options.config = args[++i];
    } else if (arg === '--profile' && i + 1 < args.length) {
      options.profile = args[++i];
    } else if (arg === '--list-profiles') {
      options.listProfiles = true;
    } else if (arg === '--show-profile' && i + 1 < args.length) {
      options.showProfile = args[++i];
    } else if (arg === '--create-profile' && i + 1 < args.length) {
      options.createProfile = args[++i];
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--no-color') {
      options.noColor = true;
    } else if (arg === '--skip-coverage') {
      options.skipCoverage = true;
    } else if (arg === '--skip-security') {
      options.skipSecurity = true;
    } else if (arg === '--skip-architecture') {
      options.skipArchitecture = true;
    } else if (arg === '--skip-complexity') {
      options.skipComplexity = true;
    } else if (arg === '--help') {
      options.help = true;
    } else if (arg === '--version') {
      options.version = true;
    }
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    console.log('Quality Validator v1.0.0');
    process.exit(0);
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Quality Validation CLI Tool v1.0.0

Usage: quality-validator [options]

Options:
  --format <format>        Output format: console, json, html, csv (default: console)
  --output <file>          Output file path
  --config <file>          Configuration file path (.qualityrc.json)
  --profile <name>         Quality profile: strict, moderate, lenient, or custom (default: moderate)
  --verbose                Enable verbose logging
  --no-color              Disable colored output
  --skip-coverage         Skip test coverage analysis
  --skip-security         Skip security analysis
  --skip-architecture     Skip architecture analysis
  --skip-complexity       Skip complexity analysis

Profile Management:
  --list-profiles         List all available profiles
  --show-profile <name>   Show details of a specific profile
  --create-profile <name> Create a new custom profile

General:
  --help                  Display this help message
  --version               Display version number

Examples:
  quality-validator
  quality-validator --profile strict
  quality-validator --profile lenient --format json --output report.json
  quality-validator --list-profiles
  quality-validator --show-profile moderate
  quality-validator --format html --output coverage/report.html
  quality-validator --config .qualityrc.json --verbose

Environment Variables:
  QUALITY_PROFILE=moderate     Set default profile
  NODE_ENV=production          Automatically selects environment-specific profiles

Configuration:
  Create a .qualityrc.json file in your project root to customize quality checks.
  See documentation for detailed configuration options.
  `);
}

// Export types and utilities
export * from './types/index.js';
export { configLoader } from './config/ConfigLoader.js';
export { profileManager, ProfileManager } from './config/ProfileManager.js';
export type { ProfileDefinition, ProfileName, EnvironmentType } from './config/ProfileManager.js';
export { logger } from './utils/logger.js';

// Export SOLID design pattern implementations
export { BaseAnalyzer, type AnalyzerConfig } from './analyzers/BaseAnalyzer.js';
export { AnalyzerFactory, type AnalyzerType } from './analyzers/AnalyzerFactory.js';
export { DependencyContainer, getGlobalContainer, resetGlobalContainer } from './utils/DependencyContainer.js';
export { AnalysisRegistry, getGlobalRegistry, resetGlobalRegistry } from './core/AnalysisRegistry.js';

// Export analyzers
export { CodeQualityAnalyzer, codeQualityAnalyzer } from './analyzers/codeQualityAnalyzer.js';
export { CoverageAnalyzer, coverageAnalyzer } from './analyzers/coverageAnalyzer.js';
export { ArchitectureChecker, architectureChecker } from './analyzers/architectureChecker.js';
export { SecurityScanner, securityScanner } from './analyzers/securityScanner.js';

// Export scoring engine
export { scoringEngine } from './scoring/scoringEngine.js';

// Export reporters
export { ReporterBase } from './reporters/ReporterBase.js';
export { consoleReporter } from './reporters/ConsoleReporter.js';
export { jsonReporter } from './reporters/JsonReporter.js';
export { htmlReporter } from './reporters/HtmlReporter.js';
export { csvReporter } from './reporters/CsvReporter.js';

// Export utility validators
export * from './utils/validators.js';

// Export utility formatters
export * from './utils/formatters.js';

// Export result processor utilities
export * from './utils/resultProcessor.js';
