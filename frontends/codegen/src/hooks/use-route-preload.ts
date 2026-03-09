import { useCallback, useRef } from 'react'
import { ComponentRegistry, preloadComponentByName, ComponentName } from '@/lib/component-registry'
import { getPageById } from '@/config/page-loader'

interface PreloadOptions {
  delay?: number
}

const preloadCache = new Set<string>()
const preloadTimers = new Map<string, NodeJS.Timeout>()

export function useRoutePreload(options: PreloadOptions = {}) {
  const { delay = 100 } = options
  const isPreloadingRef = useRef(false)

  const preloadRoute = useCallback((pageId: string) => {
    if (preloadCache.has(pageId)) {
      console.log(`[PRELOAD] ✅ Route ${pageId} already preloaded`)
      return
    }

    if (isPreloadingRef.current) {
      console.log(`[PRELOAD] ⏳ Preload already in progress for ${pageId}`)
      return
    }

    const existingTimer = preloadTimers.get(pageId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      console.log(`[PRELOAD] 🚀 Initiating preload for route: ${pageId}`)
      isPreloadingRef.current = true
      
      const pageConfig = getPageById(pageId)
      
      if (!pageConfig) {
        console.warn(`[PRELOAD] ⚠️ Page config not found for: ${pageId}`)
        isPreloadingRef.current = false
        return
      }

      const componentName = pageConfig.component as ComponentName
      
      if (!ComponentRegistry[componentName]) {
        console.warn(`[PRELOAD] ⚠️ Component not found in registry: ${componentName}`)
        isPreloadingRef.current = false
        return
      }

      try {
        preloadComponentByName(componentName)
        
        if (pageConfig.requiresResizable && pageConfig.resizableConfig) {
          const leftComponentName = pageConfig.resizableConfig.leftComponent as ComponentName
          if (ComponentRegistry[leftComponentName]) {
            console.log(`[PRELOAD] 🎯 Preloading left panel component: ${leftComponentName}`)
            preloadComponentByName(leftComponentName)
          }
        }
        
        preloadCache.add(pageId)
        console.log(`[PRELOAD] ✅ Route ${pageId} preload initiated`)
      } catch (error) {
        console.error(`[PRELOAD] ❌ Failed to preload route ${pageId}:`, error)
      } finally {
        isPreloadingRef.current = false
        preloadTimers.delete(pageId)
      }
    }, delay)

    preloadTimers.set(pageId, timer)
  }, [delay])

  const cancelPreload = useCallback((pageId: string) => {
    const timer = preloadTimers.get(pageId)
    if (timer) {
      console.log(`[PRELOAD] ❌ Cancelling preload for: ${pageId}`)
      clearTimeout(timer)
      preloadTimers.delete(pageId)
    }
  }, [])

  const clearAllPreloads = useCallback(() => {
    console.log('[PRELOAD] 🧹 Clearing all pending preloads')
    preloadTimers.forEach(timer => clearTimeout(timer))
    preloadTimers.clear()
  }, [])

  const isPreloaded = useCallback((pageId: string) => {
    return preloadCache.has(pageId)
  }, [])

  return {
    preloadRoute,
    cancelPreload,
    clearAllPreloads,
    isPreloaded,
  }
}

export function clearPreloadCache() {
  console.log('[PRELOAD] 🔄 Clearing preload cache')
  preloadCache.clear()
  preloadTimers.forEach(timer => clearTimeout(timer))
  preloadTimers.clear()
}
