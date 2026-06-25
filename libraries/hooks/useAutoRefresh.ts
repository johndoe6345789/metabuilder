/**
 * useAutoRefresh hook
 */

import { useEffect, useRef } from 'react'

export interface AutoRefreshOptions {
  interval?: number
  enabled?: boolean
}

export function useAutoRefresh(callback: () => void, options?: AutoRefreshOptions): void {
  const { interval = 30000, enabled = true } = options || {}
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(callback, interval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [callback, interval, enabled])
}
