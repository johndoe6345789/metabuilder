/**
 * Trend Analyzer - Calculates trends, patterns, and insights from historical data
 * Provides trend direction, velocity, and anomaly detection
 */

import { TrendData, TrendDirection, ComponentScores } from '../types/index.js';
import {
  loadTrendHistory,
  getLastRecord,
  getLastNRecords,
  getRecordsForDays,
  HistoricalRecord,
} from '../utils/trendStorage';
import { logger } from '../utils/logger.js';

/**
 * Extended trend data with additional analytics
 */
export interface AnalyzedTrend extends TrendData {
  sevenDayAverage?: number;
  thirtyDayAverage?: number;
  volatility?: number;
  bestScore?: number;
  worstScore?: number;
  concerningMetrics?: string[];
  trendSummary?: string;
}

/**
 * Trend analyzer that calculates trend metrics
 */
export class TrendAnalyzer {
  /**
   * Analyze current score against historical data
   */
  analyzeTrend(currentScore: number, componentScores: ComponentScores): AnalyzedTrend {
    const lastRecord = getLastRecord();
    const allRecords = loadTrendHistory().records;

    const trend: AnalyzedTrend = {
      currentScore,
      componentTrends: this.analyzeComponentTrends(componentScores),
    };

    if (lastRecord) {
      trend.previousScore = lastRecord.score;
      trend.changePercent = this.calculateChangePercent(lastRecord.score, currentScore);
      trend.direction = this.determineTrendDirection(lastRecord.score, currentScore);
    }

    // Historical comparisons
    if (allRecords.length > 0) {
      trend.lastFiveScores = this.getLastFiveScores();
      trend.sevenDayAverage = this.calculateDayAverage(7);
      trend.thirtyDayAverage = this.calculateDayAverage(30);
      trend.volatility = this.calculateVolatility();
      trend.bestScore = this.getBestScore();
      trend.worstScore = this.getWorstScore();
      trend.concerningMetrics = this.identifyConcerningMetrics(componentScores);
      trend.trendSummary = this.generateTrendSummary(trend, currentScore);
    }

    return trend;
  }

  /**
   * Calculate component-specific trends
   */
  private analyzeComponentTrends(currentScores: ComponentScores): Record<string, TrendDirection> {
    const lastRecord = getLastRecord();

    const categories = ['codeQuality', 'testCoverage', 'architecture', 'security'] as const;
    const trends: Record<string, TrendDirection> = {};

    for (const category of categories) {
      const current = currentScores[category].score;
      const trendData: TrendDirection = { current };

      if (lastRecord) {
        const previous = lastRecord.componentScores[category].score;
        trendData.previous = previous;
        trendData.change = current - previous;
        trendData.direction = this.determineTrendDirectionForValue(previous, current);
      }

      trends[category] = trendData;
    }

    return trends;
  }

  /**
   * Calculate percentage change between two scores
   */
  private calculateChangePercent(previousScore: number, currentScore: number): number {
    if (previousScore === 0) return 0;
    return ((currentScore - previousScore) / previousScore) * 100;
  }

  /**
   * Determine trend direction based on score change
   * Threshold: ±0.5% is considered stable
   */
  private determineTrendDirection(previousScore: number, currentScore: number): 'improving' | 'stable' | 'degrading' {
    const changePercent = this.calculateChangePercent(previousScore, currentScore);
    const threshold = 0.5;

    if (changePercent > threshold) return 'improving';
    if (changePercent < -threshold) return 'degrading';
    return 'stable';
  }

  /**
   * Determine trend for a specific value
   */
  private determineTrendDirectionForValue(
    previousValue: number,
    currentValue: number
  ): 'up' | 'down' | 'stable' {
    const changePercent = this.calculateChangePercent(previousValue, currentValue);
    const threshold = 0.5;

    if (changePercent > threshold) return 'up';
    if (changePercent < -threshold) return 'down';
    return 'stable';
  }

  /**
   * Get the last 5 scores (or fewer if not enough history)
   */
  private getLastFiveScores(): number[] {
    const records = getLastNRecords(5);
    return records.map((r) => r.score);
  }

