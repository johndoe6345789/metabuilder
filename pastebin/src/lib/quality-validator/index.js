/**
 * Quality Validation CLI Tool
 * Main entry point and command orchestration
 */
import { ExitCode } from './types/index.js';
import { configLoader } from './config/ConfigLoader.js';
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
    constructor() {
        this.config = null;
    }
    /**
     * Run quality validation analysis
     */
    async validate(options = {}) {
        try {
            // Configure logger
            logger.configure({
                verbose: options.verbose || false,
                useColors: !options.noColor,
            });
            logger.info('Quality Validation starting...');
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
            const codeQualityMetrics = codeQualityResult?.metrics;
            const testCoverageMetrics = testCoverageResult?.metrics;
            const architectureMetrics = architectureResult?.metrics;
            const securityMetrics = securityResult?.metrics;
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
            const scoringResult = scoringEngine.calculateScore(codeQualityMetrics, testCoverageMetrics, architectureMetrics, securityMetrics, this.config.scoring.weights, findings, metadata);
            // Generate reports
            await this.generateReports(scoringResult, options);
            // Determine exit code
            const exitCode = scoringResult.overall.status === 'pass'
                ? ExitCode.SUCCESS
                : ExitCode.QUALITY_FAILURE;
            logger.info(`Quality validation ${scoringResult.overall.status}: ${scoringResult.overall.grade} (${scoringResult.overall.score.toFixed(1)}%)`);
            return exitCode;
        }
        catch (error) {
            logger.error('Quality validation failed', {
                error: error.message,
            });
            if (error instanceof SyntaxError) {
                return ExitCode.CONFIGURATION_ERROR;
            }
            return ExitCode.EXECUTION_ERROR;
        }
    }
    /**
     * Generate reports in requested formats
     */
    async generateReports(scoringResult, options) {
        const format = options.format || this.config?.reporting.defaultFormat || 'console';
        const outputPath = options.output;
        // Generate console report by default
        if (!options.output || format === 'console') {
            const report = consoleReporter.generate(scoringResult, !options.noColor);
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
                    }
                    else {
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
export async function runQualityCheck(args) {
    try {
        const validator = new QualityValidator();
        // Parse command line options (simplified)
        const options = parseCliArgs(args || process.argv.slice(2));
        const exitCode = await validator.validate(options);
        process.exit(exitCode);
    }
    catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(ExitCode.EXECUTION_ERROR);
    }
}
/**
 * Simple CLI argument parser
 */
function parseCliArgs(args) {
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--format' && i + 1 < args.length) {
            options.format = args[++i];
        }
        else if (arg === '--output' && i + 1 < args.length) {
            options.output = args[++i];
        }
        else if (arg === '--config' && i + 1 < args.length) {
            options.config = args[++i];
        }
        else if (arg === '--verbose') {
            options.verbose = true;
        }
        else if (arg === '--no-color') {
            options.noColor = true;
        }
        else if (arg === '--skip-coverage') {
            options.skipCoverage = true;
        }
        else if (arg === '--skip-security') {
            options.skipSecurity = true;
        }
        else if (arg === '--skip-architecture') {
            options.skipArchitecture = true;
        }
        else if (arg === '--skip-complexity') {
            options.skipComplexity = true;
        }
        else if (arg === '--help') {
            options.help = true;
        }
        else if (arg === '--version') {
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
function printHelp() {
    console.log(`
Quality Validation CLI Tool v1.0.0

Usage: quality-validator [options]

Options:
  --format <format>        Output format: console, json, html, csv (default: console)
  --output <file>          Output file path
  --config <file>          Configuration file path (.qualityrc.json)
  --verbose                Enable verbose logging
  --no-color              Disable colored output
  --skip-coverage         Skip test coverage analysis
  --skip-security         Skip security analysis
  --skip-architecture     Skip architecture analysis
  --skip-complexity       Skip complexity analysis
  --help                  Display this help message
  --version               Display version number

Examples:
  quality-validator
  quality-validator --format json --output report.json
  quality-validator --format html --output coverage/report.html
  quality-validator --config .qualityrc.json --verbose

Configuration:
  Create a .qualityrc.json file in your project root to customize quality checks.
  See documentation for detailed configuration options.
  `);
}
// Export types and utilities
export * from './types/index.js';
export { configLoader } from './config/ConfigLoader.js';
export { logger } from './utils/logger.js';
export { codeQualityAnalyzer } from './analyzers/codeQualityAnalyzer.js';
export { coverageAnalyzer } from './analyzers/coverageAnalyzer.js';
export { architectureChecker } from './analyzers/architectureChecker.js';
export { securityScanner } from './analyzers/securityScanner.js';
export { scoringEngine } from './scoring/scoringEngine.js';
export { consoleReporter } from './reporters/ConsoleReporter.js';
export { jsonReporter } from './reporters/JsonReporter.js';
export { htmlReporter } from './reporters/HtmlReporter.js';
export { csvReporter } from './reporters/CsvReporter.js';
