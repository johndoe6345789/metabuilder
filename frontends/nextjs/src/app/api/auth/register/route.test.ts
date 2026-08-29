import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('@/lib/auth/api/register', () => api)

import { POST } from './route'

const req = (body: unknown): Request =>
  new Request('http://localhost/api/auth/register', {
    method: 'POST',
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
    expect(api.register).toHaveBeenCalledWith('alice', 'a@b.c', 'pw')
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
    expect(api.register).toHaveBeenCalledWith('alice', 'a@b.c', '')
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
