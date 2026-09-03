import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
vi.mock('@/lib/auth/api/fetch-session', () => session)
vi.mock('@/app/api/auth/session/route', () => ({
  SESSION_COOKIE: 'mb_session',
}))

import { DELETE, GET, PATCH, POST, PUT } from './route'

type Req = Parameters<typeof GET>[0]

interface Call {
  url: string
  method?: string
  headers: Record<string, string>
  body?: string
}

const stubDbal = (status = 200, payload = '{"data":[]}'): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method,
        headers: (init?.headers ?? {}) as Record<string, string>,
        body: init?.body as string | undefined,
      })
      return { status, text: async () => payload } as Response
    })
  )
  return calls
}

const req = (
  method: string,
  { cookie = 'tok', search = '', body = '' } = {}
): Req =>
  ({
    method,
    nextUrl: { search },
    cookies: {
      get: (name: string) =>
        cookie === '' || name !== 'mb_session'
          ? undefined
          : { name, value: cookie },
    },
    text: async () => body,
  }) as unknown as Req

const params = (slug: string[]) => ({ params: Promise.resolve({ slug }) })
const core = params(['system', 'core', 'Page'])
const bqlParse = params(['community_darkroom', 'core', 'bql', 'parse'])

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  session.fetchSession.mockResolvedValue({ id: 'u1' })
})

describe('reads', () => {
  it('forwards the path to the data layer', async () => {
    const calls = stubDbal()
    await GET(req('GET'), core)
    expect(calls[0]?.url).toContain('/system/core/Page')
    expect(calls[0]?.method).toBe('GET')
  })

  it('carries the query string across', async () => {
    const calls = stubDbal()
    await GET(req('GET', { search: '?limit=10' }), core)
    expect(calls[0]?.url).toContain('?limit=10')
  })

  // Published pages are meant to be readable by anyone, so a read is not
  // gated on a session -- and must not call out to verify one.
  it('does not require a session', async () => {
    const calls = stubDbal()
    const res = await GET(req('GET', { cookie: '' }), core)
    expect(res.status).toBe(200)
    expect(session.fetchSession).not.toHaveBeenCalled()
    expect(calls).toHaveLength(1)
  })

  it('sends no Authorization header when there is no cookie', async () => {
    const calls = stubDbal()
    await GET(req('GET', { cookie: '' }), core)
    expect(calls[0]?.headers.Authorization).toBeUndefined()
  })

  it('passes the session token on when there is one', async () => {
    const calls = stubDbal()
    await GET(req('GET'), core)
    expect(calls[0]?.headers.Authorization).toBe('Bearer tok')
  })

  it('sends no Content-Type on a bodyless method', async () => {
    const calls = stubDbal()
    await GET(req('GET'), core)
    expect(calls[0]?.headers['Content-Type']).toBeUndefined()
    expect(calls[0]?.body).toBeUndefined()
  })

  it('returns the data layer\'s own status and body', async () => {
    stubDbal(404, '{"error":"no such row"}')
    const res = await GET(req('GET'), core)
    expect(res.status).toBe(404)
    await expect(res.text()).resolves.toBe('{"error":"no such row"}')
  })

  it('is 502 when the data layer is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    const res = await GET(req('GET'), core)
    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toMatchObject({ success: false })
  })
})

describe('writes', () => {
  const writers = [
    ['POST', POST],
    ['PUT', PUT],
    ['PATCH', PATCH],
    ['DELETE', DELETE],
  ] as const

  // The data layer does not enforce the ACLs its schemas declare, so an
  // anonymous write has to stop here rather than reach it.
  it.each(writers)('%s is 401 with no session cookie', async (method, fn) => {
    const calls = stubDbal()
    const res = await fn(req(method, { cookie: '' }), core)
    expect(res.status).toBe(401)
    expect(calls).toHaveLength(0)
  })

  it.each(writers)(
    '%s is 401 when the cookie does not verify',
    async (method, fn) => {
      session.fetchSession.mockResolvedValue(null)
      const calls = stubDbal()
      expect((await fn(req(method), core)).status).toBe(401)
      expect(calls).toHaveLength(0)
    }
  )

  it.each(writers)('%s reaches the data layer once signed in', async (
    method,
    fn
  ) => {
    const calls = stubDbal()
    expect((await fn(req(method), core)).status).toBe(200)
    expect(calls[0]?.method).toBe(method)
  })

  it.each([
    ['POST', POST],
    ['PUT', PUT],
    ['PATCH', PATCH],
  ] as const)('%s forwards the request body as JSON', async (method, fn) => {
    const calls = stubDbal()
    await fn(req(method, { body: '{"title":"hi"}' }), core)
    expect(calls[0]?.body).toBe('{"title":"hi"}')
    expect(calls[0]?.headers['Content-Type']).toBe('application/json')
  })

  it('sends no body on a DELETE', async () => {
    const calls = stubDbal()
    await DELETE(req('DELETE'), core)
    expect(calls[0]?.body).toBeUndefined()
  })

  it('verifies the cookie rather than trusting that it exists', async () => {
    stubDbal()
    await POST(req('POST'), core)
    expect(session.fetchSession).toHaveBeenCalledWith('tok')
  })
})

describe('stateless utility routes (e.g. bql/parse)', () => {
  // bql/parse only tokenizes text -- it never touches tenant data, so the
  // write-auth gate (built for genuine writes) must not demand a session
  // for it, unlike every other POST.
  it('does not require a session', async () => {
    const calls = stubDbal()
    const res = await POST(req('POST', { cookie: '' }), bqlParse)
    expect(res.status).toBe(200)
    expect(session.fetchSession).not.toHaveBeenCalled()
    expect(calls).toHaveLength(1)
  })

  it('still forwards the request body', async () => {
    const calls = stubDbal()
    await POST(req('POST', { cookie: '', body: '{"script":"Add a Box."}' }), bqlParse)
    expect(calls[0]?.body).toBe('{"script":"Add a Box."}')
  })

  it('does not exempt a path that merely ends similarly', async () => {
    const calls = stubDbal()
    const res = await POST(
      req('POST', { cookie: '' }),
      params(['t', 'core', 'notbql', 'parse'])
    )
    expect(res.status).toBe(401)
    expect(calls).toHaveLength(0)
  })
})
