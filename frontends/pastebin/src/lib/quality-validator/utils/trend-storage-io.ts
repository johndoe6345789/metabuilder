/**
 * Trend storage file I/O operations
 */

import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger.js';
import type { TrendHistory } from './trendStorage.js';

const HISTORY_DIR = '.quality';
const HISTORY_FILE = 'history.json';
const HISTORY_VERSION = '1.0';

export function getHistoryPath(): string {
  return path.join(process.cwd(), HISTORY_DIR, HISTORY_FILE);
}

export function ensureHistoryDirectory(): void {
  try {
    const dir = path.join(process.cwd(), HISTORY_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.debug(`Created history directory: ${dir}`);
    }
  } catch (e) {
    logger.warn(`Failed to create history directory: ${(e as Error).message}`);
  }
}

export function emptyHistory(): TrendHistory {
  return {
    version: HISTORY_VERSION,
    created: new Date().toISOString(),
    records: [],
  };
}

export function readHistoryFile(): TrendHistory {
  try {
    ensureHistoryDirectory();
    const p = getHistoryPath();
    if (!fs.existsSync(p)) {
      logger.debug('No trend history found, starting fresh');
      return emptyHistory();
    }
    const h = JSON.parse(fs.readFileSync(p, 'utf-8')) as TrendHistory;
    if (!h.records || !Array.isArray(h.records)) {
      logger.warn('Invalid history structure, resetting');
      return emptyHistory();
    }
    return h;
  } catch (e) {
    logger.warn(`Failed to load trend history: ${(e as Error).message}`);
    return emptyHistory();
  }
}

export function writeHistoryFile(
  history: TrendHistory
): void {
  fs.writeFileSync(
    getHistoryPath(),
    JSON.stringify(history, null, 2),
    'utf-8'
  );
  logger.debug(`Saved history: ${history.records.length} records`);
}

export function deleteHistoryFile(): void {
  try {
    ensureHistoryDirectory();
    const p = getHistoryPath();
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      logger.debug('Cleared trend history');
    }
  } catch (e) {
    logger.warn(`Failed to clear history: ${(e as Error).message}`);
  }
}
