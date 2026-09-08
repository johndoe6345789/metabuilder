import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('@/lib/auth/api/register', () => api)

import { NextRequest } from 'next/server'
import { POST } from './route'

/**
 * From a fresh address per request unless a test says otherwise, so the
 * limiter's buckets do not bleed between cases -- without this the older
 * tests all shared the "unknown" bucket and the enumeration test below
 * drained it before they ran.
 */
let nextAddress = 0
const req = (body: unknown, ip?: string): NextRequest =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'x-real-ip': ip ?? `10.0.${++nextAddress}.1` },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const valid = { username: 'alice', email: 'a@b.c', password: 'pw' }

beforeEach(() => {
  vi.clearAllMocks()
  api.register.mockResolvedValue({ success: true, user: { id: 'u1' } })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/auth/register', () => {
  it('creates the account and returns it', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ success: true })
    expect(api.register).toHaveBeenCalledWith(
      'alice',
      'a@b.c',
      'pw',
      undefined
    )
  })

  it('passes tenantName through when the signup names a community', async () => {
    await POST(req({ ...valid, tenantName: 'acme' }))
    expect(api.register).toHaveBeenCalledWith(
      'alice',
      'a@b.c',
      'pw',
      'acme'
    )
  })

  it.each(['username', 'email', 'password'])(
    'is 400 when %s is missing',
    async field => {
      const body: Record<string, string> = { ...valid }
      delete body[field]
      const res = await POST(req(body))
      expect(res.status).toBe(400)
      expect(api.register).not.toHaveBeenCalled()
    }
  )

  it('does not treat an empty string as missing', async () => {
    await POST(req({ ...valid, password: '' }))
    expect(api.register).toHaveBeenCalledWith('alice', 'a@b.c', '', undefined)
  })

  it('passes a registration failure through as 400', async () => {
    api.register.mockResolvedValue({
      success: false,
      user: null,
      error: 'Username already exists',
    })
    const res = await POST(req(valid))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      error: 'Username already exists',
    })
  })

  it('is 400 when registration succeeds but returns no user', async () => {
    api.register.mockResolvedValue({ success: true, user: null })
    expect((await POST(req(valid))).status).toBe(400)
  })

  it('is 500 for a body that is not JSON', async () => {
    const res = await POST(req('not json'))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toMatchObject({ success: false })
  })

  // The message from an unexpected failure is generic on purpose: it must
  // not leak the shape of the data layer to an anonymous caller.
  it('is 500 with a generic message when register throws', async () => {
    api.register.mockRejectedValue(new Error('dbal at 10.0.0.4 refused'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      success: false,
      user: null,
      error: 'Internal server error',
    })
  })
})

/**
 * RATE_LIMIT_CONFIGS declares register at 3 a minute "to slow
 * account-enumeration attempts", and nothing applied it to this route --
 * only to /api/v1's auth path, which the signup form does not use. This
 * route answers "Username already exists", "Email already exists" and
 * "already taken" with distinct messages, so unlimited it was an oracle
 * for all three.
 */
describe('signing up over and over from one address', () => {
  it('is refused on the fourth attempt within the minute', async () => {
    const from = '10.9.9.9'
    for (let i = 0; i < 3; i += 1) {
      expect((await POST(req(valid, from))).status).toBe(200)
    }
    const fourth = await POST(req(valid, from))

    expect(fourth.status).toBe(429)
    // Refused before the account logic ran at all.
    expect(api.register).toHaveBeenCalledTimes(3)
  })

  it('does not count one address against another', async () => {
    for (let i = 0; i < 3; i += 1) await POST(req(valid, '10.8.8.8'))
    expect((await POST(req(valid, '10.7.7.7'))).status).toBe(200)
  })
})
