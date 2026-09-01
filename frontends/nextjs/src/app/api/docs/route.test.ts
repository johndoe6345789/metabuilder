import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('GET /api/docs', () => {
  it('returns HTML with the swagger content type', async () => {
    const res = GET()
    expect(res.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    const body = await res.text()
    expect(body).toContain('<title>MetaBuilder API Documentation</title>')
  })

  it('points swagger-ui at the openapi spec url', async () => {
    const res = GET()
    const body = await res.text()
    expect(body).toContain('url: "/api/docs/openapi.json"')
  })

  it('sets a cacheable Cache-Control header', () => {
    const res = GET()
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
