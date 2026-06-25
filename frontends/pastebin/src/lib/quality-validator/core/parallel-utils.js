import { logger } from '../utils/logger.js';
export function mergeResults(r1, r2) {
    return {
        category: r1.category,
        score: (r1.score + r2.score) / 2,
        status: r1.status === 'fail' || r2.status === 'fail'
            ? 'fail'
            : r1.status === 'warning' || r2.status === 'warning'
                ? 'warning'
                : 'pass',
        findings: [...r1.findings, ...r2.findings],
        metrics: { ...r1.metrics, ...r2.metrics },
        executionTime: r1.executionTime + r2.executionTime,
        errors: [...(r1.errors || []), ...(r2.errors || [])],
    };
}
export async function runBalanced(analyzers, files, maxConcurrent = 4, processWithAnalyzer) {
    const enabled = analyzers.filter(a => a.enabled);
    const results = new Array(analyzers.length);
    const analyzerIndexMap = new Map();
    for (let i = 0; i < analyzers.length; i++) {
        if (analyzers[i].enabled) {
            analyzerIndexMap.set(analyzers[i], i);
        }
    }
    logger.info(`Starting load-balanced analysis (max concurrent: ${maxConcurrent})`);
    const startTime = performance.now();
    for (let i = 0; i < enabled.length; i += maxConcurrent) {
        const batch = enabled.slice(i, i + maxConcurrent);
        await Promise.all(batch.map(async (analyzer) => {
            const result = await processWithAnalyzer(analyzer, files);
            const idx = analyzerIndexMap.get(analyzer);
            if (idx !== undefined)
                results[idx] = result;
        }));
    }
    const totalTime = performance.now() - startTime;
    return {
        results,
        totalTime,
        parallelEfficiency: 100,
        parallelRatio: enabled.length / maxConcurrent,
    };
}
export function estimateTime(fileCount, analyzerCount, workerCount) {
    const timePerFile = 0.1;
    const analyzerOverhead = 50;
    const serial = fileCount * timePerFile * analyzerCount + analyzerOverhead * analyzerCount;
    const parallel = fileCount * timePerFile +
        (analyzerOverhead * analyzerCount) / Math.min(analyzerCount, workerCount);
    return { estimated: parallel, serial, parallel };
}
export function getRecommendedWorkerCount() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const os = require('os');
        return Math.max(2, Math.min(4, os.cpus().length));
    }
    catch {
        return 4;
    }
}
