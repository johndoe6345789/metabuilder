/**
 * useAppLayoutState — initial state for AppLayout/AppRouterLayout.
 * Provides lastSaved and errorCount placeholders.
 */
import { useState } from 'react'

export interface AppLayoutState {
  lastSaved: number | null
  errorCount: number
}

export function useAppLayoutState(): AppLayoutState {
  const [lastSaved] = useState<number | null>(() => Date.now())
  const [errorCount] = useState(0)
  return { lastSaved, errorCount }
}
