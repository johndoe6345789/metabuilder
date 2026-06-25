import * as path from 'path'
import { performance } from 'perf_hooks'
import { logger } from './logger.js'
import { pathExists, readJsonFile, readFile } from './fileSystem.js'
import type { CacheEntry, CacheConfig, CacheStats } from './cache-types.js'
import * as crypto from 'crypto'

export function cacheHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export function cacheKey(filePath: string, category?: string): string {
  const base = path.normalize(filePath).replace(/\//g, '__')
  return category ? `${category}__${base}` : base
}

export function isValid(entry: CacheEntry): boolean {
  return entry.expiresAt > Date.now()
}

export function cacheGet<T>(
  config: CacheConfig,
  mem: Map<string, CacheEntry>,
  stats: CacheStats,
  retrievalTimes: number[],
  filePath: string,
  category?: string,
): T | null {
  if (!config.enabled) return null
  const start = performance.now()
  const k = cacheKey(filePath, category)
  try {
    const memEntry = mem.get(k)
    if (memEntry) {
      if (isValid(memEntry)) {
        stats.hits++
        recordTime(stats, retrievalTimes, performance.now() - start)
        return JSON.parse(memEntry.content) as T
      }
      mem.delete(k)
    }

    const diskPath = path.join(config.directory, `${k}.json`)
    if (pathExists(diskPath)) {
      const entry = readJsonFile<CacheEntry>(diskPath)
      if (isValid(entry)) {
        mem.set(k, entry)
        stats.hits++
        recordTime(stats, retrievalTimes, performance.now() - start)
        return JSON.parse(entry.content) as T
      }
    }

    stats.misses++
    return null
  } catch (err) {
    logger.warn(`Cache get failed for ${k}`, {
      error: (err as Error).message,
    })
    stats.misses++
    return null
  }
}

export function cacheHasChanged(
  config: CacheConfig,
  mem: Map<string, CacheEntry>,
  filePath: string,
  category?: string,
): boolean {
  if (!config.enabled) return true
  try {
    const k = cacheKey(filePath, category)
    const currentHash = cacheHash(readFile(filePath))
    const memEntry = mem.get(k)
    if (memEntry && isValid(memEntry)) {
      return memEntry.hash !== currentHash
    }
    const diskPath = path.join(config.directory, `${k}.json`)
    if (pathExists(diskPath)) {
      const cached = readJsonFile<CacheEntry>(diskPath)
      if (isValid(cached)) return cached.hash !== currentHash
    }
    return true
  } catch {
    return true
  }
}

function recordTime(stats: CacheStats, times: number[], ms: number): void {
  times.push(ms)
  if (times.length > 1000) times.splice(0, times.length - 500)
  const total = stats.hits + stats.misses
  stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0
  if (times.length > 0)
    stats.avgRetrievalTime = times.reduce((a, b) => a + b, 0) / times.length
}
