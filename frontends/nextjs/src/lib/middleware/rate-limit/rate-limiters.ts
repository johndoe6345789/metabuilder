import { createRateLimiter } from './create-rate-limiter'
import { RATE_LIMIT_CONFIGS, type RateLimitEndpoint } from './configs'

type Limiter = ReturnType<typeof createRateLimiter>

/** One limiter per endpoint type, built from RATE_LIMIT_CONFIGS. */
export const rateLimiters = Object.fromEntries(
  Object.entries(RATE_LIMIT_CONFIGS).map(([endpoint, config]) => [
    endpoint,
    createRateLimiter(config),
  ])
) as Record<RateLimitEndpoint, Limiter>
