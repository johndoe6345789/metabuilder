/**
 * Trend Storage — historical score persistence and retrieval
 */
import { logger } from './logger.js';
import { readHistoryFile, writeHistoryFile, deleteHistoryFile, emptyHistory, } from './trend-storage-io.js';
const MAX_RECORDS = 30;
export function loadTrendHistory() {
    return readHistoryFile();
}
export function saveTrendHistory(record) {
    try {
        const history = loadTrendHistory();
        history.records.push(record);
        if (history.records.length > MAX_RECORDS) {
            history.records = history.records.slice(-MAX_RECORDS);
            logger.debug(`Trimmed history to last ${MAX_RECORDS} records`);
        }
        writeHistoryFile(history);
        return history;
    }
    catch (e) {
        logger.warn(`Failed to save trend history: ${e.message}`);
        return { ...emptyHistory(), records: [record] };
    }
}
export function getLastRecord() {
    const h = loadTrendHistory();
    return h.records.length > 0 ? h.records[h.records.length - 1] : null;
}
export function getAllRecords() {
    return loadTrendHistory().records;
}
export function getRecordsForDays(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return loadTrendHistory().records.filter(r => new Date(r.timestamp).getTime() >= cutoff);
}
export function getLastNRecords(n) {
    return loadTrendHistory().records.slice(-n);
}
export function clearTrendHistory() {
    deleteHistoryFile();
}
export function createHistoricalRecord(score, grade, componentScores) {
    return { timestamp: new Date().toISOString(), score, grade, componentScores };
}
