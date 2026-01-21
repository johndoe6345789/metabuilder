const libraryCache = new Map<string, Promise<any>>()

interface LibraryLoadOptions {
  timeout?: number
  retries?: number
}

async function loadWithRetry<T>(
  libraryName: string,
  importFn: () => Promise<T>,
  options: LibraryLoadOptions = {}
): Promise<T> {
  const { timeout = 10000, retries = 3 } = options

  if (libraryCache.has(libraryName)) {
    console.log(`[LIBRARY] ✅ ${libraryName} already loaded from cache`)
    return libraryCache.get(libraryName)!
  }

  console.log(`[LIBRARY] 📦 Loading ${libraryName}...`)

  const loadPromise = new Promise<T>((resolve, reject) => {
    let attempts = 0

    const attemptLoad = async () => {
      attempts++
      console.log(`[LIBRARY] 🔄 Loading ${libraryName} (attempt ${attempts}/${retries})`)

      const timeoutId = setTimeout(() => {
        console.warn(`[LIBRARY] ⏰ ${libraryName} load timeout after ${timeout}ms`)
        reject(new Error(`${libraryName} load timeout after ${timeout}ms`))
      }, timeout)

      try {
        const library = await importFn()
        clearTimeout(timeoutId)
        console.log(`[LIBRARY] ✅ ${libraryName} loaded successfully`)
        resolve(library)
      } catch (error) {
        clearTimeout(timeoutId)
        console.error(`[LIBRARY] ❌ ${libraryName} load failed (attempt ${attempts}):`, error)

        if (attempts < retries) {
          console.log(`[LIBRARY] 🔁 Retrying ${libraryName} in ${attempts * 1000}ms...`)
          setTimeout(attemptLoad, attempts * 1000)
        } else {
          console.error(`[LIBRARY] ❌ ${libraryName} all retry attempts exhausted`)
          reject(error)
        }
      }
    }

    attemptLoad()
  })

  libraryCache.set(libraryName, loadPromise)
  return loadPromise
}

export async function loadRecharts() {
  return loadWithRetry('recharts', () => import('recharts'))
}

export async function loadD3() {
  return loadWithRetry('d3', () => import('d3'))
}

export async function loadThree() {
  return loadWithRetry('three', () => import('three'))
}

export async function loadReactFlow() {
  return loadWithRetry('reactflow', () => import('reactflow'))
}

export function preloadLibrary(libraryName: 'recharts' | 'd3' | 'three' | 'reactflow') {
  console.log(`[LIBRARY] 🎯 Preloading ${libraryName}`)
  
  switch (libraryName) {
    case 'recharts':
      loadRecharts().catch(err => console.warn(`[LIBRARY] ⚠️ Preload failed for recharts:`, err))
      break
    case 'd3':
      loadD3().catch(err => console.warn(`[LIBRARY] ⚠️ Preload failed for d3:`, err))
      break
    case 'three':
      loadThree().catch(err => console.warn(`[LIBRARY] ⚠️ Preload failed for three:`, err))
      break
    case 'reactflow':
      loadReactFlow().catch(err => console.warn(`[LIBRARY] ⚠️ Preload failed for reactflow:`, err))
      break
  }
}

export function getLibraryLoadStatus(libraryName: string): 'not-loaded' | 'loading' | 'loaded' | 'error' {
  if (!libraryCache.has(libraryName)) {
    return 'not-loaded'
  }

  const promise = libraryCache.get(libraryName)!
  
  return promise.then(
    () => 'loaded',
    () => 'error'
  ) as any
}

export function clearLibraryCache() {
  console.log('[LIBRARY] 🧹 Clearing library cache')
  libraryCache.clear()
}
