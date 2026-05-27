/**
 * Trend calculation utilities for TrendAnalyzer
 */

import {
  loadTrendHistory,
  getLastRecord,
  getLastNRecords,
  getRecordsForDays,
} from '../utils/trendStorage.js';
import { ComponentScores } from '../types/index.js';
import { logger } from '../utils/logger.js';
import type { AnalyzedTrend } from './trendAnalyzer.js';

export function calculateChangePercent(
  previousScore: number,
  currentScore: number
): number {
  if (previousScore === 0) return 0;
  return ((currentScore - previousScore) / previousScore) * 100;
}

export function determineTrendDirection(
  previousScore: number,
  currentScore: number
): 'improving' | 'stable' | 'degrading' {
  const changePercent = calculateChangePercent(previousScore, currentScore);
  if (changePercent > 0.5) return 'improving';
  if (changePercent < -0.5) return 'degrading';
  return 'stable';
}

export function determineTrendDirectionForValue(
  previousValue: number,
  currentValue: number
): 'up' | 'down' | 'stable' {
  const changePercent = calculateChangePercent(previousValue, currentValue);
  if (changePercent > 0.5) return 'up';
  if (changePercent < -0.5) return 'down';
  return 'stable';
}

export function getLastFiveScores(): number[] {
  return getLastNRecords(5).map(r => r.score);
}

export function calculateDayAverage(days: number): number {
  const records = getRecordsForDays(days);
  if (records.length === 0) return 0;
  return records.reduce((acc, r) => acc + r.score, 0) / records.length;
}

export function calculateVolatility(): number {
  const records = loadTrendHistory().records;
  if (records.length < 2) return 0;

  const scores = records.map(r => r.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) /
    scores.length;

  return Math.sqrt(variance);
}

export function getBestScore(): number {
  const records = loadTrendHistory().records;
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.score));
}

export function getWorstScore(): number {
  const records = loadTrendHistory().records;
  if (records.length === 0) return 0;
  return Math.min(...records.map(r => r.score));
}

export function identifyConcerningMetrics(
  currentScores: ComponentScores
): string[] {
  const lastRecord = getLastRecord();
  if (!lastRecord) return [];

  const concerning: string[] = [];
  const categories = [
    'codeQuality',
    'testCoverage',
    'architecture',
    'security',
  ] as const;

  for (const category of categories) {
    const current = currentScores[category].score;
    const previous = lastRecord.componentScores[category].score;
    const decline = ((previous - current) / previous) * 100;

    if (decline > 2) {
      concerning.push(category);
      logger.debug(
        `Concerning metric: ${category} declined ${decline.toFixed(1)}%`
      );
    }
  }

  return concerning;
}

export function generateTrendSummary(
  trend: AnalyzedTrend,
  currentScore: number
): string {
  const parts: string[] = [];

  if (trend.direction === 'improving') {
    parts.push('Quality is improving');
  } else if (trend.direction === 'degrading') {
    parts.push('Quality is declining');
  } else {
    parts.push('Quality is stable');
  }

  if (trend.sevenDayAverage !== undefined) {
    const diff = currentScore - trend.sevenDayAverage;
    if (diff > 1) {
      parts.push(`above 7-day average (+${diff.toFixed(1)}%)`);
    } else if (diff < -1) {
      parts.push(`below 7-day average (${diff.toFixed(1)}%)`);
    }
  }

  if (trend.volatility !== undefined) {
    if (trend.volatility > 5) {
      parts.push('with high inconsistency');
    } else if (trend.volatility < 1) {
      parts.push('with excellent consistency');
    }
  }

  if (trend.concerningMetrics && trend.concerningMetrics.length > 0) {
    parts.push(`⚠ ${trend.concerningMetrics.join(', ')} needs attention`);
  }

  return parts.join(', ');
}
