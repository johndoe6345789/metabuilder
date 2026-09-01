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

  it('stamps tenant and package headers for a two-segment route', () => {
    const res = middleware(req('/acme/blog'))
    expect(res.headers.get('x-tenant-id')).toBe('acme')
    expect(res.headers.get('x-package-id')).toBe('blog')
  })

  it('stamps tenant and package headers for a deeper route', () => {
    const res = middleware(req('/acme/blog/posts/1'))
    expect(res.headers.get('x-tenant-id')).toBe('acme')
    expect(res.headers.get('x-package-id')).toBe('blog')
  })
})
