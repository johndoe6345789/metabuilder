/**
 * Trend Storage - Handles historical score persistence and retrieval
 * Manages a rolling window of the last 30 analysis records
 */

import * as path from 'path';
import * as fs from 'fs';
import { ComponentScores } from '../types/index.js';
import { logger } from './logger.js';

/**
 * Historical run record stored in trend history
 */
export interface HistoricalRecord {
  timestamp: string;
  score: number;
  grade: string;
  componentScores: ComponentScores;
}

/**
 * Complete trend history file structure
 */
export interface TrendHistory {
  version: string;
  created: string;
  records: HistoricalRecord[];
}

const HISTORY_DIR = '.quality';
const HISTORY_FILE = 'history.json';
const MAX_RECORDS = 30;
const HISTORY_VERSION = '1.0';

/**
 * Get the full path to the history file
 */
function getHistoryPath(): string {
  return path.join(process.cwd(), HISTORY_DIR, HISTORY_FILE);
}

/**
 * Ensure history directory exists
 */
function ensureHistoryDirectory(): void {
  try {
    const dir = path.join(process.cwd(), HISTORY_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.debug(`Created history directory: ${dir}`);
    }
  } catch (error) {
    logger.warn(`Failed to create history directory: ${(error as Error).message}`);
  }
}

/**
 * Load trend history from file
 * Returns empty history if file doesn't exist
 */
export function loadTrendHistory(): TrendHistory {
  try {
    ensureHistoryDirectory();
    const historyPath = getHistoryPath();

    if (!fs.existsSync(historyPath)) {
      logger.debug('No trend history found, starting fresh');
      return {
        version: HISTORY_VERSION,
        created: new Date().toISOString(),
        records: [],
      };
    }

    const content = fs.readFileSync(historyPath, 'utf-8');
    const history = JSON.parse(content) as TrendHistory;

    // Validate history structure
    if (!history.records || !Array.isArray(history.records)) {
      logger.warn('Invalid history structure, resetting');
      return {
        version: HISTORY_VERSION,
        created: new Date().toISOString(),
        records: [],
      };
    }

    return history;
  } catch (error) {
    logger.warn(`Failed to load trend history: ${(error as Error).message}`);
    return {
      version: HISTORY_VERSION,
      created: new Date().toISOString(),
      records: [],
    };
  }
}

/**
 * Save trend history to file
 * Maintains a rolling window of max 30 records
 */
export function saveTrendHistory(record: HistoricalRecord): TrendHistory {
  try {
    ensureHistoryDirectory();

    // Load existing history
    let history = loadTrendHistory();

    // Add new record
    history.records.push(record);

    // Maintain rolling window - keep only last MAX_RECORDS
    if (history.records.length > MAX_RECORDS) {
      history.records = history.records.slice(-MAX_RECORDS);
      logger.debug(`Trimmed history to last ${MAX_RECORDS} records`);
    }

    // Write to file
    const historyPath = getHistoryPath();
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    logger.debug(`Saved trend history with ${history.records.length} records`);

    return history;
  } catch (error) {
    logger.warn(`Failed to save trend history: ${(error as Error).message}`);
    // Return the in-memory state even if save failed
    return {
      version: HISTORY_VERSION,
      created: new Date().toISOString(),
      records: [record],
    };
  }
}

/**
 * Get the most recent record from history
 */
export function getLastRecord(): HistoricalRecord | null {
  const history = loadTrendHistory();
  return history.records.length > 0 ? history.records[history.records.length - 1] : null;
}

/**
 * Get all records in history
 */
export function getAllRecords(): HistoricalRecord[] {
  const history = loadTrendHistory();
  return history.records;
}

/**
 * Get records from the last N days
 */
export function getRecordsForDays(days: number): HistoricalRecord[] {
  const history = loadTrendHistory();
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return history.records.filter((record) => {
    const recordTime = new Date(record.timestamp).getTime();
    return recordTime >= cutoffTime;
  });
}

/**
 * Get last N records
 */
export function getLastNRecords(n: number): HistoricalRecord[] {
  const history = loadTrendHistory();
  return history.records.slice(-n);
}

/**
 * Clear all history (for testing or reset)
 */
export function clearTrendHistory(): void {
  try {
    ensureHistoryDirectory();
    const historyPath = getHistoryPath();

    if (fs.existsSync(historyPath)) {
      fs.unlinkSync(historyPath);
      logger.debug('Cleared trend history');
    }
  } catch (error) {
    logger.warn(`Failed to clear trend history: ${(error as Error).message}`);
  }
}

/**
 * Create a historical record from current scores
 */
export function createHistoricalRecord(
  score: number,
  grade: string,
  componentScores: ComponentScores
): HistoricalRecord {
  return {
    timestamp: new Date().toISOString(),
    score,
    grade,
    componentScores,
  };
}
