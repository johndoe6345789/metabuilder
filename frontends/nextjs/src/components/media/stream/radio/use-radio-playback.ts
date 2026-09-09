'use client'

import { useState } from 'react'
import type { RadioChannel } from '../useRadioChannels'

interface Args {
  channels: RadioChannel[]
  listen: (channelId: string) => Promise<string>
  streamUrl: (path: string) => string
}

/**
 * Which station (if any) is playing, and the listen/stop flow.
 *
 * A station broadcasts whether or not anyone has it on, the same as live
 * television: tuning in joins whatever is playing now, and tuning out
 * leaves it playing. Listening used to call `start`, which puts the
 * station on air and so restarted it for everyone already listening,
 * and stopping called `stop`, which took it off air.
 */
export function useRadioPlayback({ channels, listen, streamUrl }: Args) {
  const [nowPlaying, setNowPlaying] = useState<{
    id: string
    url: string
    title: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [listenError, setListenError] = useState<string | null>(null)

  /**
   * `listen()` throws when the daemon refuses or answers without a
   * stream URL, and nothing caught it -- the spinner cleared, no player
   * appeared, and the rejection went unhandled.
   */
  const handleListen = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const station = channels.find(c => c.id === channelId)
      const joinable =
        station !== undefined && station.is_live && station.stream_url !== ''
          ? streamUrl(station.stream_url)
          : null
      const url = joinable ?? (await listen(channelId))
      setNowPlaying({ id: channelId, url, title })
      setListenError(null)
    } catch (cause) {
      const why = cause instanceof Error ? cause.message : 'it did not start'
      setListenError(`${title} would not start — ${why}.`)
    } finally {
      setBusyId(null)
    }
  }

  /** Tuning out. The station carries on without us. */
  const handleStop = () => {
    setNowPlaying(null)
  }

  return { nowPlaying, busyId, listenError, handleListen, handleStop }
}
