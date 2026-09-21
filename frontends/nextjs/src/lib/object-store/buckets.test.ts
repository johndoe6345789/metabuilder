import { describe, expect, it, vi } from 'vitest'
import { ensureBucket } from './buckets'

describe('ensureBucket', () => {
  it('PUTs the bucket URL with the auth header', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await ensureBucket('my-bucket')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(String(url)).toContain('/my-bucket')
    expect(init.method).toBe('PUT')
    // SigV4 only: the store refuses the legacy `AWS <key>:<secret>` header.
    expect(init.headers).toHaveProperty(
      'Authorization',
      expect.stringMatching(/^AWS4-HMAC-SHA256 /)
    )

    vi.unstubAllGlobals()
  })

  it('encodes the bucket name in the URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await ensureBucket('my bucket/weird')

    const [url] = fetchMock.mock.calls[0] as [URL]
    expect(String(url)).toContain('my%20bucket%2Fweird')

    vi.unstubAllGlobals()
  })

  it('treats HTTP 409 (already exists) as success', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 409 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(ensureBucket('existing-bucket')).resolves.toBeUndefined()

    vi.unstubAllGlobals()
  })

  it('throws for any other non-ok status', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(ensureBucket('bad-bucket')).rejects.toThrow(
      'ensureBucket(bad-bucket) failed: HTTP 500'
    )

    vi.unstubAllGlobals()
  })
})
