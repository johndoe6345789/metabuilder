import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchChannels, fetchMessages, postMessage } from './irc-api'

function mockFetch(
  impl: (url: string, init?: RequestInit) => Promise<Response>
) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchChannels', () => {
  it('returns the channel list on success', async () => {
    mockFetch(
      async () =>
        ({ ok: true, json: async () => ({ data: [{ id: 'c1' }] }) }) as Response
    )
    const result = await fetchChannels()
    expect(result).toEqual([{ id: 'c1' }])
  })

  it('defaults to an empty list when the response has no data', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    expect(await fetchChannels()).toEqual([])
  })

  it('throws when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    await expect(fetchChannels()).rejects.toThrow('channels fetch failed')
  })
})

describe('fetchMessages', () => {
  it('returns the message list, scoped to the channel', async () => {
    const fetchFn = vi.fn(
      async () =>
        ({ ok: true, json: async () => ({ data: [{ id: 'm1' }] }) }) as Response
    )
    mockFetch(fetchFn)
    const result = await fetchMessages('c1')
    expect(result).toEqual([{ id: 'm1' }])
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('channelId=c1'),
      expect.anything()
    )
  })

  it('defaults to an empty list when the response has no data', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }) as Response)
    expect(await fetchMessages('c1')).toEqual([])
  })

  it('throws when the response is not ok', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    await expect(fetchMessages('c1')).rejects.toThrow('messages fetch failed')
  })
})

describe('postMessage', () => {
  it('posts the message body scoped to the given tenant', async () => {
    const fetchFn = vi.fn(async () => ({ ok: true }) as Response)
    mockFetch(fetchFn)

    await postMessage('c1', 'hello', 'alex', 'acme')

    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/acme/irc/irc_message'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          channelId: 'c1',
          content: 'hello',
          createdBy: 'alex',
          tenantId: 'acme',
        }),
      })
    )
  })
})
