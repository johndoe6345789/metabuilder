/**
 * Scoring Engine for Quality Validator
 * Calculates weighted scores, assigns grades, generates recommendations
 */
import { trendAnalyzer } from './trendAnalyzer';
import { saveTrendHistory, createHistoricalRecord } from '../utils/trendStorage';
import { calcCodeQualityScore, calcTestCoverageScore, calcArchitectureScore, calcSecurityScore, } from './category-scorers.js';
import { generateRecommendations } from './recommendation-generator.js';
export class ScoringEngine {
    calculateScore(codeQuality, testCoverage, architecture, security, weights, findings, metadata) {
        const cqScore = calcCodeQualityScore(codeQuality);
        const tcScore = calcTestCoverageScore(testCoverage);
        const archScore = calcArchitectureScore(architecture);
        const secScore = calcSecurityScore(security);
        const componentScores = this.buildComponentScores(cqScore, tcScore, archScore, secScore, weights);
        const overallScore = componentScores.codeQuality.weightedScore +
            componentScores.testCoverage.weightedScore +
            componentScores.architecture.weightedScore +
            componentScores.security.weightedScore;
        const grade = this.assignGrade(overallScore);
        const status = overallScore >= 80 ? 'pass' : 'fail';
        const recommendations = generateRecommendations(codeQuality, testCoverage, architecture, security, findings);
        const trend = trendAnalyzer.analyzeTrend(overallScore, componentScores);
        const historicalRecord = createHistoricalRecord(overallScore, grade, componentScores);
        saveTrendHistory(historicalRecord);
        return {
            overall: {
                score: overallScore,
                grade,
                status,
                summary: this.generateSummary(grade, overallScore),
                passesThresholds: status === 'pass',
            },
            componentScores,
            findings,
            recommendations,
            trend,
            metadata,
        };
    }
    buildComponentScores(cq, tc, arch, sec, weights) {
        return {
            codeQuality: {
                score: cq,
                weight: weights.codeQuality,
                weightedScore: cq * weights.codeQuality,
            },
            testCoverage: {
                score: tc,
                weight: weights.testCoverage,
                weightedScore: tc * weights.testCoverage,
            },
            architecture: {
                score: arch,
                weight: weights.architecture,
                weightedScore: arch * weights.architecture,
            },
            security: {
                score: sec,
                weight: weights.security,
                weightedScore: sec * weights.security,
            },
        };
    }
    assignGrade(score) {
        if (score >= 90)
            return 'A';
        if (score >= 80)
            return 'B';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        return 'F';
    }
    generateSummary(grade, score) {
        const descriptions = {
            A: 'Excellent code quality - exceeds expectations',
            B: 'Good code quality - meets expectations',
            C: 'Acceptable code quality - areas for improvement',
            D: 'Poor code quality - significant issues',
            F: 'Failing code quality - critical issues',
        };
        return `${descriptions[grade] ?? 'Unknown'} (${score.toFixed(1)}%)`;
    }
}
export const scoringEngine = new ScoringEngine();
