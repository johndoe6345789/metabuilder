/**
 * Analysis Registry — tracks analysis results for trend analysis
 */

import { ScoringResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import {
  calcAverageScore, calcScoreTrend,
  calcComponentTrends, calcStatistics,
} from './registry-stats.js';

export interface AnalysisRecord {
  timestamp: string; id: string;
  overall: { score: number; grade: 'A'|'B'|'C'|'D'|'F'; status: 'pass'|'fail' };
  components: { codeQuality: number; testCoverage: number; architecture: number; security: number };
  details?: { findings: number; executionTime: number };
}

export class AnalysisRegistry {
  private records: AnalysisRecord[] = [];
  private maxRecords: number;
  constructor(maxRecords = 50) {
    this.maxRecords = maxRecords;
    logger.debug(`AnalysisRegistry init: max=${maxRecords}`);
  }
  recordAnalysis(r: ScoringResult): void {
    const cs = r.componentScores;
    const rec: AnalysisRecord = {
      timestamp: new Date().toISOString(), id: `analysis-${Date.now()}`,
      overall: { score: r.overall.score, grade: r.overall.grade, status: r.overall.status },
      components: { codeQuality: cs.codeQuality.score, testCoverage: cs.testCoverage.score, architecture: cs.architecture.score, security: cs.security.score },
      details: { findings: r.findings.length, executionTime: r.metadata.analysisTime },
    };
    this.records.push(rec);
    if (this.records.length > this.maxRecords) {
      const rm = this.records.splice(
        0, this.records.length - this.maxRecords
      );
      logger.debug(`Removed ${rm.length} old records`);
    }
    logger.debug(`Recorded: ${rec.id}`, {
      score: rec.overall.score.toFixed(2),
      grade: rec.overall.grade,
    });
  }
  getAllRecords = () => [...this.records];
  getRecentRecords(count = 10): AnalysisRecord[] {
    return this.records.slice(
      Math.max(0, this.records.length - count)
    ).reverse();
  }
  getRecord = (id: string) => this.records.find(r => r.id === id);
  getAverageScore = () => calcAverageScore(this.records);
  getScoreTrend = () => calcScoreTrend(this.records);
  getLastScores(count = 5): number[] {
    return this.records
      .slice(Math.max(0, this.records.length - count))
      .map(r => r.overall.score);
  }
  getComponentTrends = () => calcComponentTrends(this.records);
  getStatistics = () => calcStatistics(this.records);
  clear(): void {
    const n = this.records.length;
    this.records = [];
    logger.debug(`Cleared ${n} records`);
  }
  getRecordCount = () => this.records.length;
  export = () => JSON.stringify(this.records, null, 2);
  import(json: string): void {
    try {
      this.records = JSON.parse(json) as AnalysisRecord[];
      logger.debug(`Imported ${this.records.length} records`);
    } catch (e) {
      logger.error('Failed to import records', {
        error: (e as Error).message,
      });
    }
  }
}

let globalRegistry: AnalysisRegistry | null = null;
export function getGlobalRegistry(): AnalysisRegistry {
  if (!globalRegistry) globalRegistry = new AnalysisRegistry();
  return globalRegistry;
}
export function resetGlobalRegistry(): void {
  globalRegistry = null;
  logger.debug('Global AnalysisRegistry reset');
}
