/**
 * Parallel Analyzer for Quality Validator
 */
import { logger } from '../utils/logger.js';
import { estimateTime, getRecommendedWorkerCount } from './parallel-utils.js';
import { runChunkedAnalysis, runBalancedAnalysis } from './parallel-runner.js';
export class ParallelAnalyzer {
    constructor(o = {}) {
        this.workerCount = o.workerCount || 4;
        this.fileChunkSize = o.fileChunkSize || 50;
        this.progressCallback = o.onProgress;
    }
    async processWithAnalyzer(a, files) {
        if (!a.enabled) {
            logger.debug(`Disabled: ${a.name}`);
            return null;
        }
        try {
            const t = performance.now();
            logger.debug(`Start: ${a.name}`);
            const r = await a.analyze(files);
            logger.debug(`Done: ${a.name} (${(performance.now() - t).toFixed(2)}ms)`);
            return r;
        }
        catch (e) {
            logger.error(`Failed: ${a.name}`, { error: e.message });
            throw e;
        }
    }
    async runParallel(analyzers, files) {
        const t0 = performance.now();
        const enabled = analyzers.filter(a => a.enabled);
        if (!enabled.length) {
            logger.warn('No analyzers enabled');
            return {
                results: analyzers.map(() => null),
                totalTime: 0,
                parallelEfficiency: 0,
                parallelRatio: 0,
            };
        }
        logger.info(`Parallel: ${enabled.length} analyzers, ${files.length} files`);
        const res = await Promise.all(enabled.map(a => this.processWithAnalyzer(a, files).catch(e => {
            logger.error(`Error: ${a.name}`, { error: e.message });
            return null;
        })));
        const totalTime = performance.now() - t0;
        const all = new Array(analyzers.length);
        let ri = 0;
        for (let i = 0; i < analyzers.length; i++) {
            all[i] = analyzers[i].enabled ? res[ri++] : null;
        }
        logger.info(`Done: ${totalTime.toFixed(2)}ms`);
        return {
            results: all,
            totalTime,
            parallelEfficiency: 100,
            parallelRatio: 1,
        };
    }
    async runChunked(a, files) {
        return runChunkedAnalysis(a, files, this.fileChunkSize, this.progressCallback, this.processWithAnalyzer.bind(this));
    }
    async runBalanced(analyzers, files, max = 4) {
        return runBalancedAnalysis(analyzers, files, max, this.processWithAnalyzer.bind(this));
    }
    estimateTime(fc, ac) {
        return estimateTime(fc, ac, this.workerCount);
    }
}
ParallelAnalyzer.getRecommendedWorkerCount = () => getRecommendedWorkerCount();
export async function executeAnalyzersParallel(analyzers, files, o = {}) {
    return (await new ParallelAnalyzer({
        workerCount: o.workerCount || 4,
        onProgress: o.onProgress,
    }).runParallel(analyzers, files)).results;
}
export const parallelAnalyzer = new ParallelAnalyzer();
