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

        const timeoutId = setTimeout(() => {
          reject(new Error(`Component load timeout after ${timeout}ms`))
        }, timeout)

        try {
          const component = await componentImport()
          clearTimeout(timeoutId)
          resolve(component)
        } catch (error) {
          clearTimeout(timeoutId)

          if (attempts < retries) {
            setTimeout(attemptLoad, attempts * 1000)
          } else {
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
  componentImport().catch(() => {})
}

const preloadCache = new Map<string, Promise<any>>()

export function lazyWithPreload<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  preloadKey: string
): React.LazyExoticComponent<T> & { preload: () => void } {
  const LazyComponent = lazy(componentImport)

  const preload = () => {
    if (!preloadCache.has(preloadKey)) {
      const preloadPromise = componentImport()
      preloadCache.set(preloadKey, preloadPromise)
      preloadPromise.catch(() => {
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
      if (loadedComponents.has(key)) {
        return componentImport()
      }

      if (loadingComponents.has(key)) {
        return loadingComponents.get(key)!
      }

      const loadPromise = componentImport()
        .then(component => {
          loadedComponents.add(key)
          loadingComponents.delete(key)
          return component
        })
        .catch(error => {
          loadingComponents.delete(key)
          throw error
        })

      loadingComponents.set(key, loadPromise)
      return loadPromise
    },

    isLoaded: (key: string): boolean => loadedComponents.has(key),

    isLoading: (key: string): boolean => loadingComponents.has(key),

    reset: () => {
      loadedComponents.clear()
      loadingComponents.clear()
    },
  }
}
