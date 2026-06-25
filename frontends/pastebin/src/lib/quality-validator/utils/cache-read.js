import * as path from 'path';
import { performance } from 'perf_hooks';
import { logger } from './logger.js';
import { pathExists, readJsonFile, readFile } from './fileSystem.js';
import * as crypto from 'crypto';
export function cacheHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}
export function cacheKey(filePath, category) {
    const base = path.normalize(filePath).replace(/\//g, '__');
    return category ? `${category}__${base}` : base;
}
export function isValid(entry) {
    return entry.expiresAt > Date.now();
}
export function cacheGet(config, mem, stats, retrievalTimes, filePath, category) {
    if (!config.enabled)
        return null;
    const start = performance.now();
    const k = cacheKey(filePath, category);
    try {
        const memEntry = mem.get(k);
        if (memEntry) {
            if (isValid(memEntry)) {
                stats.hits++;
                recordTime(stats, retrievalTimes, performance.now() - start);
                return JSON.parse(memEntry.content);
            }
            mem.delete(k);
        }
        const diskPath = path.join(config.directory, `${k}.json`);
        if (pathExists(diskPath)) {
            const entry = readJsonFile(diskPath);
            if (isValid(entry)) {
                mem.set(k, entry);
                stats.hits++;
                recordTime(stats, retrievalTimes, performance.now() - start);
                return JSON.parse(entry.content);
            }
        }
        stats.misses++;
        return null;
    }
    catch (err) {
        logger.warn(`Cache get failed for ${k}`, {
            error: err.message,
        });
        stats.misses++;
        return null;
    }
}
export function cacheHasChanged(config, mem, filePath, category) {
    if (!config.enabled)
        return true;
    try {
        const k = cacheKey(filePath, category);
        const currentHash = cacheHash(readFile(filePath));
        const memEntry = mem.get(k);
        if (memEntry && isValid(memEntry)) {
            return memEntry.hash !== currentHash;
        }
        const diskPath = path.join(config.directory, `${k}.json`);
        if (pathExists(diskPath)) {
            const cached = readJsonFile(diskPath);
            if (isValid(cached))
                return cached.hash !== currentHash;
        }
        return true;
    }
    catch {
        return true;
    }
}
function recordTime(stats, times, ms) {
    times.push(ms);
    if (times.length > 1000)
        times.splice(0, times.length - 500);
    const total = stats.hits + stats.misses;
    stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
    if (times.length > 0)
        stats.avgRetrievalTime = times.reduce((a, b) => a + b, 0) / times.length;
}
