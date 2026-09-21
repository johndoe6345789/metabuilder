import { afterEach, describe, expect, it, vi } from 'vitest'

import { objectPath, storeFetch } from './request'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function capture() {
  const fetchMock = vi.fn(async () => new Response('', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock as unknown as {
    mock: { calls: [URL, RequestInit & { headers: Record<string, string> }][] }
  }
}

describe('objectPath', () => {
  it('encodes each segment but keeps the slashes between them', () => {
    expect(objectPath('assets', 'a b/c&d.png')).toBe('/assets/a%20b/c%26d.png')
    expect(objectPath('assets')).toBe('/assets')
  })
})

describe('storeFetch', () => {
  it('sends a SigV4 Authorization header, never the legacy scheme', async () => {
    vi.stubEnv('OBJECT_STORE_URL', 'http://store:9000')
    vi.stubEnv('OBJECT_STORE_ACCESS_KEY', 'AK')
    vi.stubEnv('OBJECT_STORE_SECRET_KEY', 'SK')
    const f = capture()
    await storeFetch({
      method: 'PUT',
      bucket: 'b',
      key: 'k.txt',
      body: 'hi',
      contentType: 'text/plain',
      timeoutMs: 1000,
    })
    const [url, init] = f.mock.calls[0] as [URL, typeof f.mock.calls[0][1]]
    expect(String(url)).toBe('http://store:9000/b/k.txt')
    expect(init.headers.Authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AK\/\d{8}\/us-east-1\/s3\/aws4_request, /
    )
    expect(init.headers.Authorization).toContain('content-type')
    expect(init.headers['content-type']).toBe('text/plain')
    expect(init.headers.Authorization).not.toContain('SK')
  })

  it('buffers ArrayBuffer and stream bodies so they can be hashed', async () => {
    const f = capture()
    await storeFetch({
      method: 'PUT',
      bucket: 'b',
      key: 'k',
      body: new Response('stream me').body as ReadableStream,
      timeoutMs: 1000,
    })
    const init = f.mock.calls[0]?.[1]
    expect(new TextDecoder().decode(init?.body as Uint8Array)).toBe('stream me')
  })

  it('fails on first use in production without credentials', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('OBJECT_STORE_ACCESS_KEY', '')
    vi.stubEnv('OBJECT_STORE_SECRET_KEY', '')
    capture()
    await expect(
      storeFetch({ method: 'GET', bucket: 'b', timeoutMs: 1000 })
    ).rejects.toThrow('credentials are not configured')
  })
})
