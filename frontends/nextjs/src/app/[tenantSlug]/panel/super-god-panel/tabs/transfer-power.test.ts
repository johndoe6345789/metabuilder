import { afterEach, describe, expect, it, vi } from 'vitest'

import { transferPower } from './transfer-power'

interface Call {
  url: string
  body: string
}

const mockFetch = (results: { ok: boolean; status?: number }[]) => {
  const calls: Call[] = []
  let n = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url: String(url), body: String(init.body) })
      const result = results[n] ?? { ok: true }
      n += 1
      return { ok: result.ok, status: result.status ?? 200 } as Response
    })
  )
  return calls
}

afterEach(() => vi.unstubAllGlobals())

const roleOf = (call: Call) =>
  (JSON.parse(call.body) as { role: string }).role

/**
 * The button under "This action cannot be undone" had no handler at all,
 * so the one thing this critical action did was nothing -- which looks
 * exactly like having worked.
 */
describe('transferPower', () => {
  it('promotes the new owner, then steps the old one down', async () => {
    const calls = mockFetch([{ ok: true }, { ok: true }])

    const outcome = await transferPower('old', 'new')

    expect(outcome.ok).toBe(true)
    expect(calls.map(c => [c.url.endsWith('/new'), roleOf(c)])).toEqual([
      [true, 'supergod'],
      [false, 'god'],
    ])
  })

  it('writes to the instance-wide accounts', async () => {
    const calls = mockFetch([{ ok: true }, { ok: true }])
    await transferPower('old', 'new')
    expect(calls[0].url).toContain('/system/core/User/new')
  })

  /**
   * Promote first: a refused promotion leaves everything as it was, while
   * demoting first and then failing would leave the instance with no
   * supergod at all -- which nobody has the power to undo.
   */
  it('changes nothing when the promotion is refused', async () => {
    const calls = mockFetch([{ ok: false, status: 403 }])

    const outcome = await transferPower('old', 'new')

    expect(outcome.ok).toBe(false)
    expect(outcome.message).toContain('Nothing was changed')
    expect(calls).toHaveLength(1)
  })

  it('says there are two owners when the step-down fails', async () => {
    mockFetch([{ ok: true }, { ok: false, status: 500 }])

    const outcome = await transferPower('old', 'new')

    expect(outcome.ok).toBe(false)
    expect(outcome.message).toContain('two supergods')
  })

  it('reports a data layer it could not reach', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    )

    const outcome = await transferPower('old', 'new')

    expect(outcome.ok).toBe(false)
    expect(outcome.message).toContain('could not be reached')
  })
})
