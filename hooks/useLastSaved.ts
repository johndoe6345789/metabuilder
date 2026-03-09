/**
 * useLastSaved Hook
 * Track the last save timestamp based on dependencies
 *
 * @example
 * const [data, setData] = useState({})
 * const lastSaved = useLastSaved([data])
 *
 * <span>Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</span>
 */

import { useState, useEffect } from 'react'

/**
 * Hook that tracks when dependencies last changed
 * @param dependencies - Array of values to watch
 * @returns Timestamp of the last change, or null if never changed
 */
export function useLastSaved(dependencies: any[]): number | null {
  const [lastSaved, setLastSaved] = useState<number | null>(Date.now())

  useEffect(() => {
    setLastSaved(Date.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return lastSaved
}
