/** Reading, writing and removing one object. */

import 'server-only'

import { storeFetch } from './request'

export async function putObject(
  bucket: string,
  key: string,
  body: BodyInit,
  contentType = 'application/octet-stream'
): Promise<{ etag: string }> {
  const res = await storeFetch({
    method: 'PUT',
    bucket,
    key,
    body,
    contentType,
    timeoutMs: 30000,
  })
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
  key: string
): Promise<{ body: ArrayBuffer; contentType: string; etag: string } | null> {
  const res = await storeFetch({ method: 'GET', bucket, key, timeoutMs: 30000 })
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
  const res = await storeFetch({
    method: 'DELETE',
    bucket,
    key,
    timeoutMs: 10000,
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteObject(${bucket}/${key}) failed: HTTP ${res.status}`)
  }
}
