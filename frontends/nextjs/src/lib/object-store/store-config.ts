import 'server-only'

/**
 * Where the blob store is, and how to authenticate to it.
 *
 * server-only: the store takes an AWS-style key pair that must never reach a
 * browser bundle.
 */

const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL ?? 'http://localhost:9000'
// Must match the key seeded in object-store's migrations/002_seed_data.sql,
// which reads it from a table rather than its own environment.
const ACCESS_KEY = process.env.OBJECT_STORE_ACCESS_KEY ?? 'minioadmin'
const SECRET_KEY = process.env.OBJECT_STORE_SECRET_KEY ?? 'minioadmin'

export const storeUrl = (path: string): string => `${OBJECT_STORE_URL}/${path}`

export const authHeader = (): Record<string, string> => ({
  Authorization: `AWS ${ACCESS_KEY}:${SECRET_KEY}`,
})
