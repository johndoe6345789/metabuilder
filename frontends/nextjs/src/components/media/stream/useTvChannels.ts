'use client'

import { useState, useCallback, useEffect } from 'react'

const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ?? 'http://localhost:8090'
// hls_url from the API (e.g. "/hls/tv/ch1/stream.m3u8") is served by
// nginx-stream, not media-daemon itself — mirrors MEDIA_HLS_HOST on the
// backend (retro_routes.cpp), which defaults to this same port for the
// same reason (nginx-stream has the CORS headers a browser needs; the
// daemon doesn't serve static HLS files at all).
const MEDIA_HLS_HOST =
  process.env.NEXT_PUBLIC_MEDIA_HLS_URL ?? 'http://localhost:8088'

export interface TvProgram {
  id: string
  title: string
  description: string
  category: string
  content_path: string
  duration_seconds: number
  thumbnail_url: string
  rating: string
}

export interface TvChannel {
  id: string
  name: string
  channel_number: number
  is_live: boolean
  viewers: number
  hls_url: string
  dash_url: string
  now_playing?: TvProgram
  next_program?: TvProgram
}

export interface EpgEntry {
  channel_id: string
  channel_name: string
  program: TvProgram
  start_time: string
  end_time: string
}

// EPG entries (start/end times, works whether or not the channel is
// currently started) merged onto the channel list (is_live/hls_url, only
// meaningful once started) — real "what's on now" needs both: the guide
// is browsable at any time, and now_playing on TvChannel is only populated
// by the engine's stream_thread while a channel is actually running.
export interface ScheduledChannel extends TvChannel {
  epgNow?: EpgEntry
  epgNext?: EpgEntry
  // Full sorted schedule within the fetched window (see refresh()'s
  // ?hours= query) — the grid needs every entry, not just now/next, to
  // draw a real timeline.
  epgEntries: EpgEntry[]
}

export function useTvChannels() {
  const [channels, setChannels] = useState<ScheduledChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const [channelsRes, epgRes] = await Promise.all([
        fetch(`${MEDIA_API}/api/tv/channels`),
        fetch(`${MEDIA_API}/api/tv/epg?hours=6`),
      ])
      if (!channelsRes.ok) throw new Error(`HTTP ${channelsRes.status}`)
      const channelsData = (await channelsRes.json()) as {
        channels: TvChannel[]
      }
      const epgData = epgRes.ok
        ? ((await epgRes.json()) as { epg: EpgEntry[] })
        : { epg: [] }

      const now = Date.now()
      const merged: ScheduledChannel[] = channelsData.channels.map(ch => {
        const forChannel = epgData.epg
          .filter(e => e.channel_id === ch.id)
          .sort(
            (a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
          )
        const epgNow = forChannel.find(
          e =>
            new Date(e.start_time).getTime() <= now &&
            new Date(e.end_time).getTime() > now
        )
        const epgNext = forChannel.find(
          e => new Date(e.start_time).getTime() > now
        )
        return { ...ch, epgNow, epgNext, epgEntries: forChannel }
      })

      setChannels(merged)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load channels')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => {
      void refresh()
    }, 15000)
    return () => {
      clearInterval(interval)
    }
  }, [refresh])

  const watch = useCallback(
    async (channelId: string): Promise<string> => {
      const res = await fetch(
        `${MEDIA_API}/api/tv/channels/${channelId}/start`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { hls_url: string }
      await refresh()
      return `${MEDIA_HLS_HOST}${data.hls_url}`
    },
    [refresh]
  )

  const stop = useCallback(
    async (channelId: string): Promise<void> => {
      await fetch(`${MEDIA_API}/api/tv/channels/${channelId}/stop`, {
        method: 'POST',
      })
      await refresh()
    },
    [refresh]
  )

  return { channels, loading, error, refresh, watch, stop }
}
