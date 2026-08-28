/** Listing a bucket, which the store answers in S3's XML. */

import 'server-only'

import { authHeader, storeUrl } from './store-config'

export interface StoredObject {
  key: string
  size: number
  etag: string
  lastModified: string
}

/**
 * GET /{bucket} -- the objects in a bucket, the way S3 lists one.
 *
 * The service answers S3's XML rather than JSON, so this parses the handful
 * of elements it actually emits (Key, Size, ETag, LastModified) instead of
 * pulling in an XML library for four fields. A missing bucket lists as empty
 * rather than throwing: an asset browser opening a bucket nobody has put
 * anything in yet is not an error.
 */
export async function listObjects(
  bucket: string,
  prefix = ''
): Promise<StoredObject[]> {
  const query = prefix === '' ? '' : `?prefix=${encodeURIComponent(prefix)}`
  const res = await fetch(storeUrl(`${encodeURIComponent(bucket)}${query}`), {
    headers: authHeader(),
    signal: AbortSignal.timeout(15000),
  })
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`listObjects(${bucket}) failed: HTTP ${res.status}`)
  }

  const xml = await res.text()
  const unescape = (value: string): string =>
    value
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&apos;', "'")
      .replaceAll('&amp;', '&')
  const pick = (block: string, tag: string): string => {
    const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block)
    return match?.[1] === undefined ? '' : unescape(match[1])
  }

  return [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(match => {
    const block = match[1] ?? ''
    return {
      key: pick(block, 'Key'),
      size: Number(pick(block, 'Size')) || 0,
      // The service wraps the etag in quotes, as S3 does.
      etag: pick(block, 'ETag').replace(/^"|"$/g, ''),
      lastModified: pick(block, 'LastModified'),
    }
  })
}
