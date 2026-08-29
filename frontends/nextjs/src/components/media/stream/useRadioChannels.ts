'use client'

import { useMediaChannels } from './use-media-channels'

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
  const { channels, loading, error, refresh, start, stop } =
    useMediaChannels<RadioChannel>({
      api: MEDIA_API,
      service: 'radio',
      urlField: 'stream_url',
      loadError: 'Failed to load stations',
    })

  return { channels, loading, error, refresh, listen: start, stop }
}
