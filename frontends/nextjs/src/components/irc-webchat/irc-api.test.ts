import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchChannels, fetchMessages, messageId, postMessage } from './irc-api'

function mockFetch(
  impl: (url: string, init?: RequestInit) => Promise<unknown>
) {
  const fn = vi.fn(impl)
  vi.stubGlobal('fetch', fn)
  return fn
}

const ok = (body: unknown) => async () => ({ ok: true, json: async () => body })

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * The old URL was wrong four ways at once -- `/v1`, a hardcoded `default`
 * tenant, the package `irc`, and snake_case entity names -- so it could
 * only 404, and the hook read that as "DBAL offline" and quietly ran on
 * localStorage. Chat had never reached the data layer.
 */
describe('where the chat asks', () => {
  it("asks for this community's channels, at the route DBAL serves", async () => {
    const fn = mockFetch(ok({ data: { data: [] } }))

    await fetchChannels('harbour_cycle_works')

    const asked = String(fn.mock.calls[0]?.[0])
    expect(asked).toContain('/harbour_cycle_works/irc_webchat/IRCChannel')
    expect(asked).not.toContain('/v1/')
    expect(asked).not.toContain('/default/')
  })

  it('asks for one channel of messages, by the filter DBAL takes', async () => {
    const fn = mockFetch(ok({ data: { data: [] } }))

    await fetchMessages('acme', 'ch_general')

    const asked = String(fn.mock.calls[0]?.[0])
    expect(asked).toContain('/acme/irc_webchat/IRCMessage')
    expect(asked).toContain('filter.channelId=ch_general')
  })
})

/**
 * The real envelope is {data:{data:[…]}}. Reading one level handed back an
 * object, and the shell spreads what this returns -- so the chat page
 * crashed outright with "messages is not iterable". The old tests here
 * asserted the one-level shape, so they agreed with the bug.
 */
describe('reading the answer', () => {
  it('reads channels out of the real DBAL envelope', async () => {
    mockFetch(ok({ data: { data: [{ id: 'c1' }] } }))
    expect(await fetchChannels('acme')).toEqual([{ id: 'c1' }])
  })

  it('still reads a one-level payload', async () => {
    mockFetch(ok({ data: [{ id: 'c1' }] }))
    expect(await fetchChannels('acme')).toEqual([{ id: 'c1' }])
  })

  it.each([{}, { data: null }, { data: { nope: 1 } }, 'text'])(
    'answers a list, never something unspreadable, for %p',
    async body => {
      mockFetch(ok(body))
      const channels = await fetchChannels('acme')
      expect(Array.isArray(channels)).toBe(true)
      expect([...channels]).toEqual([])
    }
  )

  it('reads the author from the field the schema declares', async () => {
    mockFetch(ok({ data: { data: [{ id: 'm1', username: 'rosa' }] } }))
    expect((await fetchMessages('acme', 'c1'))[0].createdBy).toBe('rosa')
  })

  it('still reads one written under the old name', async () => {
    mockFetch(ok({ data: { data: [{ id: 'm1', createdBy: 'rosa' }] } }))
    expect((await fetchMessages('acme', 'c1'))[0].createdBy).toBe('rosa')
  })

  it('names an author it cannot find rather than showing "undefined"', async () => {
    mockFetch(ok({ data: { data: [{ id: 'm1' }] } }))
    expect((await fetchMessages('acme', 'c1'))[0].createdBy).toBe('unknown')
  })

  it.each([
    ['channels', () => fetchChannels('acme')],
    ['messages', () => fetchMessages('acme', 'c1')],
  ])('throws when %s are refused', async (_what, call) => {
    mockFetch(async () => ({ ok: false, status: 500 }))
    await expect(call()).rejects.toThrow('fetch failed')
  })
})

describe('sending a message', () => {
  it('writes it to this community, with an id and an author', async () => {
    const fn = mockFetch(async () => ({ ok: true }))

    await postMessage('acme', 'c1', 'hello', 'rosa')

    const [url, init] = fn.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/acme/irc_webchat/IRCMessage')
    const body = JSON.parse(String(init.body)) as Record<string, unknown>
    expect(body).toMatchObject({
      tenantId: 'acme',
      channelId: 'c1',
      content: 'hello',
      // `createdBy` is not a field of the entity at all, so a message
      // written under that name arrived with no author.
      username: 'rosa',
    })
    expect(String(body.id)).not.toBe('')
  })

  // Sending used to ignore the response, so a refused message vanished
  // with the input box cleared and nothing said.
  it('throws when the data layer refuses it', async () => {
    mockFetch(async () => ({ ok: false, status: 403 }))
    await expect(postMessage('a', 'c', 'x', 'y')).rejects.toThrow('HTTP 403')
  })
})

describe('messageId', () => {
  it('is different every time', () => {
    expect(messageId()).not.toBe(messageId())
  })
})
