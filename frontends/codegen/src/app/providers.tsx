'use client'

import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store, persistor } from '@/store'

function PersistGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Render immediately — don't block on IndexedDB rehydration
    setReady(true)

    // Let redux-persist finish rehydrating in the background
    const { bootstrapped } = persistor.getState()
    if (!bootstrapped) {
      const unsub = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) unsub()
      })
    }
  }, [])

  if (!ready) return null

  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate>{children}</PersistGate>
    </Provider>
  )
}
