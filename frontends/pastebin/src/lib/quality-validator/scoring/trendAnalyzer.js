/**
 * Trend Analyzer - Calculates trends from historical data
 */
import { getLastRecord, loadTrendHistory, getRecordsForDays, } from '../utils/trendStorage.js';
import { calculateChangePercent, determineTrendDirection, determineTrendDirectionForValue, getLastFiveScores, calculateDayAverage, calculateVolatility, getBestScore, getWorstScore, identifyConcerningMetrics, generateTrendSummary, } from './trend-calculations.js';
export class TrendAnalyzer {
    analyzeTrend(currentScore, componentScores) {
        const lastRecord = getLastRecord();
        const allRecords = loadTrendHistory().records;
        const trend = {
            currentScore,
            componentTrends: this.analyzeComponentTrends(componentScores),
        };
        if (lastRecord) {
            trend.previousScore = lastRecord.score;
            trend.changePercent = calculateChangePercent(lastRecord.score, currentScore);
            trend.direction = determineTrendDirection(lastRecord.score, currentScore);
        }
        if (allRecords.length > 0) {
            trend.lastFiveScores = getLastFiveScores();
            trend.sevenDayAverage = calculateDayAverage(7);
            trend.thirtyDayAverage = calculateDayAverage(30);
            trend.volatility = calculateVolatility();
            trend.bestScore = getBestScore();
            trend.worstScore = getWorstScore();
            trend.concerningMetrics = identifyConcerningMetrics(componentScores);
            trend.trendSummary = generateTrendSummary(trend, currentScore);
        }
        return trend;
    }
    analyzeComponentTrends(currentScores) {
        const lastRecord = getLastRecord();
        const categories = [
            'codeQuality',
            'testCoverage',
            'architecture',
            'security',
        ];
        const trends = {};
        for (const category of categories) {
            const current = currentScores[category].score;
            const trendData = { current };
            if (lastRecord) {
                const previous = lastRecord.componentScores[category].score;
                trendData.previous = previous;
                trendData.change = current - previous;
                trendData.direction = determineTrendDirectionForValue(previous, current);
            }
            trends[category] = trendData;
        }
        return trends;
    }
    getVelocity(days = 7) {
        const records = getRecordsForDays(days);
        if (records.length < 2)
            return 0;
        const firstScore = records[0].score;
        const lastScore = records[records.length - 1].score;
        return (lastScore - firstScore) / days;
    }
    hasConceringMetrics(componentScores) {
        return identifyConcerningMetrics(componentScores).length > 0;
    }
    getTrendRecommendation(trend) {
        if (!trend.direction)
            return null;
        if (trend.direction === 'improving') {
            return 'Keep up the momentum, continue current practices';
        }
        else if (trend.direction === 'degrading') {
            return 'Score declining, review recent changes';
        }
        if (trend.volatility && trend.volatility > 5) {
            return 'Quality inconsistent, focus on stability';
        }
        if (trend.concerningMetrics && trend.concerningMetrics.length > 0) {
            return `Focus on improving: ${trend.concerningMetrics.join(', ')}`;
        }
        return null;
    }
}
/** Shared singleton, matching the configLoader/logger module convention. */
export const trendAnalyzer = new TrendAnalyzer();
