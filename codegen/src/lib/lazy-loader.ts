import { lazy, ComponentType } from 'react'

const LOAD_TIMEOUT = 10000

interface LazyLoadOptions {
  timeout?: number
  retries?: number
  fallback?: ComponentType
}

export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { timeout = LOAD_TIMEOUT, retries = 3 } = options

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0

      const attemptLoad = async () => {
        attempts++
        console.log(`[LAZY] 🔄 Loading component (attempt ${attempts}/${retries})`)

        const timeoutId = setTimeout(() => {
          console.warn(`[LAZY] ⏰ Load timeout after ${timeout}ms`)
          reject(new Error(`Component load timeout after ${timeout}ms`))
        }, timeout)

        try {
          const component = await componentImport()
          clearTimeout(timeoutId)
          console.log('[LAZY] ✅ Component loaded successfully')
          resolve(component)
        } catch (error) {
          clearTimeout(timeoutId)
          console.error(`[LAZY] ❌ Load failed (attempt ${attempts}):`, error)

          if (attempts < retries) {
            console.log(`[LAZY] 🔁 Retrying in ${attempts * 1000}ms...`)
            setTimeout(attemptLoad, attempts * 1000)
          } else {
            console.error('[LAZY] ❌ All retry attempts exhausted')
            reject(error)
          }
        }
      }

      attemptLoad()
    })
  })
}

export function preloadComponent(
  componentImport: () => Promise<{ default: ComponentType<any> }>
): void {
  console.log('[LAZY] 🚀 Preloading component')
  componentImport()
    .then(() => console.log('[LAZY] ✅ Component preloaded'))
    .catch(err => console.warn('[LAZY] ⚠️ Preload failed:', err))
}

const preloadCache = new Map<string, Promise<any>>()

export function lazyWithPreload<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  preloadKey: string
): React.LazyExoticComponent<T> & { preload: () => void } {
  const LazyComponent = lazy(componentImport)

  const preload = () => {
    if (!preloadCache.has(preloadKey)) {
      console.log(`[LAZY] 🎯 Preloading ${preloadKey}`)
      const preloadPromise = componentImport()
      preloadCache.set(preloadKey, preloadPromise)
      preloadPromise
        .then(() => console.log(`[LAZY] ✅ ${preloadKey} preloaded`))
        .catch(err => {
          console.warn(`[LAZY] ⚠️ ${preloadKey} preload failed:`, err)
          preloadCache.delete(preloadKey)
        })
    }
  }

  return Object.assign(LazyComponent, { preload })
}

export function createComponentLoader() {
  const loadedComponents = new Set<string>()
  const loadingComponents = new Map<string, Promise<any>>()

  return {
    load: async <T extends ComponentType<any>>(
      key: string,
      componentImport: () => Promise<{ default: T }>
    ): Promise<{ default: T }> => {
      console.log(`[LOADER] 📦 Loading component: ${key}`)

      if (loadedComponents.has(key)) {
        console.log(`[LOADER] ✅ Component ${key} already loaded`)
        return componentImport()
      }

      if (loadingComponents.has(key)) {
        console.log(`[LOADER] ⏳ Component ${key} already loading`)
        return loadingComponents.get(key)!
      }

      const loadPromise = componentImport()
        .then(component => {
          console.log(`[LOADER] ✅ Component ${key} loaded`)
          loadedComponents.add(key)
          loadingComponents.delete(key)
          return component
        })
        .catch(error => {
          console.error(`[LOADER] ❌ Component ${key} failed:`, error)
          loadingComponents.delete(key)
          throw error
        })

      loadingComponents.set(key, loadPromise)
      return loadPromise
    },

    isLoaded: (key: string): boolean => loadedComponents.has(key),
    
    isLoading: (key: string): boolean => loadingComponents.has(key),
    
    reset: () => {
      console.log('[LOADER] 🔄 Resetting component loader')
      loadedComponents.clear()
      loadingComponents.clear()
    },
  }
}
