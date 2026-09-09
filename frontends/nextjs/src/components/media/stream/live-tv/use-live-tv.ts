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

/**
 * Which channel (if any) is playing, and the watch/stop flow that gets
 * it there -- including reacting to an external "watch this one" signal
 * from the hero's own "Watch now" button.
 *
 * Live television keeps broadcasting whether or not anyone is watching:
 * go to bed for an hour and it is an hour further on, like real TV. Both
 * halves of this used to work against that. Watching always called
 * `start`, which puts a channel on air, so joining one that was already
 * running restarted its broadcast from the top; and leaving always
 * called `stop`, which takes it off air, so it could not run while
 * nobody watched. A viewer arriving joins; a viewer leaving just leaves.
 */
export function useLiveTv(externalWatchTrigger?: WatchTrigger | null) {
  const { channels, loading, error, watch, streamUrl } = useTvChannels()
  const [nowWatching, setNowWatching] = useState<NowWatching | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [watchError, setWatchError] = useState<string | null>(null)
  const lastTriggerNonce = useRef<number | null>(null)

  /**
   * `watch()` throws when the daemon refuses or answers without a stream
   * URL, and nothing caught it -- the spinner cleared, no player
   * appeared, and the rejection went unhandled.
   */
  const handleWatch = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const channel = channels.find(c => c.id === channelId)
      // Already broadcasting: join it where it is. Asking the daemon to
      // start it again is what used to rewind everyone to the top.
      const joinable =
        channel !== undefined && channel.is_live && channel.hls_url !== ''
          ? streamUrl(channel.hls_url)
          : null
      const url = joinable ?? (await watch(channelId))
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

  /**
   * Stops watching. The channel carries on without us: that is what
   * makes it live, and it is why coming back an hour later shows an hour
   * later rather than the top of the programme you left.
   */
  const handleStopWatching = () => {
    setNowWatching(null)
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
