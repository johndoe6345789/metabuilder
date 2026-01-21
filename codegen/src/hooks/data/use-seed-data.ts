/// <reference path="../global.d.ts" />

import { useCallback, useState } from 'react'
import seedDataConfig from '@/config/seed-data.json'

export function useSeedData() {
  console.log('[SEED] 🌱 useSeedData hook initializing')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadSeedData = useCallback(async () => {
    console.log('[SEED] 🔍 loadSeedData called - isLoading:', isLoading, 'isLoaded:', isLoaded)
    
    if (isLoading || isLoaded) {
      console.log('[SEED] ⏭️ Skipping seed data load (already loading or loaded)')
      return
    }

    console.log('[SEED] 🚀 Starting seed data load')
    setIsLoading(true)
    console.time('[SEED] Seed data load duration')
    
    try {
      console.log('[SEED] 🔌 Checking Spark KV availability')
      if (!window.spark?.kv) {
        console.warn('[SEED] ⚠️ Spark KV not available, skipping seed data')
        return
      }
      console.log('[SEED] ✅ Spark KV is available')

      console.log('[SEED] 📋 Fetching existing keys from KV store')
      const keys = await window.spark.kv.keys()
      console.log('[SEED] 📊 Found', keys.length, 'existing keys:', keys)
      
      console.log('[SEED] 📦 Seed data config entries:', Object.keys(seedDataConfig).length)
      let seededCount = 0
      let skippedCount = 0
      
      for (const [key, value] of Object.entries(seedDataConfig)) {
        if (!keys.includes(key)) {
          console.log('[SEED] ➕ Seeding key:', key)
          await window.spark.kv.set(key, value)
          seededCount++
        } else {
          console.log('[SEED] ⏭️ Skipping existing key:', key)
          skippedCount++
        }
      }
      
      console.log('[SEED] ✅ Seed data load complete - seeded:', seededCount, 'skipped:', skippedCount)
      setIsLoaded(true)
    } catch (error) {
      console.error('[SEED] ❌ Failed to load seed data:', error)
      setIsLoaded(true)
    } finally {
      setIsLoading(false)
      console.timeEnd('[SEED] Seed data load duration')
    }
  }, [isLoading, isLoaded])

  const resetSeedData = useCallback(async () => {
    console.log('[SEED] 🔄 Resetting seed data')
    setIsLoading(true)
    try {
      if (!window.spark?.kv) {
        console.warn('[SEED] ⚠️ Spark KV not available')
        return
      }

      console.log('[SEED] 🔄 Overwriting all seed data keys')
      for (const [key, value] of Object.entries(seedDataConfig)) {
        console.log('[SEED] 📝 Setting key:', key)
        await window.spark.kv.set(key, value)
      }
      console.log('[SEED] ✅ Seed data reset complete')
      setIsLoaded(true)
    } catch (error) {
      console.error('[SEED] ❌ Failed to reset seed data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearAllData = useCallback(async () => {
    console.log('[SEED] 🗑️ Clearing all data')
    setIsLoading(true)
    try {
      if (!window.spark?.kv) {
        console.warn('[SEED] ⚠️ Spark KV not available')
        return
      }

      const keys = await window.spark.kv.keys()
      console.log('[SEED] 📋 Deleting', keys.length, 'keys')
      for (const key of keys) {
        console.log('[SEED] 🗑️ Deleting key:', key)
        await window.spark.kv.delete(key)
      }
      console.log('[SEED] ✅ All data cleared')
      setIsLoaded(false)
    } catch (error) {
      console.error('[SEED] ❌ Failed to clear data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  console.log('[SEED] 📤 Returning seed data hook methods')
  return {
    isLoaded,
    isLoading,
    loadSeedData,
    resetSeedData,
    clearAllData,
  }
}
