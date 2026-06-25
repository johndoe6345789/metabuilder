/**
 * usePersistGate — waits for redux-persist rehydration.
 * Renders immediately; subscribes in background.
 */
import { useState, useEffect } from 'react'
import { persistor } from '@/store'

export function usePersistGate(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Render immediately — don't block on IndexedDB rehydration
    setReady(true)

    const { bootstrapped } = persistor.getState()
    if (!bootstrapped) {
      const unsub = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) unsub()
      })
    }
  }, [])

  return ready
}
