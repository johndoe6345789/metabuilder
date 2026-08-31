import type { ErrorCategory } from './types'

/** Exact HTTP status codes that map to one category each. 5xx is a range,
 *  checked separately since it covers 500-599 rather than one value. */
const STATUS_CODE_CATEGORIES: Partial<Record<number, ErrorCategory>> = {
  401: 'authentication',
  403: 'permission',
  404: 'not-found',
  409: 'conflict',
  429: 'rate-limit',
  408: 'timeout',
}

/** Message keywords, checked in this priority order -- the first rule
 *  whose keyword appears in the (lowercased) message wins. */
const KEYWORD_CATEGORIES: { category: ErrorCategory; keywords: string[] }[] = [
  { category: 'network', keywords: ['network', 'fetch', 'offline'] },
  { category: 'authentication', keywords: ['unauthorized', 'auth', '401'] },
  { category: 'permission', keywords: ['permission', 'forbidden', '403'] },
  { category: 'not-found', keywords: ['not found', '404'] },
  { category: 'conflict', keywords: ['conflict', 'duplicate', '409'] },
  { category: 'rate-limit', keywords: ['rate', 'too many', '429'] },
  { category: 'timeout', keywords: ['timeout', '408', 'timed out'] },
  { category: 'validation', keywords: ['validation', 'invalid', '400'] },
  { category: 'server', keywords: ['server', '500'] },
]

/** Categorize an error from its HTTP status code first, then by matching
 *  keywords in its message, falling back to 'unknown'. */
export function categorizeError(
  error: Error | string,
  statusCode?: number
): ErrorCategory {
  const message = typeof error === 'string' ? error : error.message
  const messageStr = message.toLowerCase()

  if (statusCode != null) {
    if (statusCode >= 500) return 'server'
    const byCode = STATUS_CODE_CATEGORIES[statusCode]
    if (byCode !== undefined) return byCode
  }

  for (const rule of KEYWORD_CATEGORIES) {
    if (rule.keywords.some(k => messageStr.includes(k))) return rule.category
  }

  return 'unknown'
}
