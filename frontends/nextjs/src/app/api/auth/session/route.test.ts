import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
const store = vi.hoisted(() => ({
  set: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/lib/auth/api/fetch-session', () => session)
vi.mock('next/headers', () => ({ cookies: async () => store }))

import { DELETE, GET, POST, SESSION_COOKIE } from './route'

const req = (token: string | null): Request =>
  new Request('http://localhost/api/auth/session', {
    method: 'GET',
    headers: token === null ? {} : { authorization: `Bearer ${token}` },
  })

const USER = { id: 'u1', username: 'alice', role: 'user' }

beforeEach(() => {
  vi.clearAllMocks()
  session.fetchSession.mockResolvedValue(USER)
})

describe('GET /api/auth/session', () => {
  it('returns the user for a valid bearer token', async () => {
    const res = await GET(req('tok'))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ user: USER })
    expect(session.fetchSession).toHaveBeenCalledWith('tok')
  })

  it('is 401 when the token resolves to nobody', async () => {
    session.fetchSession.mockResolvedValue(null)
    expect((await GET(req('tok'))).status).toBe(401)
  })

  it('passes null on when there is no Authorization header', async () => {
    session.fetchSession.mockResolvedValue(null)
    expect((await GET(req(null))).status).toBe(401)
    expect(session.fetchSession).toHaveBeenCalledWith(null)
  })

  // Only the Bearer scheme carries a token here; anything else is not one.
  it('ignores a non-Bearer Authorization header', async () => {
    session.fetchSession.mockResolvedValue(null)
    const raw = new Request('http://localhost/api/auth/session', {
      headers: { authorization: 'Basic YWxpY2U6cHc=' },
    })
    await GET(raw)
    expect(session.fetchSession).toHaveBeenCalledWith(null)
  })

  it('is 500 rather than a crash when the lookup throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    session.fetchSession.mockRejectedValue(new Error('dbal down'))
    const res = await GET(req('tok'))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ user: null })
  })
})

describe('POST /api/auth/session', () => {
  it('sets an httpOnly cookie holding the verified token', async () => {
    const res = await POST(req('tok'))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(store.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      'tok',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    )
  })

  it('scopes the cookie to twelve hours', async () => {
    await POST(req('tok'))
    const options = store.set.mock.calls[0]?.[2] as { maxAge: number }
    expect(options.maxAge).toBe(60 * 60 * 12)
  })

  // The cookie is what the data-layer proxy trusts on every write, so a
  // token the data layer has not vouched for must never become one.
  it('sets no cookie when the token does not verify', async () => {
    session.fetchSession.mockResolvedValue(null)
    const res = await POST(req('forged'))
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ ok: false })
    expect(store.set).not.toHaveBeenCalled()
  })

  it('sets no cookie and never calls out when no token is sent', async () => {
    const res = await POST(req(null))
    expect(res.status).toBe(401)
    expect(session.fetchSession).not.toHaveBeenCalled()
    expect(store.set).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/auth/session', () => {
  it('removes the session cookie', async () => {
    const res = await DELETE()
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(store.delete).toHaveBeenCalledWith(SESSION_COOKIE)
  })
})
