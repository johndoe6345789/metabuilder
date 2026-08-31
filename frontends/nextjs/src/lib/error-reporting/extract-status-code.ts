/** Pulls an HTTP status code out of a plain error message like
 *  "Request failed with status 404" -- the only status codes these
 *  errors actually carry, since they come from string-based clients. */
export function extractStatusCode(error: Error | string): number | undefined {
  const message = typeof error === 'string' ? error : error.message
  const match = message.match(/(\d{3})/)
  return match?.[1] != null ? parseInt(match[1], 10) : undefined
}
