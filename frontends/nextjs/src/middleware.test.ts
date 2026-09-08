import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

const req = (path: string) => new NextRequest(`http://localhost${path}`)

describe('middleware', () => {
  it.each(['/ui/login', '/app', '/app/', '/app/foo'])(
    'is 404 for the retired route %s',
    path => {
      const res = middleware(req(path))
      expect(res.status).toBe(404)
    }
  )

  it.each(['/api/health', '/admin', '/auth/callback', '/_next/static/x'])(
    'passes reserved paths through untouched',
    path => {
      const res = middleware(req(path))
      expect(res.status).toBe(200)
      expect(res.headers.get('x-tenant-id')).toBeNull()
    }
  )

  it('passes the root path through untouched', () => {
    const res = middleware(req('/'))
    expect(res.status).toBe(200)
  })

  it('passes a single-segment path through without tenant headers', () => {
    const res = middleware(req('/acme'))
    expect(res.headers.get('x-tenant-id')).toBeNull()
  })

  /**
   * These used to be set on NextResponse.next()'s own headers and asserted
   * there, which is why nothing noticed: a response header is sent to the
   * browser, not handed to the app, so `headers().get('x-tenant-id')`
   * downstream returned null and every reader would have fallen back to
   * "system". Forwarding requires handing next() the request headers, and
   * Next carries them as x-middleware-request-* for the runtime to apply.
   */
  const forwarded = (res: Response, name: string) =>
    res.headers.get(`x-middleware-request-${name}`)

  it('forwards tenant and package to the app for a two-segment route', () => {
    const res = middleware(req('/acme/blog'))
    expect(forwarded(res, 'x-tenant-id')).toBe('acme')
    expect(forwarded(res, 'x-package-id')).toBe('blog')
  })

  it('does the same for a deeper route', () => {
    const res = middleware(req('/acme/blog/posts/1'))
    expect(forwarded(res, 'x-tenant-id')).toBe('acme')
    expect(forwarded(res, 'x-package-id')).toBe('blog')
  })

  // They were also echoed back to the browser on every response, which is
  // neither useful nor anything a visitor needs to know.
  it('does not echo them to the browser', () => {
    const res = middleware(req('/acme/blog'))
    expect(res.headers.get('x-tenant-id')).toBeNull()
    expect(res.headers.get('x-package-id')).toBeNull()
  })
})
