/**
 * Coverage analysis helpers for CoverageAnalyzer
 */
import { pathExists, readJsonFile, normalizeFilePath, } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
function parseCoverageMetric(metric) {
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
    return { total, covered, percentage, status };
}
function parseCoverageSummary(data) {
    const total = data.total || {};
    return {
        lines: parseCoverageMetric(total.lines),
        branches: parseCoverageMetric(total.branches),
        functions: parseCoverageMetric(total.functions),
        statements: parseCoverageMetric(total.statements),
    };
}
const DEFAULT_METRIC = {
    total: 0,
    covered: 0,
    percentage: 0,
    status: 'poor',
};
export function getDefaultMetrics() {
    return {
        overall: {
            lines: DEFAULT_METRIC,
            branches: DEFAULT_METRIC,
            functions: DEFAULT_METRIC,
            statements: DEFAULT_METRIC,
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
export function getDefaultEffectiveness() {
    return {
        totalTests: 0,
        testsWithMeaningfulNames: 0,
        averageAssertionsPerTest: 0,
        testsWithoutAssertions: 0,
        excessivelyMockedTests: 0,
        effectivenessScore: 70,
        issues: [],
    };
}
export function analyzeCoverageData(coveragePath) {
    try {
        const data = readJsonFile(coveragePath);
        const overall = parseCoverageSummary(data);
        const byFile = {};
        for (const [filePath, fileCoverage] of Object.entries(data)) {
            if (filePath === 'total' || typeof fileCoverage !== 'object') {
                continue;
            }
            const fc = fileCoverage;
            const normalized = normalizeFilePath(filePath);
            byFile[normalized] = {
                path: normalized,
                lines: parseCoverageMetric(fc.lines),
                branches: parseCoverageMetric(fc.branches),
                functions: parseCoverageMetric(fc.functions),
                statements: parseCoverageMetric(fc.statements),
            };
        }
        return {
            overall,
            byFile,
            effectiveness: getDefaultEffectiveness(),
            gaps: [],
        };
    }
    catch (error) {
        logger.debug(`Failed to analyze coverage data: ${error.message}`);
        return getDefaultMetrics();
    }
}
function suggestTests(filePath) {
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
export function identifyCoverageGaps(metrics) {
    const gaps = [];
    for (const [, fileCoverage] of Object.entries(metrics.byFile)) {
        const coverage = fileCoverage.lines.percentage;
        if (coverage >= 80)
            continue;
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
            suggestedTests: suggestTests(fileCoverage.path),
            estimatedEffort: uncoveredLines > 100 ? 'high' : uncoveredLines > 50 ? 'medium' : 'low',
        });
    }
    return gaps.sort((a, b) => a.coverage - b.coverage).slice(0, 10);
}
export function findCoveragePath() {
    const paths = [
        'coverage/coverage-final.json',
        'coverage-final.json',
        '.nyc_output/coverage-final.json',
        './coverage/coverage-final.json',
    ];
    for (const p of paths) {
        if (pathExists(p))
            return p;
    }
    return null;
}
