/**
 * Hook for auto-refreshing data at intervals
 */
import { useEffect, useCallback } from 'react'

export function useAutoRefresh(callback: () => void, interval: number = 5000): void {
  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    const id = setInterval(stableCallback, interval)
    return () => clearInterval(id)
  }, [stableCallback, interval])
}
