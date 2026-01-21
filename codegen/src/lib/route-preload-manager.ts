import { getEnabledPages } from '@/config/page-loader'
import { preloadComponentByName, ComponentName } from '@/lib/component-registry'
import { FeatureToggles } from '@/types/project'
import { preloadLibrary } from '@/lib/library-loader'

interface PreloadStrategy {
  preloadAdjacent: boolean
  preloadPopular: boolean
  maxConcurrentPreloads: number
}

const DEFAULT_STRATEGY: PreloadStrategy = {
  preloadAdjacent: true,
  preloadPopular: true,
  maxConcurrentPreloads: 3,
}

const popularRoutes = new Set(['dashboard', 'editor', 'models', 'components'])

const preloadQueue: Array<() => void> = []
let activePreloads = 0

function processPreloadQueue(strategy: PreloadStrategy) {
  while (activePreloads < strategy.maxConcurrentPreloads && preloadQueue.length > 0) {
    const preload = preloadQueue.shift()
    if (preload) {
      activePreloads++
      preload()
      setTimeout(() => {
        activePreloads--
        processPreloadQueue(strategy)
      }, 100)
    }
  }
}

export class RoutePreloadManager {
  private strategy: PreloadStrategy
  private preloadedRoutes = new Set<string>()
  private currentRoute: string | null = null
  private featureToggles: FeatureToggles | null = null

  constructor(strategy: Partial<PreloadStrategy> = {}) {
    this.strategy = { ...DEFAULT_STRATEGY, ...strategy }
    console.log('[PRELOAD_MGR] 🎯 RoutePreloadManager initialized with strategy:', this.strategy)
  }

  setFeatureToggles(featureToggles: FeatureToggles) {
    this.featureToggles = featureToggles
    console.log('[PRELOAD_MGR] ⚙️ Feature toggles set')
  }

  setCurrentRoute(route: string) {
    console.log(`[PRELOAD_MGR] 📍 Current route changed: ${this.currentRoute} → ${route}`)
    this.currentRoute = route

    if (this.strategy.preloadAdjacent) {
      this.preloadAdjacentRoutes(route)
    }
  }

  preloadRoute(pageId: string, priority: 'high' | 'low' = 'low') {
    if (this.preloadedRoutes.has(pageId)) {
      console.log(`[PRELOAD_MGR] ✅ Route ${pageId} already preloaded`)
      return
    }

    console.log(`[PRELOAD_MGR] 🎯 Queuing preload for route: ${pageId} (priority: ${priority})`)

    const preloadFn = () => {
      if (this.preloadedRoutes.has(pageId)) return

      const pages = getEnabledPages(this.featureToggles || undefined)
      const page = pages.find(p => p.id === pageId)

      if (!page) {
        console.warn(`[PRELOAD_MGR] ⚠️ Page not found: ${pageId}`)
        return
      }

      if (page.type === 'json' || page.schemaPath) {
        console.log(`[PRELOAD_MGR] 🧾 Skipping preload for JSON page: ${pageId}`)
        this.preloadedRoutes.add(pageId)
        return
      }

      try {
        const componentName = page.component as ComponentName
        console.log(`[PRELOAD_MGR] 🚀 Preloading ${pageId} → ${componentName}`)
        preloadComponentByName(componentName)

        if (page.requiresResizable && page.resizableConfig) {
          const leftComponentName = page.resizableConfig.leftComponent as ComponentName
          console.log(`[PRELOAD_MGR] 🚀 Preloading left panel: ${leftComponentName}`)
          preloadComponentByName(leftComponentName)
        }

        this.preloadedRoutes.add(pageId)
        console.log(`[PRELOAD_MGR] ✅ Route ${pageId} preloaded`)
      } catch (error) {
        console.error(`[PRELOAD_MGR] ❌ Failed to preload ${pageId}:`, error)
      }
    }

    if (priority === 'high') {
      preloadQueue.unshift(preloadFn)
    } else {
      preloadQueue.push(preloadFn)
    }

    processPreloadQueue(this.strategy)
  }

  preloadAdjacentRoutes(currentRoute: string) {
    if (!this.featureToggles) {
      console.warn('[PRELOAD_MGR] ⚠️ Cannot preload adjacent routes: feature toggles not set')
      return
    }

    const pages = getEnabledPages(this.featureToggles)
    const currentIndex = pages.findIndex(p => p.id === currentRoute)

    if (currentIndex === -1) {
      console.warn(`[PRELOAD_MGR] ⚠️ Current route not found in enabled pages: ${currentRoute}`)
      return
    }

    console.log(`[PRELOAD_MGR] 🔄 Preloading adjacent routes to ${currentRoute}`)

    if (currentIndex > 0) {
      const prevPage = pages[currentIndex - 1]
      console.log(`[PRELOAD_MGR] ← Preloading previous route: ${prevPage.id}`)
      this.preloadRoute(prevPage.id, 'low')
    }

    if (currentIndex < pages.length - 1) {
      const nextPage = pages[currentIndex + 1]
      console.log(`[PRELOAD_MGR] → Preloading next route: ${nextPage.id}`)
      this.preloadRoute(nextPage.id, 'low')
    }
  }

  preloadPopularRoutes() {
    if (!this.strategy.preloadPopular) {
      console.log('[PRELOAD_MGR] ⏭️ Popular route preloading disabled')
      return
    }

    console.log('[PRELOAD_MGR] ⭐ Preloading popular routes')
    
    popularRoutes.forEach(route => {
      if (!this.preloadedRoutes.has(route)) {
        this.preloadRoute(route, 'low')
      }
    })
  }

  preloadLibraries(libraries: Array<'recharts' | 'd3' | 'three' | 'reactflow'>) {
    console.log('[PRELOAD_MGR] 📚 Preloading libraries:', libraries)
    libraries.forEach(lib => {
      preloadLibrary(lib)
    })
  }

  isPreloaded(pageId: string): boolean {
    return this.preloadedRoutes.has(pageId)
  }

  reset() {
    console.log('[PRELOAD_MGR] 🔄 Resetting preload manager')
    this.preloadedRoutes.clear()
    this.currentRoute = null
    preloadQueue.length = 0
    activePreloads = 0
  }

  getStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      queuedCount: preloadQueue.length,
      activePreloads,
      currentRoute: this.currentRoute,
    }
  }
}

export const routePreloadManager = new RoutePreloadManager()
