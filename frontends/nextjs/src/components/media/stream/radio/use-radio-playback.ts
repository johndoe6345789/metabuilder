'use client'

import { useState } from 'react'

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

  const handleListen = async (channelId: string, title: string) => {
    setBusyId(channelId)
    try {
      const url = await listen(channelId)
      setNowPlaying({ id: channelId, url, title })
    } finally {
      setBusyId(null)
    }
  }

  const handleStop = async () => {
    if (nowPlaying === null) return
    const id = nowPlaying.id
    setNowPlaying(null)
    await stop(id)
  }

  return { nowPlaying, busyId, handleListen, handleStop }
}
