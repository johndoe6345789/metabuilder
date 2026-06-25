import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import { ensureDirectory, pathExists, readJsonFile, writeJsonFile, } from './fileSystem.js';
export function loadCacheFromDisk(directory, memCache) {
    try {
        if (!pathExists(directory))
            return;
        const files = fs.readdirSync(directory);
        const now = Date.now();
        let loaded = 0, skipped = 0;
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            try {
                const filePath = path.join(directory, file);
                const entry = readJsonFile(filePath);
                if (entry.expiresAt > now) {
                    memCache.set(entry.key, entry);
                    loaded++;
                }
                else {
                    skipped++;
                }
            }
            catch {
                // skip malformed files
            }
        }
        logger.debug(`Cache loaded: ${loaded} entries (${skipped} expired)`);
    }
    catch (err) {
        logger.warn('Failed to load persisted cache', {
            error: err.message,
        });
    }
}
export function writeCacheToDisk(directory, key, entry) {
    const cacheFilePath = path.join(directory, `${key}.json`);
    writeJsonFile(cacheFilePath, entry);
}
export function deleteCacheFile(directory, key) {
    const filePath = path.join(directory, `${key}.json`);
    if (pathExists(filePath)) {
        fs.unlinkSync(filePath);
    }
}
export function cleanExpiredDiskEntries(directory) {
    let removed = 0;
    if (!pathExists(directory))
        return removed;
    const now = Date.now();
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        try {
            const entry = readJsonFile(filePath);
            if (entry.expiresAt <= now) {
                fs.unlinkSync(filePath);
                removed++;
            }
        }
        catch {
            // skip malformed files
        }
    }
    return removed;
}
export function clearCacheDirectory(directory) {
    if (pathExists(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
        ensureDirectory(directory);
    }
}
export function calcDiskSize(directory) {
    let size = 0, files = 0;
    if (!pathExists(directory))
        return { size, files };
    const list = fs.readdirSync(directory);
    files = list.filter(f => f.endsWith('.json')).length;
    for (const file of list) {
        const stat = fs.statSync(path.join(directory, file));
        size += stat.size;
    }
    return { size, files };
}
