import { beforeEach, describe, expect, it, vi } from 'vitest'

const master = vi.hoisted(() => ({ getVaultMasterPassword: vi.fn() }))
vi.mock('@/lib/vault/master-password', () => master)

import { DELETE, GET, POST } from './route'
import { createVaultSessionToken, VAULT_COOKIE_NAME } from '../vault-session'

type Req = Parameters<typeof GET>[0]

const req = (cookie: string | null, body?: unknown): Req => {
  const base = new Request('http://localhost/api/vault/auth', {
    method: body === undefined ? 'GET' : 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return Object.assign(base, {
    cookies: {
      get: (name: string) =>
        cookie !== null && name === VAULT_COOKIE_NAME
          ? { name, value: cookie }
          : undefined,
    },
  }) as unknown as Req
}

const PASSWORD = 'correct horse battery'
const token = () => createVaultSessionToken(PASSWORD)

beforeEach(() => master.getVaultMasterPassword.mockReturnValue(PASSWORD))

describe('GET /api/vault/auth', () => {
  it('is a 500, not a 200, when no master password is configured', async () => {
    master.getVaultMasterPassword.mockReturnValue(null)
    const res = await GET(req(token()))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toMatchObject({
      error: expect.stringContaining('not configured'),
    })
  })

  it('reports authenticated for a cookie holding the token', async () => {
    const res = await GET(req(token()))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ authenticated: true })
  })

  it('reports unauthenticated when the cookie is absent', async () => {
    await expect((await GET(req(null))).json()).resolves.toEqual({
      authenticated: false,
    })
  })

  it('reports unauthenticated for a forged token', async () => {
    const forged = 'a'.repeat(token().length)
    await expect((await GET(req(forged))).json()).resolves.toEqual({
      authenticated: false,
    })
  })
})

describe('POST /api/vault/auth', () => {
  it('refuses to sign anyone in with no master password set', async () => {
    master.getVaultMasterPassword.mockReturnValue(null)
    const res = await POST(req(null, { password: PASSWORD }))
    expect(res.status).toBe(500)
  })

  it('rejects an empty password with 400 before comparing', async () => {
    const res = await POST(req(null, { password: '' }))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ authenticated: false })
  })

  it('rejects a body that is not JSON at all', async () => {
    const base = new Request('http://localhost/api/vault/auth', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(
      Object.assign(base, { cookies: { get: () => undefined } }) as never
    )
    expect(res.status).toBe(400)
  })

  it('rejects a wrong password with 401 and sets no cookie', async () => {
    const res = await POST(req(null, { password: 'wrong' }))
    expect(res.status).toBe(401)
    expect(res.cookies.get(VAULT_COOKIE_NAME)).toBeUndefined()
  })

  it('accepts the master password and sets an httpOnly cookie', async () => {
    const res = await POST(req(null, { password: PASSWORD }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ authenticated: true })
    const cookie = res.cookies.get(VAULT_COOKIE_NAME)
    expect(cookie?.value).toBe(token())
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.sameSite).toBe('lax')
    expect(cookie?.path).toBe('/app')
  })

  // The cookie stores the derived token, never the password the caller
  // typed -- a leaked cookie must not be a leaked master password.
  it('never puts the plaintext password in the cookie', async () => {
    const res = await POST(req(null, { password: PASSWORD }))
    expect(res.cookies.get(VAULT_COOKIE_NAME)?.value).not.toContain(PASSWORD)
  })
})

describe('DELETE /api/vault/auth', () => {
  it('clears the cookie by expiring it immediately', async () => {
    const res = await DELETE()
    await expect(res.json()).resolves.toEqual({ authenticated: false })
    const cookie = res.cookies.get(VAULT_COOKIE_NAME)
    expect(cookie?.value).toBe('')
    expect(cookie?.maxAge).toBe(0)
  })
})
