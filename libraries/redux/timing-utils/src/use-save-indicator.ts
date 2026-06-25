import { useEffect, useState } from 'react'

/**
 * Displays a formatted "time ago" string for when data was last saved.
 * Includes an indicator for "recent" saves (within a configurable threshold).
 *
 * @example
 * function SaveStatus() {
 *   const [lastSaved, setLastSaved] = useState<number | null>(null)
 *   const { timeAgo, isRecent } = useSaveIndicator(lastSaved)
 *
 *   return (
 *     <div>
 *       {isRecent && <span className="pulse">●</span>}
 *       <span>{timeAgo || 'Not saved'}</span>
 *     </div>
 *   )
 * }
 */
export function useSaveIndicator(
  lastSaved: number | null,
  {
    intervalMs = 10000,
    recentThresholdMs = 3000,
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
      const seconds = Math.floor((Date.now() - lastSaved) / 1000)
      if (seconds < 60) {
        setTimeAgo('Just now')
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`)
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600)
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`)
      } else {
        const days = Math.floor(seconds / 86400)
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`)
      }

      setIsRecent(Date.now() - lastSaved < recentThresholdMs)
    }

    updateIndicator()
    const interval = setInterval(updateIndicator, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs, lastSaved, recentThresholdMs])

  return { timeAgo, isRecent }
}
