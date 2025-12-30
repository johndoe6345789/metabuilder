import { useCallback, useEffect, useState } from 'react'

interface UseAutoRefreshOptions {
  intervalMs?: number
  onRefresh: () => Promise<void>
  enabled?: boolean
}

interface UseAutoRefreshState {
  isAutoRefreshing: boolean
  secondsUntilNextRefresh: number
}

interface UseAutoRefreshActions {
  toggleAutoRefresh: () => void
  setEnabled: (enabled: boolean) => void
}

/**
 * Hook to manage auto-refresh polling
 * Handles timer countdown and refresh triggering
 */
export function useAutoRefresh({
  intervalMs = 30000,
  onRefresh,
  enabled = false,
}: UseAutoRefreshOptions): UseAutoRefreshState & UseAutoRefreshActions {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(enabled)
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState(
    Math.ceil(intervalMs / 1000)
  )

  useEffect(() => {
    if (!isAutoRefreshing) return

    const refreshInterval = setInterval(() => {
      void onRefresh()
    }, intervalMs)

    const countdownInterval = setInterval(() => {
      setSecondsUntilNextRefresh(prev => {
        const next = prev - 1
        return next <= 0 ? Math.ceil(intervalMs / 1000) : next
      })
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [isAutoRefreshing, intervalMs, onRefresh])

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshing(prev => !prev)
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setIsAutoRefreshing(enabled)
  }, [])

  return {
    isAutoRefreshing,
    secondsUntilNextRefresh,
    toggleAutoRefresh,
    setEnabled,
  }
}
