import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteObject, getObject, putObject } from './objects'

function mockFetch(
  impl: (url: string, init?: RequestInit) => Promise<Response>
) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('putObject', () => {
  it('returns the ETag on success', async () => {
    const headers = new Headers({ ETag: '"abc123"' })
    mockFetch(async () => ({ ok: true, headers }) as Response)

    const result = await putObject('assets', 'a.png', 'body')

    expect(result).toEqual({ etag: '"abc123"' })
  })

  it('defaults the etag to an empty string when the header is absent', async () => {
    mockFetch(async () => ({ ok: true, headers: new Headers() }) as Response)
    const result = await putObject('assets', 'a.png', 'body')
    expect(result.etag).toBe('')
  })

  it('throws with the bucket/key and status when the write fails', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    await expect(putObject('assets', 'a.png', 'body')).rejects.toThrow(
      'putObject(assets/a.png) failed: HTTP 500'
    )
  })
})

describe('getObject', () => {
  it('returns null on a 404 rather than throwing', async () => {
    mockFetch(async () => ({ status: 404 }) as Response)
    expect(await getObject('assets', 'missing.png')).toBeNull()
  })

  it('returns the body, content type, and etag on success', async () => {
    const headers = new Headers({
      'Content-Type': 'image/png',
      ETag: '"xyz"',
    })
    const body = new ArrayBuffer(4)
    mockFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          headers,
          arrayBuffer: async () => body,
        }) as unknown as Response
    )

    const result = await getObject('assets', 'a.png')

    expect(result).toEqual({
      body,
      contentType: 'image/png',
      etag: '"xyz"',
    })
  })

  it('defaults contentType/etag when the headers are absent', async () => {
    mockFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          headers: new Headers(),
          arrayBuffer: async () => new ArrayBuffer(0),
        }) as unknown as Response
    )
    const result = await getObject('assets', 'a.png')
    expect(result?.contentType).toBe('application/octet-stream')
    expect(result?.etag).toBe('')
  })

  it('throws for a non-404 failure', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    await expect(getObject('assets', 'a.png')).rejects.toThrow(
      'getObject(assets/a.png) failed: HTTP 500'
    )
  })
})

describe('deleteObject', () => {
  it('resolves on success', async () => {
    mockFetch(async () => ({ ok: true, status: 204 }) as Response)
    await expect(deleteObject('assets', 'a.png')).resolves.toBeUndefined()
  })

  it('resolves on a 404 (already gone is not a failure)', async () => {
    mockFetch(async () => ({ ok: false, status: 404 }) as Response)
    await expect(deleteObject('assets', 'a.png')).resolves.toBeUndefined()
  })

  it('throws for any other failure status', async () => {
    mockFetch(async () => ({ ok: false, status: 500 }) as Response)
    await expect(deleteObject('assets', 'a.png')).rejects.toThrow(
      'deleteObject(assets/a.png) failed: HTTP 500'
    )
  })
})
