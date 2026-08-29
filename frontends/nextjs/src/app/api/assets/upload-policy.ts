/**
 * What may be uploaded, and under what name.
 *
 * Kept apart from the route so the rules can be read -- and tested -- on
 * their own, without a request object standing in the way.
 */

/** One bucket per tenant, so a tenant's assets cannot name-collide. */
export const bucketFor = (tenant: string): string => `tenant-${tenant}`

/** What a browser may be handed, and nothing executable. */
export const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'application/pdf',
])

export const MAX_BYTES = 8 * 1024 * 1024

export interface UploadRefusal {
  error: string
  status: number
}

/**
 * The stored key, which becomes a URL path segment.
 *
 * The author's own filename is kept -- it is how they will recognise it in
 * the listing -- but only the parts of it that are safe in a path. A name
 * made entirely of characters that are not (say `????`, or a non-Latin
 * script) sanitises to nothing, so it falls back to a generated name
 * rather than writing an object under the empty key.
 */
export function safeAssetKey(name: string, now: number = Date.now()): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 128)
  return cleaned.length > 0 ? cleaned : `asset-${now}`
}

/** The refusal this file earns, or null if it may be stored. */
export function refuseUpload(file: File): UploadRefusal | null {
  if (!ALLOWED.has(file.type)) {
    return {
      error: `${file.type || 'That file type'} is not allowed`,
      status: 415,
    }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Files must be 8MB or smaller', status: 413 }
  }
  return null
}
