import { useState, useEffect } from 'react'
import type { Persistor } from 'redux-persist'

/**
 * SSR-safe hook that returns true once the persisted state has been rehydrated.
 * Use this to delay rendering until persisted state is available.
 *
 * @example
 * ```tsx
 * const isRehydrated = usePersistGate(persistor)
 * if (!isRehydrated) return <LoadingScreen />
 * return <App />
 * ```
 */
export function usePersistGate(persistor: Persistor): boolean {
  const [isRehydrated, setIsRehydrated] = useState(false)

  useEffect(() => {
    const { bootstrapped } = persistor.getState()
    if (bootstrapped) {
      setIsRehydrated(true)
      return
    }

    const unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState()
      if (bootstrapped) {
        setIsRehydrated(true)
        unsubscribe()
      }
    })

    return unsubscribe
  }, [persistor])

  return isRehydrated
}
