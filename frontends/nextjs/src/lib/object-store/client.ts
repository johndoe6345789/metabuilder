import 'server-only'

/**
 * The blob store client.
 *
 * Split into store-config, buckets, objects and listing so each stays inside
 * the line limit; this re-exports them so existing importers are unaffected.
 */

export { ensureBucket } from './buckets'
export { deleteObject, getObject, putObject } from './objects'
export { listObjects, type StoredObject } from './listing'
