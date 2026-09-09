'use client'

import { useEffect, useRef, useState } from 'react'
import { useTvChannels } from '../useTvChannels'

interface WatchTrigger {
  channelId: string
  nonce: number
}

interface NowWatching {
  id: string
  url: string
  title: string
}

/** Which channel (if any) is playing, and the watch/stop flow that gets
 *  it there -- including reacting to an external "watch this one" signal
 *  from the hero's own "Watch now" button. */
export function useLiveTv(externalWatchTrigger?: WatchTrigger | null) {
  const { channels, loading, error, watch, stop } = useTvChannels()
  const [nowWatching, setNowWatching] = useState<NowWatching | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [watchError, setWatchError] = useState<string | null>(null)
  const lastTriggerNonce = useRef<number | null>(null)

  /**
   * `watch()` throws when the daemon refuses or answers without a stream
   * URL, and nothing caught it -- the spinner cleared, no player
   * appeared, and the rejection went unhandled. From the viewer's side
   * that is a button that works sometimes and does nothing other times.
   */
  const handleWatch = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await watch(channelId)
      setNowWatching({ id: channelId, url, title })
      setWatchError(null)
    } catch (cause) {
      const why = cause instanceof Error ? cause.message : 'it did not start'
      setWatchError(`${title} would not start — ${why}.`)
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    if (externalWatchTrigger === null || externalWatchTrigger === undefined)
      return
    if (externalWatchTrigger.nonce === lastTriggerNonce.current) return
    const ch = channels.find(c => c.id === externalWatchTrigger.channelId)
    // The nonce is spent only once there is a channel to act on. Marking
    // it first meant a "Watch now" pressed while the list was still
    // loading consumed the trigger, started nothing, and was then
    // blocked for ever by the guard above.
    if (ch === undefined) return
    lastTriggerNonce.current = externalWatchTrigger.nonce
    void Promise.resolve().then(() => handleWatch(ch.id, ch.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalWatchTrigger, channels])

  const handleStopWatching = async () => {
    if (nowWatching === null) return
    const id = nowWatching.id
    setNowWatching(null)
    // Stopping is best effort: the player is already gone, and a daemon
    // that cannot be told is not a reason to leave a dead frame up.
    try {
      await stop(id)
    } catch {
      /* the channel keeps running server-side; nothing here can fix it */
    }
  }

  return {
    channels,
    loading,
    error,
    nowWatching,
    busyId,
    watchError,
    handleWatch,
    handleStopWatching,
  }
}
