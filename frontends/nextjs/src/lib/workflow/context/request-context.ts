/**
 * Turning an HTTP request into a RequestContext.
 *
 * This used to be a function that took headers and returned null on every
 * path, under a TODO saying a real version would parse the JWT. Decoding
 * a bearer token and believing its claims is not what a real version
 * would do -- a payload-only decode is unsigned input, and this context
 * decides which tenant a run reads and writes. The token is verified
 * against the data layer instead, exactly as every other server route
 * verifies one, which is why this is asynchronous.
 */

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { getRoleLevel } from '@/lib/constants'
import { MAX_USER_LEVEL, MIN_USER_LEVEL } from './context-safety'
import type { RequestContext } from './context-types'

/**
 * The app's roles run 0..5; a workflow's levels run 1..4. A supergod is a
 * super-admin here, not a sixth tier the safety check would reject.
 */
export function toWorkflowLevel(roleLevel: number): number {
  return Math.min(MAX_USER_LEVEL, Math.max(MIN_USER_LEVEL, roleLevel))
}

/** The bearer token in these headers, or null. */
export function bearerToken(
  // Partial, not Record: arbitrary request headers, not every key present.
  headers?: Partial<Record<string, string>> | null
): string | null {
  if (headers == null) return null
  const raw = headers.authorization ?? headers.Authorization ?? ''
  return raw.startsWith('Bearer ') ? raw.slice(7) : null
}

/**
 * The verified caller behind these headers, or null when there is none.
 *
 * A caller with the `public` role (level 0) resolves to null: an
 * unauthenticated request has no workflow context to build.
 */
export async function extractRequestContext(
  headers?: Record<string, string> | null
): Promise<RequestContext | null> {
  const token = bearerToken(headers)
  if (token === null) return null

  const user = await fetchSession(token)
  if (user === null) return null

  // Every field below is optional on User. A session with no id is not a
  // caller this context can be scoped to, so it resolves to null rather
  // than to a run owned by nobody.
  const roleLevel = getRoleLevel(user.role ?? '')
  if (roleLevel < MIN_USER_LEVEL) return null
  if (user.id === undefined || user.id === '') return null

  return {
    tenantId: user.tenantId ?? 'system',
    userId: user.id,
    userEmail: user.email ?? '',
    userLevel: toWorkflowLevel(roleLevel),
    ipAddress: headers?.['x-forwarded-for'],
    userAgent: headers?.['user-agent'],
  }
}
