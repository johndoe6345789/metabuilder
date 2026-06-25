/**
 * Analysis Registry — tracks analysis results for trend analysis
 */
import { logger } from '../utils/logger.js';
import { calcAverageScore, calcScoreTrend, calcComponentTrends, calcStatistics, } from './registry-stats.js';
export class AnalysisRegistry {
    constructor(maxRecords = 50) {
        this.records = [];
        this.getAllRecords = () => [...this.records];
        this.getRecord = (id) => this.records.find(r => r.id === id);
        this.getAverageScore = () => calcAverageScore(this.records);
        this.getScoreTrend = () => calcScoreTrend(this.records);
        this.getComponentTrends = () => calcComponentTrends(this.records);
        this.getStatistics = () => calcStatistics(this.records);
        this.getRecordCount = () => this.records.length;
        this.export = () => JSON.stringify(this.records, null, 2);
        this.maxRecords = maxRecords;
        logger.debug(`AnalysisRegistry init: max=${maxRecords}`);
    }
    recordAnalysis(r) {
        const cs = r.componentScores;
        const rec = {
            timestamp: new Date().toISOString(),
            id: `analysis-${Date.now()}`,
            overall: {
                score: r.overall.score,
                grade: r.overall.grade,
                status: r.overall.status,
            },
            components: {
                codeQuality: cs.codeQuality.score,
                testCoverage: cs.testCoverage.score,
                architecture: cs.architecture.score,
                security: cs.security.score,
            },
            details: {
                findings: r.findings.length,
                executionTime: r.metadata.analysisTime,
            },
        };
        this.records.push(rec);
        if (this.records.length > this.maxRecords) {
            const rm = this.records.splice(0, this.records.length - this.maxRecords);
            logger.debug(`Removed ${rm.length} old records`);
        }
        logger.debug(`Recorded: ${rec.id}`, {
            score: rec.overall.score.toFixed(2),
            grade: rec.overall.grade,
        });
    }
    getRecentRecords(count = 10) {
        return this.records
            .slice(Math.max(0, this.records.length - count))
            .reverse();
    }
    getLastScores(count = 5) {
        return this.records
            .slice(Math.max(0, this.records.length - count))
            .map(r => r.overall.score);
    }
    clear() {
        const n = this.records.length;
        this.records = [];
        logger.debug(`Cleared ${n} records`);
    }
    import(json) {
        try {
            this.records = JSON.parse(json);
            logger.debug(`Imported ${this.records.length} records`);
        }
        catch (e) {
            logger.error('Failed to import records', {
                error: e.message,
            });
        }
    }
}
let globalRegistry = null;
export function getGlobalRegistry() {
    if (!globalRegistry)
        globalRegistry = new AnalysisRegistry();
    return globalRegistry;
}
export function resetGlobalRegistry() {
    globalRegistry = null;
    logger.debug('Global AnalysisRegistry reset');
}
