import { Middleware } from '@reduxjs/toolkit'
import { saveDB } from '@/lib/db'
import { getPersistenceConfig } from './persistenceConfig'

let persistenceQueue: Promise<void> = Promise.resolve()
let pendingSync = false
let retryCount = 0

async function saveWithRetry(): Promise<void> {
  const config = getPersistenceConfig()
  
  try {
    await saveDB()
    
    if (config.logging) {
      console.log('[Redux Persistence] State synced to database')
    }
    
    retryCount = 0
  } catch (error) {
    if (config.logging) {
      console.error('[Redux Persistence] Error syncing to database:', error)
    }
    
    if (config.retryOnFailure && retryCount < config.maxRetries) {
      retryCount++
      
      if (config.logging) {
        console.warn(`[Redux Persistence] Retrying save (${retryCount}/${config.maxRetries})...`)
      }
      
      await new Promise(resolve => setTimeout(resolve, config.retryDelayMs))
      await saveWithRetry()
    } else {
      retryCount = 0
      throw error
    }
  }
}

export const persistenceMiddleware: Middleware = () => (next) => (action: unknown) => {
  const result = next(action)

  if (typeof action !== 'object' || !action || !('type' in action)) {
    return result
  }

  const config = getPersistenceConfig()
  
  if (!config.enabled) {
    return result
  }

  const actionType = (action as { type: string }).type

  if (config.actions.includes(actionType)) {
    if (!pendingSync) {
      pendingSync = true
      
      persistenceQueue = persistenceQueue.then(async () => {
        try {
          if (config.debounceMs > 0) {
            await new Promise(resolve => setTimeout(resolve, config.debounceMs))
          }
          
          await saveWithRetry()
        } catch (error) {
          if (config.logging) {
            console.error('[Redux Persistence] Failed to save after retries:', error)
          }
        } finally {
          pendingSync = false
        }
      })
    }
  }

  return result
}

