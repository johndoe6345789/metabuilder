/**
 * Test Coverage Analyzer
 * Analyzes test coverage metrics and effectiveness
 */
import { pathExists, readJsonFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
/**
 * Test Coverage Analyzer
 */
export class CoverageAnalyzer {
    /**
     * Analyze test coverage
     */
    async analyze() {
        const startTime = performance.now();
        try {
            logger.debug('Starting test coverage analysis...');
            // Try to find coverage data
            const coveragePath = this.findCoveragePath();
            let metrics;
            if (coveragePath) {
                metrics = this.analyzeCoverageData(coveragePath);
            }
            else {
                logger.warn('No coverage data found, using defaults');
                metrics = this.getDefaultMetrics();
            }
            // Analyze effectiveness
            metrics.effectiveness = this.analyzeEffectiveness();
            // Identify coverage gaps
            metrics.gaps = this.identifyCoverageGaps(metrics);
            // Generate findings
            const findings = this.generateFindings(metrics);
            // Calculate score
            const score = this.calculateScore(metrics);
            const executionTime = performance.now() - startTime;
            logger.debug(`Coverage analysis complete (${executionTime.toFixed(2)}ms)`, {
                score,
                findings: findings.length,
            });
            return {
                category: 'testCoverage',
                score,
                status: (score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'),
                findings,
                metrics: metrics,
                executionTime,
            };
        }
        catch (error) {
            logger.error('Coverage analysis failed', { error: error.message });
            throw error;
        }
    }
    /**
     * Find coverage data path
     */
    findCoveragePath() {
        const possiblePaths = [
            'coverage/coverage-final.json',
            'coverage-final.json',
            '.nyc_output/coverage-final.json',
            './coverage/coverage-final.json',
        ];
        for (const path of possiblePaths) {
            if (pathExists(path)) {
                return path;
            }
        }
        return null;
    }
    /**
     * Analyze coverage data from JSON file
     */
    analyzeCoverageData(coveragePath) {
        try {
            const data = readJsonFile(coveragePath);
            // Parse coverage summary
            const summary = this.parseCoverageSummary(data);
            // Parse file-level coverage
            const byFile = {};
            for (const [filePath, fileCoverage] of Object.entries(data)) {
                if (filePath === 'total' || typeof fileCoverage !== 'object')
                    continue;
                const fc = fileCoverage;
                byFile[normalizeFilePath(filePath)] = {
                    path: normalizeFilePath(filePath),
                    lines: this.parseCoverageMetric(fc.lines),
                    branches: this.parseCoverageMetric(fc.branches),
                    functions: this.parseCoverageMetric(fc.functions),
                    statements: this.parseCoverageMetric(fc.statements),
                };
            }
            return {
                overall: summary,
                byFile,
                effectiveness: this.analyzeEffectiveness(),
                gaps: [],
            };
        }
        catch (error) {
            logger.debug(`Failed to analyze coverage data: ${error.message}`);
            return this.getDefaultMetrics();
        }
    }
    /**
     * Parse coverage summary from data
     */
    parseCoverageSummary(data) {
        const total = data.total || {};
        return {
            lines: this.parseCoverageMetric(total.lines),
            branches: this.parseCoverageMetric(total.branches),
            functions: this.parseCoverageMetric(total.functions),
            statements: this.parseCoverageMetric(total.statements),
        };
    }
    /**
     * Parse individual coverage metric
     */
    parseCoverageMetric(metric) {
        const total = metric?.total || 0;
        const covered = metric?.covered || 0;
        const percentage = total > 0 ? (covered / total) * 100 : 100;
        let status;
        if (percentage >= 80)
            status = 'excellent';
        else if (percentage >= 60)
            status = 'acceptable';
        else
            status = 'poor';
        return {
            total,
            covered,
            percentage,
            status,
        };
    }
    /**
     * Get default metrics when no coverage data
     */
    getDefaultMetrics() {
        const defaultMetric = {
            total: 0,
            covered: 0,
            percentage: 0,
            status: 'poor',
        };
        return {
            overall: {
                lines: defaultMetric,
                branches: defaultMetric,
                functions: defaultMetric,
                statements: defaultMetric,
            },
            byFile: {},
            effectiveness: {
                totalTests: 0,
                testsWithMeaningfulNames: 0,
                averageAssertionsPerTest: 0,
                testsWithoutAssertions: 0,
                excessivelyMockedTests: 0,
                effectivenessScore: 0,
                issues: [],
            },
            gaps: [],
        };
    }
    /**
     * Analyze test effectiveness
     */
    analyzeEffectiveness() {
        // Simplified analysis - would require test file parsing
        const issues = [];
        return {
            totalTests: 0,
            testsWithMeaningfulNames: 0,
            averageAssertionsPerTest: 0,
            testsWithoutAssertions: 0,
            excessivelyMockedTests: 0,
            effectivenessScore: 70,
            issues,
        };
    }
    /**
     * Identify coverage gaps
     */
    identifyCoverageGaps(metrics) {
        const gaps = [];
        // Find files with low coverage
        for (const [, fileCoverage] of Object.entries(metrics.byFile)) {
            const coverage = fileCoverage.lines.percentage;
            if (coverage < 80) {
                const uncoveredLines = fileCoverage.lines.total - fileCoverage.lines.covered;
                let criticality;
                if (coverage < 50)
                    criticality = 'critical';
                else if (coverage < 65)
                    criticality = 'high';
                else if (coverage < 80)
                    criticality = 'medium';
                else
                    criticality = 'low';
                gaps.push({
                    file: fileCoverage.path,
                    coverage,
                    uncoveredLines,
                    criticality,
                    suggestedTests: this.suggestTests(fileCoverage.path),
                    estimatedEffort: uncoveredLines > 100 ? 'high' : uncoveredLines > 50 ? 'medium' : 'low',
                });
            }
        }
        return gaps.sort((a, b) => a.coverage - b.coverage).slice(0, 10);
    }
    /**
     * Suggest tests for a file
     */
    suggestTests(filePath) {
        // Simple suggestions based on file content
        const suggestions = [];
        if (filePath.includes('utils')) {
            suggestions.push('Test utility functions with various inputs');
        }
        if (filePath.includes('components')) {
            suggestions.push('Test component rendering');
            suggestions.push('Test component props');
            suggestions.push('Test component event handlers');
        }
        if (filePath.includes('hooks')) {
            suggestions.push('Test hook initialization');
            suggestions.push('Test hook state changes');
        }
        if (filePath.includes('store') || filePath.includes('redux')) {
            suggestions.push('Test reducer logic');
            suggestions.push('Test selector functions');
            suggestions.push('Test action creators');
        }
        return suggestions;
    }
    /**
     * Generate findings from metrics
     */
    generateFindings(metrics) {
        const findings = [];
        // Overall coverage findings
        if (metrics.overall.lines.percentage < 80) {
            findings.push({
                id: 'coverage-low',
                severity: 'high',
                category: 'testCoverage',
                title: 'Low test coverage',
                description: `Overall line coverage is ${metrics.overall.lines.percentage.toFixed(1)}%, target is 80%`,
                remediation: 'Add tests for uncovered code paths to increase coverage',
                evidence: `Lines: ${metrics.overall.lines.percentage.toFixed(1)}%, Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
            });
        }
        if (metrics.overall.branches.percentage < 75) {
            findings.push({
                id: 'coverage-branch-low',
                severity: 'medium',
                category: 'testCoverage',
                title: 'Low branch coverage',
                description: `Branch coverage is ${metrics.overall.branches.percentage.toFixed(1)}%, target is 75%`,
                remediation: 'Add tests for conditional branches and edge cases',
                evidence: `Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
            });
        }
        // Coverage gaps findings
        for (const gap of metrics.gaps.slice(0, 3)) {
            findings.push({
                id: `gap-${gap.file}`,
                severity: gap.criticality === 'critical' ? 'high' : 'medium',
                category: 'testCoverage',
                title: `Low coverage in ${gap.file}`,
                description: `File has only ${gap.coverage.toFixed(1)}% coverage with ${gap.uncoveredLines} uncovered lines`,
                location: {
                    file: gap.file,
                },
                remediation: gap.suggestedTests.join('; '),
                evidence: `Coverage: ${gap.coverage.toFixed(1)}%, Uncovered: ${gap.uncoveredLines}`,
            });
        }
        return findings;
    }
    /**
     * Calculate overall coverage score
     */
    calculateScore(metrics) {
        const { overall, effectiveness } = metrics;
        // Average coverage across all types
        const avgCoverage = (overall.lines.percentage +
            overall.branches.percentage +
            overall.functions.percentage +
            overall.statements.percentage) /
            4;
        // Score is 60% coverage + 40% effectiveness
        return avgCoverage * 0.6 + effectiveness.effectivenessScore * 0.4;
    }
}
export const coverageAnalyzer = new CoverageAnalyzer();
