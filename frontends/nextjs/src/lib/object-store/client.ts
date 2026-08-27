import 'server-only'

/**
 * Thin client for the object-store service (github.com/johndoe6345789/
 * object-store) -- an S3-compatible blob store. Structured/text data stays
 * in DBAL as it already does; this is for blobs (uploads, package assets,
 * media) that don't belong in a Postgres text column.
 *
 * server-only: AuthFilter on that service accepts "Authorization: AWS
 * <key>:<secret>" (see object-store's AuthFilter.cpp -- not real AWS SigV4,
 * an intentionally small internal scheme), and those credentials must never
 * reach the browser bundle.
 */

const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL ?? 'http://localhost:9000'
// Must match whatever's actually seeded in object-store's api_keys table
// (migrations/002_seed_data.sql) -- these are read from a DB row there, not
// an env var on that service, so the default here is that seed's dev key,
// not an independently-invented one.
const ACCESS_KEY = process.env.OBJECT_STORE_ACCESS_KEY ?? 'minioadmin'
const SECRET_KEY = process.env.OBJECT_STORE_SECRET_KEY ?? 'minioadmin'

function authHeader(): Record<string, string> {
  return { Authorization: `AWS ${ACCESS_KEY}:${SECRET_KEY}` }
}

/** PUT /{bucket} -- idempotent; a bucket must exist before objects can be
 * stored in it (the service 404s with "NoSuchBucket" otherwise). */
export async function ensureBucket(bucket: string): Promise<void> {
  const res = await fetch(`${OBJECT_STORE_URL}/${encodeURIComponent(bucket)}`, {
    method: 'PUT',
    headers: authHeader(),
    signal: AbortSignal.timeout(10000),
  })
  // Creating a bucket that already exists is not an error for our purposes.
  if (!res.ok && res.status !== 409) {
    throw new Error(`ensureBucket(${bucket}) failed: HTTP ${res.status}`)
  }
}

export async function putObject(
  bucket: string,
  key: string,
  body: BodyInit,
  contentType = 'application/octet-stream',
): Promise<{ etag: string }> {
  const res = await fetch(
    `${OBJECT_STORE_URL}/${encodeURIComponent(bucket)}/${encodeURI(key)}`,
    {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': contentType },
      body,
      signal: AbortSignal.timeout(30000),
    },
  )
  if (!res.ok) {
    throw new Error(`putObject(${bucket}/${key}) failed: HTTP ${res.status}`)
  }
  const etag = res.headers.get('ETag') ?? ''
  return { etag }
}

/** Returns null on a missing bucket/key (NoSuchBucket/NoSuchKey) rather than
 * throwing -- callers almost always want to distinguish "not found" from a
 * real failure. */
export async function getObject(
  bucket: string,
  key: string,
): Promise<{ body: ArrayBuffer; contentType: string; etag: string } | null> {
  const res = await fetch(
    `${OBJECT_STORE_URL}/${encodeURIComponent(bucket)}/${encodeURI(key)}`,
    { headers: authHeader(), signal: AbortSignal.timeout(30000) },
  )
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`getObject(${bucket}/${key}) failed: HTTP ${res.status}`)
  }
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get('Content-Type') ?? 'application/octet-stream',
    etag: res.headers.get('ETag') ?? '',
  }
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const res = await fetch(
    `${OBJECT_STORE_URL}/${encodeURIComponent(bucket)}/${encodeURI(key)}`,
    { method: 'DELETE', headers: authHeader(), signal: AbortSignal.timeout(10000) },
  )
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteObject(${bucket}/${key}) failed: HTTP ${res.status}`)
  }
}

export interface StoredObject {
  key: string
  size: number
  etag: string
  lastModified: string
}

/**
 * GET /list/{bucket} -- the objects in a bucket, newest listing first.
 *
 * The service answers S3's XML rather than JSON, so this parses the handful
 * of elements it actually emits (Key, Size, ETag, LastModified) instead of
 * pulling in an XML library for four fields. A missing bucket lists as empty
 * rather than throwing: an asset browser opening a bucket nobody has put
 * anything in yet is not an error.
 */
export async function listObjects(
  bucket: string,
  prefix = '',
): Promise<StoredObject[]> {
  const query = prefix === '' ? '' : `?prefix=${encodeURIComponent(prefix)}`
  const res = await fetch(
    `${OBJECT_STORE_URL}/list/${encodeURIComponent(bucket)}${query}`,
    { headers: authHeader(), signal: AbortSignal.timeout(15000) },
  )
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
