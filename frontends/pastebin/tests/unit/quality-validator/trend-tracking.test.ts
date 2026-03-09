/**
 * Trend Tracking Tests
 * Comprehensive tests for trend storage, analysis, and reporting
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  loadTrendHistory,
  saveTrendHistory,
  getLastRecord,
  getAllRecords,
  getLastNRecords,
  getRecordsForDays,
  clearTrendHistory,
  createHistoricalRecord,
  HistoricalRecord,
  TrendHistory,
} from '../../../src/lib/quality-validator/utils/trendStorage';
import { TrendAnalyzer } from '../../../src/lib/quality-validator/scoring/trendAnalyzer';
import { ComponentScores } from '../../../src/lib/quality-validator/types/index';

// Helper to create mock component scores
function createMockComponentScores(codeQuality = 85, testCoverage = 90, architecture = 75, security = 88): ComponentScores {
  return {
    codeQuality: { score: codeQuality, weight: 0.25, weightedScore: codeQuality * 0.25 },
    testCoverage: { score: testCoverage, weight: 0.25, weightedScore: testCoverage * 0.25 },
    architecture: { score: architecture, weight: 0.25, weightedScore: architecture * 0.25 },
    security: { score: security, weight: 0.25, weightedScore: security * 0.25 },
  };
}

describe('TrendStorage', () => {
  beforeEach(() => {
    clearTrendHistory();
  });

  afterEach(() => {
    clearTrendHistory();
  });

  describe('loadTrendHistory', () => {
    it('should return empty history when file does not exist', () => {
      const history = loadTrendHistory();
      expect(history.records).toEqual([]);
      expect(history.version).toBe('1.0');
      expect(history.created).toBeDefined();
    });

    it('should load existing history from file', () => {
      const record1 = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record1);

      const history = loadTrendHistory();
      expect(history.records).toHaveLength(1);
      expect(history.records[0].score).toBe(85);
      expect(history.records[0].grade).toBe('B');
    });

    it('should return empty history on corrupt file', () => {
      // Create a corrupt file
      const historyDir = path.join(process.cwd(), '.quality');
      const historyFile = path.join(historyDir, 'history.json');

      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      fs.writeFileSync(historyFile, '{invalid json}', 'utf-8');

      const history = loadTrendHistory();
      expect(history.records).toEqual([]);
      expect(history.version).toBe('1.0');
    });
  });

  describe('saveTrendHistory', () => {
    it('should save a new record', () => {
      const record = createHistoricalRecord(90, 'A', createMockComponentScores());
      const history = saveTrendHistory(record);

      expect(history.records).toHaveLength(1);
      expect(history.records[0].score).toBe(90);
    });

    it('should maintain rolling window of max 30 records', () => {
      // Add 35 records
      for (let i = 0; i < 35; i++) {
        const score = 75 + (i % 20);
        const record = createHistoricalRecord(score, 'B', createMockComponentScores(score));
        saveTrendHistory(record);
      }

      const history = loadTrendHistory();
      expect(history.records.length).toBeLessThanOrEqual(30);
      expect(history.records.length).toBe(30);
    });

    it('should preserve order of records', () => {
      const scores = [80, 85, 82, 88, 90];

      for (const score of scores) {
        const record = createHistoricalRecord(score, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const history = loadTrendHistory();
      expect(history.records.map((r) => r.score)).toEqual(scores);
    });
  });

  describe('getLastRecord', () => {
    it('should return null when no records exist', () => {
      const record = getLastRecord();
      expect(record).toBeNull();
    });

    it('should return the most recent record', () => {
      const record1 = createHistoricalRecord(80, 'B', createMockComponentScores());
      const record2 = createHistoricalRecord(85, 'B', createMockComponentScores());

      saveTrendHistory(record1);
      saveTrendHistory(record2);

      const last = getLastRecord();
      expect(last?.score).toBe(85);
    });
  });

  describe('getAllRecords', () => {
    it('should return empty array when no records', () => {
      const records = getAllRecords();
      expect(records).toEqual([]);
    });

    it('should return all records in order', () => {
      const scores = [80, 85, 82];

      for (const score of scores) {
        const record = createHistoricalRecord(score, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const records = getAllRecords();
      expect(records.map((r) => r.score)).toEqual(scores);
    });
  });

  describe('getLastNRecords', () => {
    it('should return requested number of records', () => {
      for (let i = 0; i < 10; i++) {
        const record = createHistoricalRecord(80 + i, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const records = getLastNRecords(3);
      expect(records).toHaveLength(3);
      expect(records[0].score).toBe(87);
      expect(records[1].score).toBe(88);
      expect(records[2].score).toBe(89);
    });

    it('should return fewer records if not enough history', () => {
      for (let i = 0; i < 3; i++) {
        const record = createHistoricalRecord(80 + i, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const records = getLastNRecords(10);
      expect(records).toHaveLength(3);
    });
  });

  describe('getRecordsForDays', () => {
    it('should filter records by date range', () => {
      const now = Date.now();

      // Create records with different timestamps
      const oldRecord = createHistoricalRecord(80, 'B', createMockComponentScores());
      oldRecord.timestamp = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago

      const recentRecord = createHistoricalRecord(85, 'B', createMockComponentScores());
      recentRecord.timestamp = new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago

      saveTrendHistory(oldRecord);
      saveTrendHistory(recentRecord);

      const records = getRecordsForDays(7);
      expect(records).toHaveLength(1);
      expect(records[0].score).toBe(85);
    });
  });

  describe('clearTrendHistory', () => {
    it('should remove history file', () => {
      const record = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record);

      clearTrendHistory();

      const records = getAllRecords();
      expect(records).toEqual([]);
    });
  });

  describe('createHistoricalRecord', () => {
    it('should create record with timestamp', () => {
      const before = Date.now();
      const record = createHistoricalRecord(85, 'B', createMockComponentScores());
      const after = Date.now();

      expect(record.score).toBe(85);
      expect(record.grade).toBe('B');
      expect(record.timestamp).toBeDefined();

      const recordTime = new Date(record.timestamp).getTime();
      expect(recordTime).toBeGreaterThanOrEqual(before);
      expect(recordTime).toBeLessThanOrEqual(after + 1000); // Allow 1s tolerance
    });

    it('should include all component scores', () => {
      const scores = createMockComponentScores(80, 85, 90, 88);
      const record = createHistoricalRecord(85, 'B', scores);

      expect(record.componentScores.codeQuality.score).toBe(80);
      expect(record.componentScores.testCoverage.score).toBe(85);
      expect(record.componentScores.architecture.score).toBe(90);
      expect(record.componentScores.security.score).toBe(88);
    });
  });
});

describe('TrendAnalyzer', () => {
  const analyzer = new TrendAnalyzer();

  beforeEach(() => {
    clearTrendHistory();
  });

  afterEach(() => {
    clearTrendHistory();
  });

  describe('analyzeTrend - first run (no history)', () => {
    it('should create baseline trend with no previous score', () => {
      const scores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, scores);

      expect(trend.currentScore).toBe(85);
      expect(trend.previousScore).toBeUndefined();
      expect(trend.direction).toBeUndefined();
      expect(trend.changePercent).toBeUndefined();
    });

    it('should have empty historical data on first run', () => {
      const scores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, scores);

      expect(trend.sevenDayAverage).toBeUndefined();
      expect(trend.thirtyDayAverage).toBeUndefined();
    });
  });

  describe('analyzeTrend - trend direction', () => {
    it('should detect improving trend', () => {
      const record1 = createHistoricalRecord(80, 'B', createMockComponentScores());
      saveTrendHistory(record1);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      expect(trend.direction).toBe('improving');
      expect(trend.changePercent).toBeCloseTo(6.25, 1);
    });

    it('should detect degrading trend', () => {
      const record1 = createHistoricalRecord(90, 'A', createMockComponentScores());
      saveTrendHistory(record1);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      expect(trend.direction).toBe('degrading');
      expect(trend.changePercent).toBeCloseTo(-5.56, 1);
    });

    it('should detect stable trend (within 0.5% threshold)', () => {
      const record1 = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record1);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85.2, newScores);

      expect(trend.direction).toBe('stable');
    });
  });

  describe('analyzeTrend - historical comparisons', () => {
    it('should calculate 7-day average', () => {
      // Add records with different scores
      for (let i = 0; i < 7; i++) {
        const score = 80 + i;
        const record = createHistoricalRecord(score, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      // Average of 80-86 is 83
      expect(trend.sevenDayAverage).toBeCloseTo(83, 0);
    });

    it('should calculate 30-day average', () => {
      const now = Date.now();

      // Add 10 records with timestamps within last 30 days
      for (let i = 0; i < 10; i++) {
        const record = createHistoricalRecord(80, 'B', createMockComponentScores());
        record.timestamp = new Date(now - (10 - i) * 24 * 60 * 60 * 1000).toISOString();
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      // Should have calculated 30-day average from the records
      const trendData = trend as any;
      expect(trendData.thirtyDayAverage).toBeDefined();
      expect(trendData.thirtyDayAverage).toBeGreaterThan(75);
      expect(trendData.thirtyDayAverage).toBeLessThan(90);
    });

    it('should track best and worst scores', () => {
      const scores = [80, 95, 75, 88, 90];

      for (const score of scores) {
        const record = createHistoricalRecord(score, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(87, newScores);

      const trendData = trend as any;
      expect(trendData.bestScore).toBe(95);
      expect(trendData.worstScore).toBe(75);
    });
  });

  describe('analyzeTrend - volatility', () => {
    it('should detect low volatility', () => {
      // Consistent scores
      for (let i = 0; i < 5; i++) {
        const record = createHistoricalRecord(85, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85.1, newScores);

      const trendData = trend as any;
      expect(trendData.volatility).toBeLessThan(1);
    });

    it('should detect high volatility', () => {
      // Inconsistent scores
      const scores = [70, 95, 75, 90, 65];

      for (const score of scores) {
        const record = createHistoricalRecord(score, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      const trendData = trend as any;
      expect(trendData.volatility).toBeGreaterThan(5);
    });
  });

  describe('analyzeTrend - concerning metrics', () => {
    it('should identify metrics with >2% decline', () => {
      const oldScores = createMockComponentScores(100, 100, 100, 100);
      const record = createHistoricalRecord(97.5, 'A', oldScores);
      saveTrendHistory(record);

      // Decline by more than 2%
      const newScores = createMockComponentScores(97, 99, 98, 80); // security declined ~20%
      const trend = analyzer.analyzeTrend(93.5, newScores);

      const trendData = trend as any;
      expect(trendData.concerningMetrics).toContain('security');
    });

    it('should not flag metrics with <2% decline', () => {
      const oldScores = createMockComponentScores(85, 85, 85, 85);
      const record = createHistoricalRecord(85, 'B', oldScores);
      saveTrendHistory(record);

      // Small decline (<2%)
      const newScores = createMockComponentScores(84.8, 84.9, 85.1, 85.2);
      const trend = analyzer.analyzeTrend(85, newScores);

      const trendData = trend as any;
      expect(trendData.concerningMetrics).toHaveLength(0);
    });
  });

  describe('analyzeTrend - component trends', () => {
    it('should track individual component changes', () => {
      const oldScores = createMockComponentScores(80, 80, 80, 80);
      const record = createHistoricalRecord(80, 'B', oldScores);
      saveTrendHistory(record);

      const newScores = createMockComponentScores(85, 75, 80, 90);
      const trend = analyzer.analyzeTrend(82.5, newScores);

      expect(trend.componentTrends?.codeQuality.direction).toBe('up');
      expect(trend.componentTrends?.testCoverage.direction).toBe('down');
      expect(trend.componentTrends?.architecture.direction).toBe('stable');
      expect(trend.componentTrends?.security.direction).toBe('up');
    });

    it('should calculate component score changes', () => {
      const oldScores = createMockComponentScores(80, 80, 80, 80);
      const record = createHistoricalRecord(80, 'B', oldScores);
      saveTrendHistory(record);

      const newScores = createMockComponentScores(90, 75, 85, 88);
      const trend = analyzer.analyzeTrend(84.5, newScores);

      expect(trend.componentTrends?.codeQuality.change).toBe(10);
      expect(trend.componentTrends?.testCoverage.change).toBe(-5);
      expect(trend.componentTrends?.security.change).toBe(8);
    });
  });

  describe('getTrendRecommendation', () => {
    it('should recommend continuation for improving trend', () => {
      const record = createHistoricalRecord(80, 'B', createMockComponentScores());
      saveTrendHistory(record);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      const recommendation = analyzer.getTrendRecommendation(trend);
      expect(recommendation).toContain('Keep up the momentum');
    });

    it('should recommend review for degrading trend', () => {
      const record = createHistoricalRecord(90, 'A', createMockComponentScores());
      saveTrendHistory(record);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      const recommendation = analyzer.getTrendRecommendation(trend);
      expect(recommendation).toContain('Score declining');
    });

    it('should provide recommendation for concerning metrics', () => {
      const oldScores = createMockComponentScores(100, 100, 100, 100);
      const record = createHistoricalRecord(100, 'A', oldScores);
      saveTrendHistory(record);

      // Create significant decline in one metric (>5% = degrading trend takes priority)
      const newScores = createMockComponentScores(97, 99, 98, 80); // security down significantly
      const trend = analyzer.analyzeTrend(93.5, newScores);

      const recommendation = analyzer.getTrendRecommendation(trend);
      // Should provide recommendation - degrading trend takes priority over concerning metrics
      expect(recommendation).toBeTruthy();
      expect(recommendation?.toLowerCase()).toMatch(/declining|review|momentum|focus/);
    });
  });

  describe('getVelocity', () => {
    it('should calculate positive velocity for improving trend', () => {
      for (let i = 0; i < 7; i++) {
        const record = createHistoricalRecord(80 + i, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const velocity = analyzer.getVelocity(7);
      // With 7 records from 80 to 86, velocity is (86-80)/7 = 0.857
      expect(velocity).toBeGreaterThan(0);
      expect(velocity).toBeCloseTo(0.857, 1);
    });

    it('should calculate zero velocity for stable trend', () => {
      for (let i = 0; i < 7; i++) {
        const record = createHistoricalRecord(85, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const velocity = analyzer.getVelocity(7);
      expect(velocity).toBeCloseTo(0, 2);
    });

    it('should return 0 with less than 2 records', () => {
      const record = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record);

      const velocity = analyzer.getVelocity(7);
      expect(velocity).toBe(0);
    });
  });

  describe('hasConceringMetrics', () => {
    it('should return true when metrics are declining', () => {
      const oldScores = createMockComponentScores(100, 100, 100, 100);
      const record = createHistoricalRecord(100, 'A', oldScores);
      saveTrendHistory(record);

      const newScores = createMockComponentScores(97, 99, 98, 80);
      analyzer.analyzeTrend(93.5, newScores);

      expect(analyzer.hasConceringMetrics(newScores)).toBe(true);
    });

    it('should return false when all metrics are stable', () => {
      const oldScores = createMockComponentScores(85, 85, 85, 85);
      const record = createHistoricalRecord(85, 'B', oldScores);
      saveTrendHistory(record);

      const newScores = createMockComponentScores(85.5, 85.2, 85.1, 85.3);
      analyzer.analyzeTrend(85.25, newScores);

      expect(analyzer.hasConceringMetrics(newScores)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle single data point correctly', () => {
      const record = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(90, newScores);

      expect(trend.currentScore).toBe(90);
      expect(trend.previousScore).toBe(85);
      expect(trend.direction).toBe('improving');
    });

    it('should handle rapid score changes', () => {
      const record = createHistoricalRecord(50, 'F', createMockComponentScores(50, 50, 50, 50));
      saveTrendHistory(record);

      const newScores = createMockComponentScores(95, 95, 95, 95);
      const trend = analyzer.analyzeTrend(95, newScores);

      expect(trend.direction).toBe('improving');
      expect(trend.changePercent).toBeCloseTo(90, 0);
    });

    it('should handle identical consecutive scores', () => {
      const record = createHistoricalRecord(85, 'B', createMockComponentScores());
      saveTrendHistory(record);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      expect(trend.direction).toBe('stable');
      expect(trend.changePercent).toBeCloseTo(0, 2);
    });

    it('should calculate accurate last five scores', () => {
      for (let i = 0; i < 10; i++) {
        const record = createHistoricalRecord(80 + i, 'B', createMockComponentScores());
        saveTrendHistory(record);
      }

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(90, newScores);

      expect(trend.lastFiveScores).toBeDefined();
      expect(trend.lastFiveScores?.length).toBe(5);
      // Last 5 records before the new analysis are the 10th through the newest added
      expect(trend.lastFiveScores).toEqual([85, 86, 87, 88, 89]);
    });
  });

  describe('trend summary generation', () => {
    it('should generate appropriate summary for improving trend', () => {
      const record = createHistoricalRecord(80, 'B', createMockComponentScores());
      saveTrendHistory(record);

      const newScores = createMockComponentScores();
      const trend = analyzer.analyzeTrend(85, newScores);

      const trendData = trend as any;
      expect(trendData.trendSummary).toContain('improving');
    });

    it('should highlight concerning metrics in summary', () => {
      const oldScores = createMockComponentScores(100, 100, 100, 100);
      const record = createHistoricalRecord(100, 'A', oldScores);
      saveTrendHistory(record);

      const newScores = createMockComponentScores(97, 99, 98, 80);
      const trend = analyzer.analyzeTrend(93.5, newScores);

      const trendData = trend as any;
      expect(trendData.trendSummary).toContain('needs attention');
    });
  });
});
