/**
 * Quality Validation CLI Tool
 * Main entry point and command orchestration
 */
import { ExitCode } from './types/index.js';
import { configLoader } from './config/ConfigLoader.js';
import { profileManager } from './config/ProfileManager.js';
import { logger } from './utils/logger.js';
import { getSourceFiles } from './utils/fileSystem.js';
import { codeQualityAnalyzer } from './analyzers/codeQualityAnalyzer.js';
import { coverageAnalyzer } from './analyzers/coverageAnalyzer.js';
import { architectureChecker } from './analyzers/architectureChecker.js';
import { securityScanner } from './analyzers/securityScanner.js';
import { scoringEngine } from './scoring/scoringEngine.js';
import { parseCliArgs } from './cli-parser.js';
import { generateReports } from './validator-reports.js';
import { handleListProfiles, handleShowProfile, handleCreateProfile, } from './validator-profiles.js';
export class QualityValidator {
    constructor() {
        this.config = null;
    }
    async validate(options = {}) {
        try {
            logger.configure({
                verbose: options.verbose || false,
                useColors: !options.noColor,
            });
            logger.info('Quality Validation starting...');
            await profileManager.initialize();
            if (options.listProfiles)
                return handleListProfiles();
            if (options.showProfile) {
                return handleShowProfile(options.showProfile);
            }
            if (options.createProfile) {
                return handleCreateProfile(options.createProfile);
            }
            this.config = await configLoader.loadConfiguration(options.config);
            this.config = configLoader.applyCliOptions(this.config, options);
            const sourceFiles = getSourceFiles(this.config.excludePaths);
            logger.info(`Found ${sourceFiles.length} source files`);
            if (sourceFiles.length === 0) {
                logger.warn('No source files found to analyze');
                return ExitCode.SUCCESS;
            }
            const startTime = performance.now();
            const analyses = await Promise.all([
                this.config.codeQuality.enabled
                    ? codeQualityAnalyzer.analyze(sourceFiles)
                    : Promise.resolve(null),
                this.config.testCoverage.enabled
                    ? coverageAnalyzer.analyze()
                    : Promise.resolve(null),
                this.config.architecture.enabled
                    ? architectureChecker.analyze(sourceFiles)
                    : Promise.resolve(null),
                this.config.security.enabled
                    ? securityScanner.analyze(sourceFiles)
                    : Promise.resolve(null),
            ]);
            const [cqResult, tcResult, archResult, secResult] = analyses;
            const findings = [
                ...(cqResult?.findings || []),
                ...(tcResult?.findings || []),
                ...(archResult?.findings || []),
                ...(secResult?.findings || []),
            ];
            logger.info(`Analysis complete: ${findings.length} findings`);
            const analysisTime = performance.now() - startTime;
            const metadata = {
                timestamp: new Date().toISOString(),
                toolVersion: '1.0.0',
                analysisTime,
                projectPath: process.cwd(),
                nodeVersion: process.version,
                configUsed: this.config,
            };
            const scoringResult = scoringEngine.calculateScore(cqResult?.metrics, tcResult?.metrics, archResult?.metrics, secResult?.metrics, this.config.scoring.weights, findings, metadata);
            await generateReports(scoringResult, options, this.config);
            const exitCode = scoringResult.overall.status === 'pass'
                ? ExitCode.SUCCESS
                : ExitCode.QUALITY_FAILURE;
            logger.info(`Quality validation ${scoringResult.overall.status}: ` +
                `${scoringResult.overall.grade} ` +
                `(${scoringResult.overall.score.toFixed(1)}%)`);
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
}
export async function runQualityCheck(args) {
    try {
        const validator = new QualityValidator();
        const options = parseCliArgs(args || process.argv.slice(2));
        const exitCode = await validator.validate(options);
        process.exit(exitCode);
    }
    catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(ExitCode.EXECUTION_ERROR);
    }
}
export * from './validator-exports.js';
