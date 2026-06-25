'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { usePersistGate } from './hooks/usePersistGate'

function PersistGate({
  children,
}: {
  children: React.ReactNode
}) {
  const ready = usePersistGate()
  if (!ready) return null
  return <>{children}</>
}

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <PersistGate>{children}</PersistGate>
    </Provider>
  )
}
