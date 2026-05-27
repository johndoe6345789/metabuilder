import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import {
  ensureDirectory,
  pathExists,
  readJsonFile,
  writeJsonFile,
} from './fileSystem.js';
import type { CacheEntry } from './cache-types.js';

export function loadCacheFromDisk(
  directory: string,
  memCache: Map<string, CacheEntry>
): void {
  try {
    if (!pathExists(directory)) return;
    const files = fs.readdirSync(directory);
    const now = Date.now();
    let loaded = 0, skipped = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const filePath = path.join(directory, file);
        const entry = readJsonFile<CacheEntry>(filePath);
        if (entry.expiresAt > now) {
          memCache.set(entry.key, entry);
          loaded++;
        } else {
          skipped++;
        }
      } catch {
        // skip malformed files
      }
    }
    logger.debug(`Cache loaded: ${loaded} entries (${skipped} expired)`);
  } catch (err) {
    logger.warn('Failed to load persisted cache', {
      error: (err as Error).message,
    });
  }
}

export function writeCacheToDisk(
  directory: string,
  key: string,
  entry: CacheEntry
): void {
  const cacheFilePath = path.join(directory, `${key}.json`);
  writeJsonFile(cacheFilePath, entry);
}

export function deleteCacheFile(directory: string, key: string): void {
  const filePath = path.join(directory, `${key}.json`);
  if (pathExists(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function cleanExpiredDiskEntries(directory: string): number {
  let removed = 0;
  if (!pathExists(directory)) return removed;
  const now = Date.now();
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    try {
      const entry = readJsonFile<CacheEntry>(filePath);
      if (entry.expiresAt <= now) {
        fs.unlinkSync(filePath);
        removed++;
      }
    } catch {
      // skip malformed files
    }
  }
  return removed;
}

export function clearCacheDirectory(directory: string): void {
  if (pathExists(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
    ensureDirectory(directory);
  }
}

export function calcDiskSize(
  directory: string
): { size: number; files: number } {
  let size = 0, files = 0;
  if (!pathExists(directory)) return { size, files };
  const list = fs.readdirSync(directory);
  files = list.filter((f) => f.endsWith('.json')).length;
  for (const file of list) {
    const stat = fs.statSync(path.join(directory, file));
    size += stat.size;
  }
  return { size, files };
}
