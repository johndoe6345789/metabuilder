/**
 * Test Coverage Analyzer
 * Analyzes test coverage metrics and effectiveness
 */
import { logger } from '../utils/logger.js';
import { BaseAnalyzer } from './BaseAnalyzer.js';
import { findCoveragePath, analyzeCoverageData, getDefaultMetrics, getDefaultEffectiveness, identifyCoverageGaps, } from './coverage-analysis.js';
export class CoverageAnalyzer extends BaseAnalyzer {
    constructor(config) {
        super(config || {
            name: 'CoverageAnalyzer',
            enabled: true,
            timeout: 30000,
            retryAttempts: 1,
        });
    }
    async analyze() {
        return this.executeWithTiming(async () => {
            if (!this.validate()) {
                throw new Error('CoverageAnalyzer validation failed');
            }
            this.startTiming();
            const coveragePath = findCoveragePath();
            let metrics;
            if (coveragePath) {
                metrics = analyzeCoverageData(coveragePath);
            }
            else {
                this.logProgress('No coverage data found, using defaults');
                metrics = getDefaultMetrics();
            }
            metrics.effectiveness = getDefaultEffectiveness();
            metrics.gaps = identifyCoverageGaps(metrics);
            this.generateFindings(metrics);
            const score = this.calculateScore(metrics);
            const executionTime = this.getExecutionTime();
            this.logProgress('Coverage analysis complete', {
                score: score.toFixed(2),
                findingsCount: this.findings.length,
            });
            return {
                category: 'testCoverage',
                score,
                status: this.getStatus(score),
                findings: this.getFindings(),
                metrics: metrics,
                executionTime,
            };
        }, 'test coverage analysis');
    }
    validate() {
        if (!this.validateConfig())
            return false;
        if (!this.config.enabled) {
            logger.debug(`${this.config.name} is disabled`);
            return false;
        }
        return true;
    }
    generateFindings(metrics) {
        if (metrics.overall.lines.percentage < 80) {
            this.addFinding({
                id: 'coverage-low',
                severity: 'high',
                category: 'testCoverage',
                title: 'Low test coverage',
                description: `Overall line coverage is ` +
                    `${metrics.overall.lines.percentage.toFixed(1)}%, target is 80%`,
                remediation: 'Add tests for uncovered code paths to increase coverage',
                evidence: `Lines: ${metrics.overall.lines.percentage.toFixed(1)}%, ` +
                    `Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
            });
        }
        if (metrics.overall.branches.percentage < 75) {
            this.addFinding({
                id: 'coverage-branch-low',
                severity: 'medium',
                category: 'testCoverage',
                title: 'Low branch coverage',
                description: `Branch coverage is ` +
                    `${metrics.overall.branches.percentage.toFixed(1)}%, target is 75%`,
                remediation: 'Add tests for conditional branches and edge cases',
                // eslint-disable-next-line max-len
                evidence: `Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
            });
        }
        for (const gap of metrics.gaps.slice(0, 3)) {
            this.addFinding({
                id: `gap-${gap.file}`,
                severity: gap.criticality === 'critical' ? 'high' : 'medium',
                category: 'testCoverage',
                title: `Low coverage in ${gap.file}`,
                description: `File has only ${gap.coverage.toFixed(1)}% coverage ` +
                    `with ${gap.uncoveredLines} uncovered lines`,
                location: { file: gap.file },
                remediation: gap.suggestedTests.join('; '),
                evidence: `Coverage: ${gap.coverage.toFixed(1)}%, ` +
                    `Uncovered: ${gap.uncoveredLines}`,
            });
        }
    }
    calculateScore(metrics) {
        const { overall, effectiveness } = metrics;
        const avgCoverage = (overall.lines.percentage +
            overall.branches.percentage +
            overall.functions.percentage +
            overall.statements.percentage) /
            4;
        return avgCoverage * 0.6 + effectiveness.effectivenessScore * 0.4;
    }
}
export const coverageAnalyzer = new CoverageAnalyzer();
