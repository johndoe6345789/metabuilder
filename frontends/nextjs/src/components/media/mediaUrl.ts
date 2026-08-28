const ALLOWED_MEDIA_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * True if `src` is safe to assign to a `<video>`/`<audio>` element's src.
 * Rejects `javascript:`/`data:`/other script-executing URL schemes; only
 * http(s) absolute URLs and same-origin-relative paths are allowed.
 */
export function isSafeMediaSrc(src: string): boolean {
  if (src.trim().length === 0) return false
  try {
    const base =
      typeof window !== 'undefined' ? window.location.href : 'http://localhost'
    return ALLOWED_MEDIA_PROTOCOLS.has(new URL(src, base).protocol)
  } catch {
    return false
  }
}
