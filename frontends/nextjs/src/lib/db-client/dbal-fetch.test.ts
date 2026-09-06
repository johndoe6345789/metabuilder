import { afterEach, describe, it, expect, vi } from 'vitest'
import { dbalFetch, unwrap } from './dbal-fetch'

describe('unwrap', () => {
  it('unwraps a {success, data} envelope', () => {
    expect(unwrap({ success: true, data: { id: 'a' } })).toEqual({ id: 'a' })
  })

  it('unwraps a failed envelope the same way -- callers check ok first', () => {
    expect(unwrap({ success: false, data: null })).toBeNull()
  })

  it('passes a bare array through unchanged', () => {
    expect(unwrap([{ id: 'a' }])).toEqual([{ id: 'a' }])
  })

  it('passes a shape with no success key through unchanged', () => {
    expect(unwrap({ id: 'a' })).toEqual({ id: 'a' })
  })

  it('passes null through unchanged', () => {
    expect(unwrap(null)).toBeNull()
  })
})

describe('the operator key', () => {
  const original = process.env.DBAL_ADMIN_TOKEN
  afterEach(() => {
    if (original === undefined) delete process.env.DBAL_ADMIN_TOKEN
    else process.env.DBAL_ADMIN_TOKEN = original
    vi.unstubAllGlobals()
  })

  const capture = () => {
    const seen: RequestInit[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_u: string, init: RequestInit) => {
        seen.push(init)
        return { ok: true, status: 200, json: async () => ({}) }
      })
    )
    return seen
  }

  /**
   * DBAL enforces its read ACLs now, so a server-side read of User or
   * InstalledPackage that presents nothing is refused -- and listEntity
   * turns any error into an empty list, so the symptom is a check that
   * silently stops finding anything rather than a visible failure.
   */
  it('is sent, so a gated entity can be read server-side', async () => {
    process.env.DBAL_ADMIN_TOKEN = 'operator-key'
    const seen = capture()

    await dbalFetch('http://dbal/system/core/User')

    const headers = seen[0]?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer operator-key')
  })

  it('is not sent when there is none to send', async () => {
    delete process.env.DBAL_ADMIN_TOKEN
    const seen = capture()

    await dbalFetch('http://dbal/system/core/User')

    const headers = seen[0]?.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  // A caller passing its own token is speaking for a person, not the
  // operator, and must win.
  it('gives way to a token the caller supplied', async () => {
    process.env.DBAL_ADMIN_TOKEN = 'operator-key'
    const seen = capture()

    await dbalFetch('http://dbal/system/core/User', {
      headers: { Authorization: 'Bearer someones-own-token' },
    })

    const headers = seen[0]?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer someones-own-token')
  })
})
