/** Payload-only JWT decoding -- NOT signature verification. Safe here
 * because this only ever reads a claim (sub, exp) from a token this same
 * browser just received directly from DBAL over TLS; it's never used to
 * trust a token's authenticity for an authorization decision (the backend
 * that actually enforces access re-verifies the signature server-side). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payloadSegment = token.split('.')[1]
  if (payloadSegment === undefined) {
    throw new Error('Malformed JWT: missing payload segment')
  }
  return JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = decodeJwtPayload(token)
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
