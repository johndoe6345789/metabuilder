import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useTvChannels } from './useTvChannels'

const HOUR = 3600_000
const now = Date.parse('2026-01-01T12:00:00.000Z')

const channel = (id: string) => ({ id, name: `Channel ${id}` })

const epg = (
  channelId: string,
  title: string,
  startOffsetH: number,
  endOffsetH: number
) => ({
  channel_id: channelId,
  title,
  start_time: new Date(now + startOffsetH * HOUR).toISOString(),
  end_time: new Date(now + endOffsetH * HOUR).toISOString(),
})

function mockFetch(
  opts: {
    channels?: unknown
    epgEntries?: unknown[]
    channelsOk?: boolean
    epgOk?: boolean
    startBody?: unknown
    startOk?: boolean
  } = {}
) {
  const calls: { url: string; method: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const u = String(url)
      calls.push({ url: u, method: init?.method ?? 'GET' })

      if (u.includes('/epg')) {
        return {
          ok: opts.epgOk ?? true,
          status: 200,
          json: async () => ({ epg: opts.epgEntries ?? [] }),
        } as Response
      }
      if (u.includes('/start')) {
        return {
          ok: opts.startOk ?? true,
          status: opts.startOk === false ? 500 : 200,
          json: async () => opts.startBody ?? { hls_url: '/hls/a.m3u8' },
        } as Response
      }
      if (u.includes('/stop')) {
        return { ok: true, status: 200, json: async () => ({}) } as Response
      }
      return {
        ok: opts.channelsOk ?? true,
        status: opts.channelsOk === false ? 503 : 200,
        json: async () => ({ channels: opts.channels ?? [channel('a')] }),
      } as Response
    })
  )
  return calls
}

const ready = async () => {
  const hook = renderHook(() => useTvChannels())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useTvChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  describe('loading', () => {
    it('lists the channels', async () => {
      mockFetch()
      const { result } = await ready()

      expect(result.current.channels).toHaveLength(1)
      expect(result.current.error).toBeNull()
    })

    it('reports a failure and stops loading', async () => {
      mockFetch({ channelsOk: false })
      const { result } = await ready()

      expect(result.current.error).toBe('HTTP 503')
    })

    it('still lists channels when the guide is unavailable', async () => {
      // The guide is a nice-to-have; losing it must not lose the channels.
      mockFetch({ epgOk: false })
      const { result } = await ready()

      expect(result.current.channels).toHaveLength(1)
      expect(result.current.channels[0].epgNow).toBeUndefined()
    })
  })

  describe('guide merging', () => {
    it('picks the programme airing now', async () => {
      mockFetch({
        epgEntries: [epg('a', 'Earlier', -2, -1), epg('a', 'Now', -1, 1)],
      })
      const { result } = await ready()

      expect(result.current.channels[0].epgNow?.title).toBe('Now')
    })

    it('picks the next programme after it', async () => {
      mockFetch({
        epgEntries: [epg('a', 'Now', -1, 1), epg('a', 'Next', 1, 2)],
      })
      const { result } = await ready()

      expect(result.current.channels[0].epgNext?.title).toBe('Next')
    })

    it('orders the guide by start time whatever order it arrives in', async () => {
      mockFetch({
        epgEntries: [epg('a', 'Later', 2, 3), epg('a', 'Sooner', 1, 2)],
      })
      const { result } = await ready()

      expect(
        result.current.channels[0].epgEntries.map(e => e.title)
      ).toEqual(['Sooner', 'Later'])
    })

    it('does not attach another channel guide entries', async () => {
      mockFetch({
        channels: [channel('a'), channel('b')],
        epgEntries: [epg('b', 'On B', -1, 1)],
      })
      const { result } = await ready()

      expect(result.current.channels[0].epgEntries).toEqual([])
      expect(result.current.channels[1].epgNow?.title).toBe('On B')
    })

    it('has no now-programme in a gap between listings', async () => {
      mockFetch({ epgEntries: [epg('a', 'Ended', -3, -2)] })
      const { result } = await ready()

      expect(result.current.channels[0].epgNow).toBeUndefined()
    })

    it('treats a programme ending exactly now as over', async () => {
      mockFetch({ epgEntries: [epg('a', 'Ending', -1, 0)] })
      const { result } = await ready()

      expect(result.current.channels[0].epgNow).toBeUndefined()
    })
  })

  describe('watch', () => {
    it('returns an absolute stream url', async () => {
      mockFetch()
      const { result } = await ready()

      let url = ''
      await act(async () => {
        url = await result.current.watch('a')
      })

      // The HLS host differs from the API host, so a relative path would
      // be requested against the wrong origin.
      expect(url).toContain('/hls/a.m3u8')
      expect(url).not.toBe('/hls/a.m3u8')
    })

    it('starts the channel it was asked for', async () => {
      const calls = mockFetch()
      const { result } = await ready()

      await act(async () => {
        await result.current.watch('a')
      })

      expect(
        calls.some(c => c.url.includes('/channels/a/start') && c.method === 'POST')
      ).toBe(true)
    })

    it('throws rather than returning a broken url on failure', async () => {
      mockFetch({ startOk: false })
      const { result } = await ready()

      await expect(result.current.watch('a')).rejects.toThrow('HTTP 500')
    })
  })

  describe('stop', () => {
    it('stops the channel and refreshes', async () => {
      const calls = mockFetch()
      const { result } = await ready()
      const before = calls.length

      await act(async () => {
        await result.current.stop('a')
      })

      expect(calls.some(c => c.url.includes('/channels/a/stop'))).toBe(true)
      expect(calls.length).toBeGreaterThan(before + 1)
    })
  })
})
