/**
 * Rate Limiting Middleware for MetaBuilder
 *
 * Implements sliding window rate limiting to prevent:
 * - Brute-force attacks on login endpoint
 * - User enumeration attacks
 * - DoS attacks on public endpoints
 *
 * Storage: in-memory (single process). For production with multiple
 * instances, use a Redis-backed RateLimitStore instead.
 */

export type { RateLimitStore } from './rate-limit/store'
export type { RateLimitConfig } from './rate-limit/create-rate-limiter'
export { createRateLimiter } from './rate-limit/create-rate-limiter'
export type { RateLimitEndpoint } from './rate-limit/configs'
export { rateLimiters } from './rate-limit/rate-limiters'
export { applyRateLimit } from './rate-limit/apply-rate-limit'
export type { RateLimitStatus } from './rate-limit/rate-limit-status'
export { getRateLimitStatus } from './rate-limit/rate-limit-status'
export { resetRateLimit } from './rate-limit/reset-rate-limit'
