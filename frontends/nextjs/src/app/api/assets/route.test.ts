import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
const cookieStore = vi.hoisted(() => ({ get: vi.fn() }))
const store = vi.hoisted(() => ({
  ensureBucket: vi.fn(async () => undefined),
  listObjects: vi.fn(async () => []),
  putObject: vi.fn(async () => undefined),
}))

vi.mock('@/lib/auth/api/fetch-session', () => session)
vi.mock('next/headers', () => ({ cookies: async () => cookieStore }))
vi.mock('@/lib/object-store/client', () => store)
vi.mock('@/app/api/auth/session/route', () => ({
  SESSION_COOKIE: 'mb_session',
}))

import { GET, POST } from './route'

type Req = Parameters<typeof GET>[0]

const get = (query = ''): Req =>
  ({
    nextUrl: new URL(`http://localhost/api/assets${query}`),
  }) as unknown as Req

const upload = (file: File | null, tenant?: string): Req => {
  const form = new FormData()
  if (file !== null) form.set('file', file)
  if (tenant !== undefined) form.set('tenant', tenant)
  return { formData: async () => form } as unknown as Req
}

const png = (name = 'logo.png', bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type: 'image/png' })

const signedIn = (yes: boolean) => {
  cookieStore.get.mockReturnValue(yes ? { value: 'tok' } : undefined)
  session.fetchSession.mockResolvedValue(yes ? { id: 'u1' } : null)
}

beforeEach(() => {
  vi.clearAllMocks()
  store.listObjects.mockResolvedValue([])
  signedIn(true)
})

describe('GET /api/assets', () => {
  it('lists the system bucket by default', async () => {
    await GET(get())
    expect(store.listObjects).toHaveBeenCalledWith('tenant-system')
  })

  it('lists the bucket for the requested tenant', async () => {
    await GET(get('?tenant=acme'))
    expect(store.listObjects).toHaveBeenCalledWith('tenant-acme')
  })

  it('returns the objects it found', async () => {
    store.listObjects.mockResolvedValue([{ key: 'a.png' }])
    await expect((await GET(get())).json()).resolves.toEqual({
      objects: [{ key: 'a.png' }],
    })
  })

  it('is 502 with an empty listing when the store is unreachable', async () => {
    store.listObjects.mockRejectedValue(new Error('store down'))
    const res = await GET(get())
    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({
      objects: [],
      error: 'store down',
    })
  })
})

describe('POST /api/assets', () => {
  // An unauthenticated upload endpoint is a free file host.
  it('is 401 when no session cookie is present', async () => {
    signedIn(false)
    cookieStore.get.mockReturnValue(undefined)
    const res = await POST(upload(png()))
    expect(res.status).toBe(401)
    expect(store.putObject).not.toHaveBeenCalled()
  })

  it('is 401 when the cookie does not resolve to a user', async () => {
    cookieStore.get.mockReturnValue({ value: 'forged' })
    session.fetchSession.mockResolvedValue(null)
    expect((await POST(upload(png()))).status).toBe(401)
  })

  it('is 400 when no file is supplied', async () => {
    const res = await POST(upload(null))
    expect(res.status).toBe(400)
  })

  it.each([
    'text/html',
    'application/javascript',
    'application/x-msdownload',
    '',
  ])('refuses %s with 415', async type => {
    const file = new File([new Uint8Array(4)], 'x', { type })
    expect((await POST(upload(file))).status).toBe(415)
  })

  it.each([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'application/pdf',
  ])('accepts %s', async type => {
    const file = new File([new Uint8Array(4)], 'x.bin', { type })
    expect((await POST(upload(file))).status).toBe(200)
  })

  it('refuses a file over 8MB with 413', async () => {
    const big = png('big.png', 8 * 1024 * 1024 + 1)
    expect((await POST(upload(big))).status).toBe(413)
    expect(store.putObject).not.toHaveBeenCalled()
  })

  it('accepts a file of exactly 8MB', async () => {
    const edge = png('edge.png', 8 * 1024 * 1024)
    expect((await POST(upload(edge))).status).toBe(200)
  })

  it('creates the bucket before writing to it', async () => {
    await POST(upload(png(), 'acme'))
    expect(store.ensureBucket).toHaveBeenCalledWith('tenant-acme')
    expect(store.putObject).toHaveBeenCalledWith(
      'tenant-acme',
      'logo.png',
      expect.anything(),
      'image/png'
    )
  })

  it('stores the file under its sanitised name', async () => {
    const res = await POST(upload(png('../../etc/passwd')))
    await expect(res.json()).resolves.toMatchObject({ key: 'etc-passwd' })
  })

  it('leaves no path separator in the stored key', async () => {
    for (const name of ['a/b/c.png', 'a\\b.png', '../x.png']) {
      const res = await POST(upload(png(name)))
      const body = (await res.json()) as { key: string }
      expect(body.key).not.toMatch(/[/\\]/)
    }
  })

  it('falls back to the system tenant when none is given', async () => {
    await POST(upload(png()))
    expect(store.ensureBucket).toHaveBeenCalledWith('tenant-system')
  })

  it('falls back to the system tenant for an empty tenant field', async () => {
    await POST(upload(png(), ''))
    expect(store.ensureBucket).toHaveBeenCalledWith('tenant-system')
  })

  it('returns a URL that reads the object back', async () => {
    await expect((await POST(upload(png(), 'acme'))).json()).resolves.toEqual({
      key: 'logo.png',
      url: '/app/api/assets/logo.png?tenant=acme',
    })
  })

  it('is 502 when the write fails', async () => {
    store.putObject.mockRejectedValue(new Error('store full'))
    const res = await POST(upload(png()))
    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({ error: 'store full' })
  })
})
