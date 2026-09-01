'use client'

/**
 * Channel list plus start/stop for a media service.
 *
 * TV and radio were the same hook twice: poll `/channels` every 15 seconds,
 * POST `/channels/{id}/start` to get a stream URL back, POST `.../stop`, and
 * refresh after either. Only the path segment, the URL field in the start
 * response, and the host that URL is resolved against differ -- so those are
 * the parameters and the rest is shared.
 */

import { useCallback, useEffect, useState } from 'react'

const POLL_MS = 15000

export interface MediaChannelsOptions {
  /** Base URL of the media API. */
  api: string
  /** Path segment: 'tv' or 'radio'. */
  service: string
  /** Field carrying the playable URL in the start response. */
  urlField: string
  /** Host the returned URL is resolved against; defaults to `api`. */
  streamHost?: string
  /** Message shown when the list cannot be loaded. */
  loadError: string
}

export interface MediaChannels<T> {
  channels: T[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  start: (channelId: string) => Promise<string>
  stop: (channelId: string) => Promise<void>
}

/**
 * `mapChannels` lets a caller layer extra data over the raw list -- the TV
 * guide does this to attach now/next per channel. It runs on every poll.
 */
export function useMediaChannels<T>(
  options: MediaChannelsOptions,
  mapChannels: (raw: unknown[]) => Promise<T[]> | T[] = raw => raw as T[]
): MediaChannels<T> {
  const { api, service, urlField, loadError } = options
  const streamHost = options.streamHost ?? api

  const [channels, setChannels] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const base = `${api}/api/${service}/channels`

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(base)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { channels?: unknown[] }
      setChannels(await mapChannels(data.channels ?? []))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : loadError)
    } finally {
      setLoading(false)
    }
    // mapChannels is a fresh closure each render for most callers; depending
    // on it would restart the poll on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, loadError])

  useEffect(() => {
    void Promise.resolve().then(() => refresh())
    const interval = setInterval(() => {
      void refresh()
    }, POLL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [refresh])

  const start = useCallback(
    async (channelId: string): Promise<string> => {
      const res = await fetch(`${base}/${channelId}/start`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Record<string, unknown>
      const url = data[urlField]
      if (typeof url !== 'string') {
        throw new Error(`Start response carried no ${urlField}`)
      }
      await refresh()
      // The stream host differs from the API host, so a relative path would
      // be fetched from the wrong origin.
      return `${streamHost}${url}`
    },
    [base, urlField, streamHost, refresh]
  )

  const stop = useCallback(
    async (channelId: string): Promise<void> => {
      await fetch(`${base}/${channelId}/stop`, { method: 'POST' })
      await refresh()
    },
    [base, refresh]
  )

  return { channels, loading, error, refresh, start, stop }
}