  /**
   * Calculate average score over the last N days
   */
  private calculateDayAverage(days: number): number {
    const records = getRecordsForDays(days);
    if (records.length === 0) return 0;

    const sum = records.reduce((acc, record) => acc + record.score, 0);
    return sum / records.length;
  }

  /**
   * Calculate score volatility (standard deviation)
   * Measures consistency of scores
   */
  private calculateVolatility(): number {
    const records = loadTrendHistory().records;
    if (records.length < 2) return 0;

    // Use all records for volatility calculation
    const scores = records.map((r) => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    const variance = scores.reduce((acc, score) => {
      return acc + Math.pow(score - mean, 2);
    }, 0) / scores.length;

    return Math.sqrt(variance);
  }

  /**
   * Get best score from history
   */
  private getBestScore(): number {
    const records = loadTrendHistory().records;
    if (records.length === 0) return 0;
    return Math.max(...records.map((r) => r.score));
  }

  /**
   * Get worst score from history
   */
  private getWorstScore(): number {
    const records = loadTrendHistory().records;
    if (records.length === 0) return 0;
    return Math.min(...records.map((r) => r.score));
  }

  /**
   * Identify metrics showing concerning decline (>2% decline)
   */
  private identifyConcerningMetrics(currentScores: ComponentScores): string[] {
    const lastRecord = getLastRecord();
    if (!lastRecord) return [];

    const concerning: string[] = [];
    const categories = ['codeQuality', 'testCoverage', 'architecture', 'security'] as const;
    const threshold = 2; // 2% decline threshold

    for (const category of categories) {
      const current = currentScores[category].score;
      const previous = lastRecord.componentScores[category].score;
      const decline = ((previous - current) / previous) * 100;

      if (decline > threshold) {
        concerning.push(category);
        logger.debug(`Concerning metric detected: ${category} declined ${decline.toFixed(1)}%`);
      }
    }

    return concerning;
  }

  /**
   * Generate human-readable trend summary
   */
  private generateTrendSummary(trend: AnalyzedTrend, currentScore: number): string {
    const parts: string[] = [];

    // Direction summary
    if (trend.direction === 'improving') {
      parts.push('Quality is improving');
    } else if (trend.direction === 'degrading') {
      parts.push('Quality is declining');
    } else {
      parts.push('Quality is stable');
    }

    // Historical comparison
    if (trend.sevenDayAverage !== undefined) {
      const diff = currentScore - trend.sevenDayAverage;
      if (diff > 1) {
        parts.push(`above 7-day average (+${diff.toFixed(1)}%)`);
      } else if (diff < -1) {
        parts.push(`below 7-day average (${diff.toFixed(1)}%)`);
      }
    }

    // Volatility assessment
    if (trend.volatility !== undefined) {
      if (trend.volatility > 5) {
        parts.push('with high inconsistency');
      } else if (trend.volatility < 1) {
        parts.push('with excellent consistency');
      }
    }

    // Concerning metrics
    if (trend.concerningMetrics && trend.concerningMetrics.length > 0) {
      parts.push(`⚠ ${trend.concerningMetrics.join(', ')} needs attention`);
    }

    return parts.join(', ');
  }

  /**
   * Get velocity (rate of change per day)
   * Measures how fast scores are changing
   */
  getVelocity(days: number = 7): number {
    const records = getRecordsForDays(days);
    if (records.length < 2) return 0;

    const firstScore = records[0].score;
    const lastScore = records[records.length - 1].score;
    const daysPassed = days;

    return (lastScore - firstScore) / daysPassed;
  }

  /**
   * Determine if metrics are concerning (any metric declined >2%)
   */
  hasConceringMetrics(componentScores: ComponentScores): boolean {
    const concerningMetrics = this.identifyConcerningMetrics(componentScores);
    return concerningMetrics.length > 0;
  }

  /**
   * Get specific trend recommendation based on trend data
   */
  getTrendRecommendation(trend: AnalyzedTrend): string | null {
    if (!trend.direction) return null;

    if (trend.direction === 'improving') {
      return 'Keep up the momentum, continue current practices';
    } else if (trend.direction === 'degrading') {
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

export const trendAnalyzer = new TrendAnalyzer();
