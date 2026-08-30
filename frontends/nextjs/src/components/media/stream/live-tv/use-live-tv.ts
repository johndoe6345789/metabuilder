'use client'

import { useEffect, useRef, useState } from 'react'
import { useTvChannels } from '../useTvChannels'

interface WatchTrigger {
  channelId: string
  nonce: number
}

/** Which channel (if any) is playing, and the watch/stop flow that gets
 *  it there -- including reacting to an external "watch this one" signal
 *  from the hero's own "Watch now" button. */
export function useLiveTv(externalWatchTrigger?: WatchTrigger | null) {
  const { channels, loading, error, watch, stop } = useTvChannels()
  const [nowWatching, setNowWatching] = useState<{
    id: string
    url: string
    title: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const lastTriggerNonce = useRef<number | null>(null)

  const handleWatch = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await watch(channelId)
      setNowWatching({ id: channelId, url, title })
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    if (externalWatchTrigger === null || externalWatchTrigger === undefined)
      return
    if (externalWatchTrigger.nonce === lastTriggerNonce.current) return
    lastTriggerNonce.current = externalWatchTrigger.nonce
    const ch = channels.find(c => c.id === externalWatchTrigger.channelId)
    if (ch !== undefined) void handleWatch(ch.id, ch.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalWatchTrigger, channels])

  const handleStopWatching = async () => {
    if (nowWatching === null) return
    const id = nowWatching.id
    setNowWatching(null)
    await stop(id)
  }

  return {
    channels,
    loading,
    error,
    nowWatching,
    busyId,
    handleWatch,
    handleStopWatching,
  }
}
