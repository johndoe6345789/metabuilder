/**
 * Trend calculation utilities for TrendAnalyzer
 */
import { loadTrendHistory, getLastRecord, getLastNRecords, getRecordsForDays, } from '../utils/trendStorage.js';
import { logger } from '../utils/logger.js';
export function calculateChangePercent(previousScore, currentScore) {
    if (previousScore === 0)
        return 0;
    return ((currentScore - previousScore) / previousScore) * 100;
}
export function determineTrendDirection(previousScore, currentScore) {
    const changePercent = calculateChangePercent(previousScore, currentScore);
    if (changePercent > 0.5)
        return 'improving';
    if (changePercent < -0.5)
        return 'degrading';
    return 'stable';
}
export function determineTrendDirectionForValue(previousValue, currentValue) {
    const changePercent = calculateChangePercent(previousValue, currentValue);
    if (changePercent > 0.5)
        return 'up';
    if (changePercent < -0.5)
        return 'down';
    return 'stable';
}
export function getLastFiveScores() {
    return getLastNRecords(5).map(r => r.score);
}
export function calculateDayAverage(days) {
    const records = getRecordsForDays(days);
    if (records.length === 0)
        return 0;
    return records.reduce((acc, r) => acc + r.score, 0) / records.length;
}
export function calculateVolatility() {
    const records = loadTrendHistory().records;
    if (records.length < 2)
        return 0;
    const scores = records.map(r => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
}
export function getBestScore() {
    const records = loadTrendHistory().records;
    if (records.length === 0)
        return 0;
    return Math.max(...records.map(r => r.score));
}
export function getWorstScore() {
    const records = loadTrendHistory().records;
    if (records.length === 0)
        return 0;
    return Math.min(...records.map(r => r.score));
}
export function identifyConcerningMetrics(currentScores) {
    const lastRecord = getLastRecord();
    if (!lastRecord)
        return [];
    const concerning = [];
    const categories = [
        'codeQuality',
        'testCoverage',
        'architecture',
        'security',
    ];
    for (const category of categories) {
        const current = currentScores[category].score;
        const previous = lastRecord.componentScores[category].score;
        const decline = ((previous - current) / previous) * 100;
        if (decline > 2) {
            concerning.push(category);
            logger.debug(`Concerning metric: ${category} declined ${decline.toFixed(1)}%`);
        }
    }
    return concerning;
}
export function generateTrendSummary(trend, currentScore) {
    const parts = [];
    if (trend.direction === 'improving') {
        parts.push('Quality is improving');
    }
    else if (trend.direction === 'degrading') {
        parts.push('Quality is declining');
    }
    else {
        parts.push('Quality is stable');
    }
    if (trend.sevenDayAverage !== undefined) {
        const diff = currentScore - trend.sevenDayAverage;
        if (diff > 1) {
            parts.push(`above 7-day average (+${diff.toFixed(1)}%)`);
        }
        else if (diff < -1) {
            parts.push(`below 7-day average (${diff.toFixed(1)}%)`);
        }
    }
    if (trend.volatility !== undefined) {
        if (trend.volatility > 5) {
            parts.push('with high inconsistency');
        }
        else if (trend.volatility < 1) {
            parts.push('with excellent consistency');
        }
    }
    if (trend.concerningMetrics && trend.concerningMetrics.length > 0) {
        parts.push(`⚠ ${trend.concerningMetrics.join(', ')} needs attention`);
    }
    return parts.join(', ');
}
