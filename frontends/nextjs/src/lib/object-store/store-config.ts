import 'server-only'

/**
 * Where the object store is, and the SigV4 key pair used to reach it.
 *
 * server-only: the key pair must never reach a browser bundle. Resolved on
 * first use, not at import, so `next build` works with no store configured.
 *
 * The store authenticates against its api_keys table (SigV4 only; the old
 * `Authorization: AWS <key>:<secret>` header is refused). Mint a key with an
 * INSERT as described in the object-store README -- never use its seeded key.
 */

export interface StoreConfig {
  endpoint: string
  region: string
  accessKey: string
  secretKey: string
}

/** Dev/test-only placeholders. They authenticate against nothing unless a
 * matching api_keys row exists, and are refused when NODE_ENV=production. */
export const DEV_ACCESS_KEY = 'metabuilder-dev-access-key'
export const DEV_SECRET_KEY = 'metabuilder-dev-secret-key'

export function getStoreConfig(env = process.env): StoreConfig {
  const accessKey = env.OBJECT_STORE_ACCESS_KEY
  const secretKey = env.OBJECT_STORE_SECRET_KEY
  const hasKeys = Boolean(accessKey) && Boolean(secretKey)
  if (!hasKeys && env.NODE_ENV === 'production') {
    throw new Error(
      'Object store credentials are not configured: set ' +
        'OBJECT_STORE_ACCESS_KEY and OBJECT_STORE_SECRET_KEY'
    )
  }
  return {
    endpoint: (env.OBJECT_STORE_URL ?? 'http://localhost:9000').replace(
      /\/+$/,
      ''
    ),
    region: env.OBJECT_STORE_REGION ?? 'us-east-1',
    accessKey: hasKeys ? (accessKey as string) : DEV_ACCESS_KEY,
    secretKey: hasKeys ? (secretKey as string) : DEV_SECRET_KEY,
  }
}
