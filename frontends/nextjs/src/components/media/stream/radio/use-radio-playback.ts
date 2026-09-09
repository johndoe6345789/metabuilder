'use client'

import { useRef, useState } from 'react'

interface Args {
  listen: (channelId: string) => Promise<string>
  stop: (channelId: string) => Promise<void>
}

/** Which station (if any) is playing, and the listen/stop flow. */
export function useRadioPlayback({ listen, stop }: Args) {
  const [nowPlaying, setNowPlaying] = useState<{
    id: string
    url: string
    title: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [listenError, setListenError] = useState<string | null>(null)
  // What this client last told the daemon it was listening to. A ref
  // because handleListen reads it before its own setState has landed.
  const playingRef = useRef<string | null>(null)

  /**
   * `listen()` throws when the daemon refuses or answers without a
   * stream URL, and nothing caught it -- the spinner cleared, no player
   * appeared, and the rejection went unhandled. Tuning in worked
   * sometimes and did nothing other times.
   */
  const handleListen = async (channelId: string, title: string) => {
    setBusyId(channelId)
    // Starting told the daemon this client is listening; changing
    // station without saying it had stopped left the first one running
    // with a listener that had gone.
    const leaving = playingRef.current
    if (leaving !== null && leaving !== channelId) {
      try {
        await stop(leaving)
      } catch {
        /* the old station keeps running; nothing here can fix that */
      }
    }
    try {
      const url = await listen(channelId)
      playingRef.current = channelId
      setNowPlaying({ id: channelId, url, title })
      setListenError(null)
    } catch (cause) {
      const why = cause instanceof Error ? cause.message : 'it did not start'
      setListenError(`${title} would not start — ${why}.`)
    } finally {
      setBusyId(null)
    }
  }

  const handleStop = async () => {
    if (nowPlaying === null) return
    const id = nowPlaying.id
    playingRef.current = null
    setNowPlaying(null)
    // Best effort: the bar is already gone, and a daemon that cannot be
    // told is not a reason to leave a dead one on screen.
    try {
      await stop(id)
    } catch {
      /* the station keeps running server-side; nothing here can fix it */
    }
  }

  return { nowPlaying, busyId, listenError, handleListen, handleStop }
}
