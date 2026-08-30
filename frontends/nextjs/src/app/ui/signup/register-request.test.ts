import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sso = vi.hoisted(() => ({ beginLogin: vi.fn(async () => undefined) }))
vi.mock('@metabuilder/dbal-sso/core', () => sso)
vi.mock('@/lib/dbalSsoConfig', () => ({ dbalSsoConfig: {} }))

import { apiBase, submitSignup } from './register-request'

const fields = {
  community: 'Acme',
  name: 'Alex',
  email: 'alex@example.com',
  password: 'longenough',
  tier: 'creator' as const,
}

const stub = (ok: boolean, body: unknown): string[] => {
  const asked: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      asked.push(String(url))
      return { json: async () => body } as Response
    })
  )
  return asked
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('apiBase', () => {
  it('is /app when the current path is under /app', () => {
    window.history.pushState({}, '', '/app/ui/signup')
    expect(apiBase()).toBe('/app')
  })

  it('is empty when the current path is not under /app', () => {
    window.history.pushState({}, '', '/ui/signup')
    expect(apiBase()).toBe('')
  })
})

describe('submitSignup', () => {
  it('posts the built payload to the register endpoint', async () => {
    const asked = stub(true, { success: true })
    await submitSignup(fields)
    expect(asked[0]).toContain('/api/auth/register')
  })

  it('starts the OIDC login on success, and reports no error', async () => {
    stub(true, { success: true })
    expect(await submitSignup(fields)).toBeNull()
    expect(sso.beginLogin).toHaveBeenCalledOnce()
  })

  it('reports the server\'s own message on failure, without logging in', async () => {
    stub(true, { success: false, error: 'Username already exists' })
    expect(await submitSignup(fields)).toBe('Username already exists')
    expect(sso.beginLogin).not.toHaveBeenCalled()
  })

  it('reports a generic message when the server gives no reason', async () => {
    stub(true, { success: false })
    expect(await submitSignup(fields)).toBe(
      'Registration failed. Please try again.'
    )
  })

  it('reports a connection error rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    expect(await submitSignup(fields)).toBe(
      'Could not connect. Please try again.'
    )
    expect(sso.beginLogin).not.toHaveBeenCalled()
  })
})
