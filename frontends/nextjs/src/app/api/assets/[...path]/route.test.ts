import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
const cookieStore = vi.hoisted(() => ({ get: vi.fn() }))
const store = vi.hoisted(() => ({
  getObject: vi.fn(),
  deleteObject: vi.fn(async () => undefined),
}))

vi.mock('@/lib/auth/api/fetch-session', () => session)
vi.mock('next/headers', () => ({ cookies: async () => cookieStore }))
vi.mock('@/lib/object-store/client', () => store)
vi.mock('@/app/api/auth/session/route', () => ({
  SESSION_COOKIE: 'mb_session',
}))

import { DELETE, GET } from './route'

type Req = Parameters<typeof GET>[0]

const req = (query = ''): Req =>
  ({
    nextUrl: new URL(`http://localhost/api/assets/a.png${query}`),
  }) as unknown as Req

const params = (path: string[]) => ({ params: Promise.resolve({ path }) })

const stored = {
  body: new Uint8Array([1, 2, 3]),
  contentType: 'image/png',
  etag: 'W/"abc"',
}

const signedIn = (yes: boolean) => {
  cookieStore.get.mockReturnValue(yes ? { value: 'tok' } : undefined)
  session.fetchSession.mockResolvedValue(yes ? { id: 'u1' } : null)
}

beforeEach(() => {
  vi.clearAllMocks()
  store.getObject.mockResolvedValue(stored)
  signedIn(true)
})

describe('GET /api/assets/[...path]', () => {
  it('reads from the system bucket by default', async () => {
    await GET(req(), params(['a.png']))
    expect(store.getObject).toHaveBeenCalledWith('tenant-system', 'a.png')
  })

  it('reads from the requested tenant bucket', async () => {
    await GET(req('?tenant=acme'), params(['a.png']))
    expect(store.getObject).toHaveBeenCalledWith('tenant-acme', 'a.png')
  })

  it('rejoins a nested path', async () => {
    await GET(req(), params(['img', 'logo.png']))
    expect(store.getObject).toHaveBeenCalledWith(
      'tenant-system',
      'img/logo.png'
    )
  })

  it('is 404 when the object is not in the store', async () => {
    store.getObject.mockResolvedValue(null)
    const res = await GET(req(), params(['missing.png']))
    expect(res.status).toBe(404)
  })

  it('serves the object with its own content type and etag', async () => {
    const res = await GET(req(), params(['a.png']))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/png')
    expect(res.headers.get('ETag')).toBe('W/"abc"')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=300')
  })

  // An uploaded SVG is a script vector: it must never run as a document,
  // and the browser must not sniff its way to a different type.
  it('serves it under a policy that can load nothing', async () => {
    const res = await GET(req(), params(['a.svg']))
    expect(res.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; style-src 'unsafe-inline'"
    )
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('does not require a session to read', async () => {
    signedIn(false)
    expect((await GET(req(), params(['a.png']))).status).toBe(200)
  })
})

describe('DELETE /api/assets/[...path]', () => {
  it('deletes the named object for a signed-in caller', async () => {
    const res = await DELETE(req('?tenant=acme'), params(['a.png']))
    expect(res.status).toBe(200)
    expect(store.deleteObject).toHaveBeenCalledWith('tenant-acme', 'a.png')
  })

  it('is 401 with no session cookie, and deletes nothing', async () => {
    cookieStore.get.mockReturnValue(undefined)
    const res = await DELETE(req(), params(['a.png']))
    expect(res.status).toBe(401)
    expect(store.deleteObject).not.toHaveBeenCalled()
  })

  it('is 401 when the cookie does not resolve to a user', async () => {
    cookieStore.get.mockReturnValue({ value: 'forged' })
    session.fetchSession.mockResolvedValue(null)
    const res = await DELETE(req(), params(['a.png']))
    expect(res.status).toBe(401)
    expect(store.deleteObject).not.toHaveBeenCalled()
  })
})
