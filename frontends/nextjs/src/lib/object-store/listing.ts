/** Listing a bucket, which the store answers in S3's XML. */

import 'server-only'

import { storeFetch } from './request'

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
  const objects: StoredObject[] = []
  let token = ''
  // ListObjectsV2 returns at most 1000 keys a page; follow the token.
  for (let page = 0; page < 1000; page++) {
    const query: Record<string, string> = { 'list-type': '2' }
    if (prefix !== '') query.prefix = prefix
    if (token !== '') query['continuation-token'] = token
    const res = await storeFetch({
      method: 'GET',
      bucket,
      query,
      timeoutMs: 15000,
    })
    if (res.status === 404) return []
    if (!res.ok) {
      throw new Error(`listObjects(${bucket}) failed: HTTP ${res.status}`)
    }
    const xml = await res.text()
    objects.push(...parseContents(xml))
    token = nextToken(xml)
    if (token === '') break
  }
  return objects
}

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

/** The continuation token when the listing is truncated, else ''. */
function nextToken(xml: string): string {
  return pick(xml, 'IsTruncated') === 'true'
    ? pick(xml, 'NextContinuationToken')
    : ''
}

function parseContents(xml: string): StoredObject[] {
  return [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(match => {
    const block = match.at(1) ?? ''
    const size = Number(pick(block, 'Size'))
    return {
      key: pick(block, 'Key'),
      size: Number.isNaN(size) ? 0 : size,
      // The service wraps the etag in quotes, as S3 does.
      etag: pick(block, 'ETag').replace(/^"|"$/g, ''),
      lastModified: pick(block, 'LastModified'),
    }
  })
}
