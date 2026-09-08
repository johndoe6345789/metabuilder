import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseBqlViaDbal } from './dbal-parse'

const answer = (status: number, body: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  )
}

afterEach(() => vi.unstubAllGlobals())

/**
 * A DBAL error envelope is JSON too. Cast straight to the success type it
 * had no `ok` and no `errors`, so the caller's `outcome.errors.length`
 * threw inside a void promise -- the spinner cleared and nothing at all
 * appeared on screen. The catch only ever covered the network.
 */
describe('parseBqlViaDbal', () => {
  it('passes a parse result through', async () => {
    answer(200, { ok: true, statements: [] })
    expect(await parseBqlViaDbal('acme', 'add a Heading')).toMatchObject({
      ok: true,
    })
  })

  it('turns a server error into a reported error, not a blank', async () => {
    answer(500, { error: 'boom' })

    const result = await parseBqlViaDbal('acme', 'add a Heading')

    expect(result.ok).toBe(false)
    expect(result.errors?.[0]?.message).toContain('500')
  })

  it('does the same for a refusal', async () => {
    answer(404, { error: 'no such route' })
    expect((await parseBqlViaDbal('acme', 'x')).ok).toBe(false)
  })

  it('still reports an unreachable parser', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED')
      })
    )
    const result = await parseBqlViaDbal('acme', 'x')
    expect(result.ok).toBe(false)
    expect(result.errors?.[0]?.message).toContain('reach')
  })
})
