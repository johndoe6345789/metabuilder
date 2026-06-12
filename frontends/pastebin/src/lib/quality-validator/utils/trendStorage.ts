/**
 * Trend Storage — historical score persistence and retrieval
 */

import { ComponentScores } from '../types/index.js'
import { logger } from './logger.js'
import {
  readHistoryFile,
  writeHistoryFile,
  deleteHistoryFile,
  emptyHistory,
} from './trend-storage-io.js'

export interface HistoricalRecord {
  timestamp: string
  score: number
  grade: string
  componentScores: ComponentScores
}

export interface TrendHistory {
  version: string
  created: string
  records: HistoricalRecord[]
}

const MAX_RECORDS = 30

export function loadTrendHistory(): TrendHistory {
  return readHistoryFile()
}

export function saveTrendHistory(record: HistoricalRecord): TrendHistory {
  try {
    const history = loadTrendHistory()
    history.records.push(record)
    if (history.records.length > MAX_RECORDS) {
      history.records = history.records.slice(-MAX_RECORDS)
      logger.debug(`Trimmed history to last ${MAX_RECORDS} records`)
    }
    writeHistoryFile(history)
    return history
  } catch (e) {
    logger.warn(`Failed to save trend history: ${(e as Error).message}`)
    return { ...emptyHistory(), records: [record] }
  }
}

export function getLastRecord(): HistoricalRecord | null {
  const h = loadTrendHistory()
  return h.records.length > 0 ? h.records[h.records.length - 1] : null
}

export function getAllRecords(): HistoricalRecord[] {
  return loadTrendHistory().records
}

export function getRecordsForDays(days: number): HistoricalRecord[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return loadTrendHistory().records.filter(
    r => new Date(r.timestamp).getTime() >= cutoff,
  )
}

export function getLastNRecords(n: number): HistoricalRecord[] {
  return loadTrendHistory().records.slice(-n)
}

export function clearTrendHistory(): void {
  deleteHistoryFile()
}

export function createHistoricalRecord(
  score: number,
  grade: string,
  componentScores: ComponentScores,
): HistoricalRecord {
  return { timestamp: new Date().toISOString(), score, grade, componentScores }
}
