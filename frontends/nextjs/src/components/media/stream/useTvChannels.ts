'use client'

import { useMediaChannels } from './use-media-channels'

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

/** Attaches the now/next programme to each channel from the guide. */
async function withGuide(raw: unknown[]): Promise<ScheduledChannel[]> {
  const channels = raw as TvChannel[]
  const res = await fetch(`${MEDIA_API}/api/tv/epg?hours=6`)
  const epg: EpgEntry[] = res.ok
    ? (((await res.json()) as { epg?: EpgEntry[] }).epg ?? [])
    : []

  const now = Date.now()
  const at = (value: string) => new Date(value).getTime()

  return channels.map(channel => {
    const forChannel = epg
      .filter(entry => entry.channel_id === channel.id)
      .sort((a, b) => at(a.start_time) - at(b.start_time))

    return {
      ...channel,
      epgNow: forChannel.find(
        entry => at(entry.start_time) <= now && at(entry.end_time) > now
      ),
      epgNext: forChannel.find(entry => at(entry.start_time) > now),
      epgEntries: forChannel,
    }
  })
}

export function useTvChannels() {
  // withGuide is a module-level function, so it is already stable -- no
  // useCallback needed, and useMediaChannels does not depend on it.
  const { channels, loading, error, refresh, start, stop } =
    useMediaChannels<ScheduledChannel>(
      {
        api: MEDIA_API,
        service: 'tv',
        urlField: 'hls_url',
        streamHost: MEDIA_HLS_HOST,
        loadError: 'Failed to load channels',
      },
      withGuide
    )

  return { channels, loading, error, refresh, watch: start, stop }
}
