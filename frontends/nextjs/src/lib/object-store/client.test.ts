import { afterEach, describe, expect, it, vi } from 'vitest'

import { listObjects } from '@/lib/object-store/client'

afterEach(() => {
  vi.unstubAllGlobals()
})

/** The service answers S3's XML, so the parser is tested against its shape. */
const listing = `<?xml version="1.0"?><ListBucketResult>
  <Name>assets</Name><Prefix></Prefix><MaxKeys>1000</MaxKeys>
  <IsTruncated>false</IsTruncated>
  <Contents><Key>logo.svg</Key><Size>2048</Size>
    <ETag>"abc123"</ETag><LastModified>2026-08-27T10:00:00Z</LastModified></Contents>
  <Contents><Key>photos/van &amp; tools.jpg</Key><Size>91024</Size>
    <ETag>"def456"</ETag><LastModified>2026-08-27T11:00:00Z</LastModified></Contents>
</ListBucketResult>`

describe('listObjects', () => {
  it('parses the objects out of the XML listing', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response(listing, { status: 200 }))
    )
    const objects = await listObjects('assets')

    expect(objects).toHaveLength(2)
    expect(objects[0]).toEqual({
      key: 'logo.svg',
      size: 2048,
      // Quotes are S3's, not part of the value.
      etag: 'abc123',
      lastModified: '2026-08-27T10:00:00Z',
    })
    // Entities have to survive the round trip or filenames come back wrong.
    expect(objects[1]?.key).toBe('photos/van & tools.jpg')
    expect(objects[1]?.size).toBe(91024)
  })

  it('lists a bucket nobody has written to as empty, not an error', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response('NoSuchBucket', { status: 404 }))
    )
    await expect(listObjects('brand-new')).resolves.toEqual([])
  })

  it('throws on a real failure rather than reporting no assets', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(new Response('boom', { status: 500 }))
    )
    await expect(listObjects('assets')).rejects.toThrow('HTTP 500')
  })
})
