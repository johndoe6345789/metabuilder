/**
 * Rate Limiter - CodeForge-specific rate limiting configuration
 *
 * Re-exports the generic rate limiter from @metabuilder/services
 * with CodeForge-specific singleton instances.
 */

export {
  RateLimiter,
  aiRateLimiter,
  scanRateLimiter,
  apiRateLimiter,
} from '@metabuilder/services';

export type {
  RateLimitConfig,
  RateLimitStatus,
  Priority,
} from '@metabuilder/services';
