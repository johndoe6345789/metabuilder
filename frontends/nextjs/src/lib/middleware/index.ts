/**
 * Middleware exports for MetaBuilder
 */

export { authenticate, requireAuth } from './auth-middleware'
export type {
  AuthMiddlewareOptions,
  AuthenticatedRequest,
  AuthResult,
} from './auth-middleware'

// Rate limiting
export {
  applyRateLimit,
  createRateLimiter,
  rateLimiters,
  resetRateLimit,
  getRateLimitStatus,
} from './rate-limit'
export type { RateLimitConfig, RateLimitStore } from './rate-limit'
