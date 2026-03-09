import { useEffect, useState } from 'react'

import { useComponentTreeLoader } from '@/hooks/use-component-tree-loader'
import { preloadCriticalComponents } from '@/lib/component-registry'

type AppBootstrapOptions = {
  loadComponentTrees?: boolean
}

export function useAppBootstrap({ loadComponentTrees = false }: AppBootstrapOptions = {}) {
  const { loadComponentTrees: loadTrees } = useComponentTreeLoader({ autoLoad: false })
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) {
        setAppReady(true)
      }
    }, 100)

    const runBootstrap = async () => {
      try {
        if (loadComponentTrees) {
          await loadTrees()
        }
      } catch (err) {
        console.error('[APP_BOOTSTRAP] Bootstrap loading failed:', err)
      } finally {
        if (!isMounted) {
          return
        }
        clearTimeout(timer)
        setAppReady(true)
        preloadCriticalComponents()
      }
    }

    runBootstrap()

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [loadTrees, loadComponentTrees])

  return { appReady }
}
