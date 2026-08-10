'use client'

import { useState, useCallback, useEffect } from 'react'

const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ?? 'http://localhost:8090'

export interface RadioTrack {
  id: string
  title: string
  artist: string
  album: string
}

export interface RadioChannel {
  id: string
  name: string
  is_live: boolean
  listeners: number
  stream_url: string
  now_playing?: RadioTrack
}

export function useRadioChannels() {
  const [channels, setChannels] = useState<RadioChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${MEDIA_API}/api/radio/channels`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { channels: RadioChannel[] }
      setChannels(data.channels)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => { void refresh() }, 15000)
    return () => { clearInterval(interval) }
  }, [refresh])

  const listen = useCallback(async (channelId: string): Promise<string> => {
    const res = await fetch(`${MEDIA_API}/api/radio/channels/${channelId}/start`, { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { stream_url: string }
    await refresh()
    return `${MEDIA_API}${data.stream_url}`
  }, [refresh])

  const stop = useCallback(async (channelId: string): Promise<void> => {
    await fetch(`${MEDIA_API}/api/radio/channels/${channelId}/stop`, { method: 'POST' })
    await refresh()
  }, [refresh])

  return { channels, loading, error, refresh, listen, stop }
}
