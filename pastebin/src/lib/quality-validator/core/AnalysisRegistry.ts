/**
 * Analysis Registry
 * Tracks and manages analysis results for historical tracking and trend analysis
 * Implements SOLID principles:
 * - Single Responsibility: Registry only manages result persistence and retrieval
 * - Open/Closed: Easy to add new storage backends
 */

import { ScoringResult, AnalysisResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Single analysis run record
 */
export interface AnalysisRecord {
  timestamp: string;
  id: string;
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'pass' | 'fail';
  };
  components: {
    codeQuality: number;
    testCoverage: number;
    architecture: number;
    security: number;
  };
  details?: {
    findings: number;
    executionTime: number;
  };
}

/**
 * Registry for tracking analysis history
 */
export class AnalysisRegistry {
  private records: AnalysisRecord[] = [];
  private maxRecords: number;

  constructor(maxRecords: number = 50) {
    this.maxRecords = maxRecords;
    logger.debug(`AnalysisRegistry initialized with max records: ${maxRecords}`);
  }

  /**
   * Record an analysis result
   */
  recordAnalysis(scoringResult: ScoringResult): void {
    const record: AnalysisRecord = {
      timestamp: new Date().toISOString(),
      id: `analysis-${Date.now()}`,
      overall: {
        score: scoringResult.overall.score,
        grade: scoringResult.overall.grade,
        status: scoringResult.overall.status,
      },
      components: {
        codeQuality: scoringResult.componentScores.codeQuality.score,
        testCoverage: scoringResult.componentScores.testCoverage.score,
        architecture: scoringResult.componentScores.architecture.score,
        security: scoringResult.componentScores.security.score,
      },
      details: {
        findings: scoringResult.findings.length,
        executionTime: scoringResult.metadata.analysisTime,
      },
    };

    this.records.push(record);

    // Trim old records if we exceed max
    if (this.records.length > this.maxRecords) {
      const removed = this.records.splice(0, this.records.length - this.maxRecords);
      logger.debug(`Removed ${removed.length} old analysis records`);
    }

    logger.debug(`Analysis recorded: ${record.id}`, {
      score: record.overall.score.toFixed(2),
      grade: record.overall.grade,
    });
  }

  /**
   * Get all recorded analyses
   */
  getAllRecords(): AnalysisRecord[] {
    return [...this.records];
  }

  /**
   * Get latest N records
   */
  getRecentRecords(count: number = 10): AnalysisRecord[] {
    return this.records.slice(Math.max(0, this.records.length - count)).reverse();
  }

  /**
   * Get record by ID
   */
  getRecord(id: string): AnalysisRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  /**
   * Get average score across all records
   */
  getAverageScore(): number {
    if (this.records.length === 0) return 0;
    const sum = this.records.reduce((acc, r) => acc + r.overall.score, 0);
    return sum / this.records.length;
  }

  /**
   * Get score trend (improvement or degradation)
   */
  getScoreTrend(): 'improving' | 'stable' | 'degrading' | 'unknown' {
    if (this.records.length < 2) return 'unknown';

    const recent = this.records[this.records.length - 1];
    const previous = this.records[this.records.length - 2];

    const difference = recent.overall.score - previous.overall.score;
    const threshold = 1; // 1 point change threshold

    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'degrading';
    return 'stable';
  }

  /**
   * Get last N scores
   */
  getLastScores(count: number = 5): number[] {
    return this.records
      .slice(Math.max(0, this.records.length - count))
      .map((r) => r.overall.score);
  }

  /**
   * Get component score trends
   */
  getComponentTrends(): {
    codeQuality: number[];
    testCoverage: number[];
    architecture: number[];
    security: number[];
  } {
    const count = Math.min(10, this.records.length);
    const recent = this.records.slice(Math.max(0, this.records.length - count));

    return {
      codeQuality: recent.map((r) => r.components.codeQuality),
      testCoverage: recent.map((r) => r.components.testCoverage),
      architecture: recent.map((r) => r.components.architecture),
      security: recent.map((r) => r.components.security),
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalRuns: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    trend: 'improving' | 'stable' | 'degrading' | 'unknown';
    passRate: number;
  } {
    if (this.records.length === 0) {
      return {
        totalRuns: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        trend: 'unknown',
        passRate: 0,
      };
    }

    const scores = this.records.map((r) => r.overall.score);
    const passes = this.records.filter((r) => r.overall.status === 'pass').length;

    return {
      totalRuns: this.records.length,
      averageScore: this.getAverageScore(),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      trend: this.getScoreTrend(),
      passRate: (passes / this.records.length) * 100,
    };
  }

  /**
   * Clear all records
   */
  clear(): void {
    const count = this.records.length;
    this.records = [];
    logger.debug(`Cleared ${count} analysis records`);
  }

  /**
   * Get record count
   */
  getRecordCount(): number {
    return this.records.length;
  }

  /**
   * Export records as JSON
   */
  export(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * Import records from JSON
   */
  import(json: string): void {
    try {
      const records = JSON.parse(json) as AnalysisRecord[];
      this.records = records;
      logger.debug(`Imported ${records.length} analysis records`);
    } catch (error) {
      logger.error('Failed to import analysis records', {
        error: (error as Error).message,
      });
    }
  }
}

/**
 * Global singleton instance
 */
let globalRegistry: AnalysisRegistry | null = null;

/**
 * Get or create global registry
 */
export function getGlobalRegistry(): AnalysisRegistry {
  if (!globalRegistry) {
    globalRegistry = new AnalysisRegistry();
  }
  return globalRegistry;
}

/**
 * Reset global registry (useful for testing)
 */
export function resetGlobalRegistry(): void {
  globalRegistry = null;
  logger.debug('Global AnalysisRegistry reset');
}
