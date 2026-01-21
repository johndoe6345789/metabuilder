export interface BundleMetrics {
  totalSize: number
  gzipSize: number
  chunkCount: number
  chunks: ChunkInfo[]
}

export interface ChunkInfo {
  name: string
  size: number
  isLazy: boolean
  dependencies: string[]
}

const STORAGE_KEY = 'bundle-metrics'

export function trackBundleLoad(chunkName: string, size: number) {
  if (typeof window === 'undefined') return
  
  const metrics = getBundleMetrics()
  const existingChunk = metrics.chunks.find(c => c.name === chunkName)
  
  if (!existingChunk) {
    metrics.chunks.push({
      name: chunkName,
      size,
      isLazy: true,
      dependencies: []
    })
    metrics.chunkCount = metrics.chunks.length
    metrics.totalSize = metrics.chunks.reduce((sum, c) => sum + c.size, 0)
    
    saveBundleMetrics(metrics)
    console.log(`[BUNDLE] 📦 Chunk loaded: ${chunkName} (${formatSize(size)})`)
    console.log(`[BUNDLE] 📊 Total: ${metrics.chunkCount} chunks, ${formatSize(metrics.totalSize)}`)
  }
}

export function getBundleMetrics(): BundleMetrics {
  if (typeof window === 'undefined') {
    return {
      totalSize: 0,
      gzipSize: 0,
      chunkCount: 0,
      chunks: []
    }
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[BUNDLE] ⚠️ Failed to load metrics:', error)
  }
  
  return {
    totalSize: 0,
    gzipSize: 0,
    chunkCount: 0,
    chunks: []
  }
}

function saveBundleMetrics(metrics: BundleMetrics) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
  } catch (error) {
    console.warn('[BUNDLE] ⚠️ Failed to save metrics:', error)
  }
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function analyzePerformance() {
  if (typeof window === 'undefined' || !window.performance) {
    console.warn('[BUNDLE] ⚠️ Performance API not available')
    return null
  }
  
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  if (!navigation) {
    console.warn('[BUNDLE] ⚠️ Navigation performance entry not available')
  }
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const jsResources = resources.filter(r => r.name.endsWith('.js'))
  const cssResources = resources.filter(r => r.name.endsWith('.css'))
  
  const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
  const totalCssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
  
  const analysis = {
    domContentLoaded: navigation
      ? navigation.domContentLoadedEventEnd - navigation.fetchStart
      : NaN,
    loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : NaN,
    ttfb: navigation ? navigation.responseStart - navigation.fetchStart : NaN,
    resources: {
      js: {
        count: jsResources.length,
        size: totalJsSize,
        formatted: formatSize(totalJsSize)
      },
      css: {
        count: cssResources.length,
        size: totalCssSize,
        formatted: formatSize(totalCssSize)
      },
      total: {
        count: resources.length,
        size: totalJsSize + totalCssSize,
        formatted: formatSize(totalJsSize + totalCssSize)
      }
    }
  }
  
  console.group('[BUNDLE] 📊 Performance Analysis')
  console.log('Time to First Byte:', `${analysis.ttfb.toFixed(2)}ms`)
  console.log('DOM Content Loaded:', `${analysis.domContentLoaded.toFixed(2)}ms`)
  console.log('Load Complete:', `${analysis.loadComplete.toFixed(2)}ms`)
  console.log('JavaScript:', `${analysis.resources.js.count} files, ${analysis.resources.js.formatted}`)
  console.log('CSS:', `${analysis.resources.css.count} files, ${analysis.resources.css.formatted}`)
  console.log('Total Resources:', `${analysis.resources.total.count} files, ${analysis.resources.total.formatted}`)
  console.groupEnd()
  
  return analysis
}

export function startPerformanceMonitoring() {
  if (typeof window === 'undefined') return
  
  console.log('[BUNDLE] 🔍 Starting performance monitoring')
  
  if ('PerformanceObserver' in window) {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          if (resource.name.endsWith('.js')) {
            const size = resource.transferSize || resource.encodedBodySize || 0
            const fileName = resource.name.split('/').pop() || 'unknown'
            console.log(`[BUNDLE] 📥 Loaded: ${fileName} (${formatSize(size)})`)
          }
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      
      console.log('[BUNDLE] ✅ Performance monitoring active')
    } catch (error) {
      console.warn('[BUNDLE] ⚠️ Failed to start performance observer:', error)
    }
  }
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      analyzePerformance()
    }, 1000)
  })
}
