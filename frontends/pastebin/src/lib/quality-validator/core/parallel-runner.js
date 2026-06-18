/**
 * Chunked and balanced parallel execution helpers
 */
import { logger } from '../utils/logger.js';
import { mergeResults, runBalanced } from './parallel-utils.js';
export async function runChunkedAnalysis(analyzer, files, chunkSize, progressCallback, processFn) {
    if (!analyzer.enabled)
        return null;
    const chunks = [];
    for (let i = 0; i < files.length; i += chunkSize) {
        chunks.push(files.slice(i, i + chunkSize));
    }
    logger.debug(`Processing ${files.length} files in ${chunks.length} chunks`);
    let accumulated = null;
    for (let i = 0; i < chunks.length; i++) {
        if (progressCallback) {
            progressCallback(i + 1, chunks.length, analyzer.name);
        }
        const result = await processFn(analyzer, chunks[i]);
        if (result) {
            accumulated = accumulated ? mergeResults(accumulated, result) : result;
        }
    }
    return accumulated;
}
export async function runBalancedAnalysis(analyzers, files, maxConcurrent, processFn) {
    return runBalanced(analyzers, files, maxConcurrent, processFn);
}
