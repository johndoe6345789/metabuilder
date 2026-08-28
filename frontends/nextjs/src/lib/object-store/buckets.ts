/** Bucket lifecycle. */

import 'server-only'

import { authHeader, storeUrl } from './store-config'

/** PUT /{bucket} -- idempotent; a bucket must exist before objects can be
 * stored in it (the service 404s with "NoSuchBucket" otherwise). */
export async function ensureBucket(bucket: string): Promise<void> {
  const res = await fetch(storeUrl(`${encodeURIComponent(bucket)}`), {
    method: 'PUT',
    headers: authHeader(),
    signal: AbortSignal.timeout(10000),
  })
  // Creating a bucket that already exists is not an error for our purposes.
  if (!res.ok && res.status !== 409) {
    throw new Error(`ensureBucket(${bucket}) failed: HTTP ${res.status}`)
  }
}
