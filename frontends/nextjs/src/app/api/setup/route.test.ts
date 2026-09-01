import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const bootstrapRoute = vi.hoisted(() => ({
  POST: vi.fn(async () => new Response('bootstrapped', { status: 200 })),
}))
vi.mock('@/app/api/bootstrap/route', () => bootstrapRoute)

import { POST } from './route'

const SECRET = 'setup-secret-value'

function request(auth?: string) {
  return new Request('http://localhost/api/setup', {
    method: 'POST',
    headers: auth === undefined ? {} : { Authorization: auth },
  }) as never
}

describe('POST /api/setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects when SETUP_SECRET is not configured', async () => {
    vi.stubEnv('SETUP_SECRET', '')

    const res = await POST(request(`Bearer ${SECRET}`))

    expect(res.status).toBe(401)
    expect(bootstrapRoute.POST).not.toHaveBeenCalled()
  })

  it('rejects a missing Authorization header', async () => {
    vi.stubEnv('SETUP_SECRET', SECRET)

    const res = await POST(request())

    expect(res.status).toBe(401)
    expect(bootstrapRoute.POST).not.toHaveBeenCalled()
  })

  it('rejects a mismatched bearer token', async () => {
    vi.stubEnv('SETUP_SECRET', SECRET)

    const res = await POST(request('Bearer wrong-value'))

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('delegates to bootstrap when the secret matches', async () => {
    vi.stubEnv('SETUP_SECRET', SECRET)
    const req = request(`Bearer ${SECRET}`)

    const res = await POST(req)

    expect(bootstrapRoute.POST).toHaveBeenCalledWith(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('bootstrapped')
  })
})
