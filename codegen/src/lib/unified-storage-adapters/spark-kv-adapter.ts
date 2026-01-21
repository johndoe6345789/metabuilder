import type { StorageAdapter } from './types'

export class SparkKVAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | undefined> {
    if (!window.spark?.kv) throw new Error('Spark KV not available')
    return await window.spark.kv.get<T>(key)
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!window.spark?.kv) throw new Error('Spark KV not available')
    await window.spark.kv.set(key, value)
  }

  async delete(key: string): Promise<void> {
    if (!window.spark?.kv) throw new Error('Spark KV not available')
    await window.spark.kv.delete(key)
  }

  async keys(): Promise<string[]> {
    if (!window.spark?.kv) throw new Error('Spark KV not available')
    return await window.spark.kv.keys()
  }

  async clear(): Promise<void> {
    if (!window.spark?.kv) throw new Error('Spark KV not available')
    const allKeys = await window.spark.kv.keys()
    await Promise.all(allKeys.map(key => window.spark.kv.delete(key)))
  }
}
