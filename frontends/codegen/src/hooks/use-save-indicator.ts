import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

const DEFAULT_INTERVAL_MS = 10000
const DEFAULT_RECENT_THRESHOLD_MS = 3000

export function useSaveIndicator(
  lastSaved: number | null,
  {
    intervalMs = DEFAULT_INTERVAL_MS,
    recentThresholdMs = DEFAULT_RECENT_THRESHOLD_MS,
  }: {
    intervalMs?: number
    recentThresholdMs?: number
  } = {},
) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  const [isRecent, setIsRecent] = useState<boolean>(false)

  useEffect(() => {
    if (!lastSaved) {
      setTimeAgo('')
      setIsRecent(false)
      return
    }

    const updateIndicator = () => {
      setTimeAgo(formatDistanceToNow(lastSaved, { addSuffix: true }))
      setIsRecent(Date.now() - lastSaved < recentThresholdMs)
    }

    updateIndicator()
    const interval = setInterval(updateIndicator, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs, lastSaved, recentThresholdMs])

  return { timeAgo, isRecent }
}
