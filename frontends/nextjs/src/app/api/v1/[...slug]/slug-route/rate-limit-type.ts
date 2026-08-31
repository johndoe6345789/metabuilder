import type { NextRequest } from 'next/server'

export type RateLimitType =
  | 'login'
  | 'register'
  | 'list'
  | 'mutation'
  | 'public'

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

/** Login/register get their own tighter limits; everything else falls
 *  back to a read/write split by HTTP method. */
export function determineRateLimitType(request: NextRequest): RateLimitType {
  const pathMatch = request.url.match(/\/api\/v1\/[^/]+\/([^/]+)\/([^/]+)/)
  const isLogin =
    pathMatch !== null && pathMatch[1] === 'auth' && pathMatch[2] === 'login'
  const isRegister =
    pathMatch !== null &&
    pathMatch[1] === 'auth' &&
    pathMatch[2] === 'register'

  if (isLogin) return 'login'
  if (isRegister) return 'register'
  if (request.method === 'GET') return 'list'
  if (MUTATING_METHODS.includes(request.method)) return 'mutation'
  return 'public'
}
