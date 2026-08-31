import type { RateLimitConfig } from './create-rate-limiter'

export type RateLimitEndpoint =
  | 'login'
  | 'register'
  | 'list'
  | 'mutation'
  | 'public'
  | 'bootstrap'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/** The one table of per-endpoint limits -- rateLimiters and
 *  getRateLimitStatus both read from this, so a policy change (or a
 *  status check) can never drift out of sync with the real limiter. */
export const RATE_LIMIT_CONFIGS: Record<
  RateLimitEndpoint,
  Pick<RateLimitConfig, 'limit' | 'window'>
> = {
  // 5 attempts/min per IP -- prevents brute-force attacks.
  login: { limit: 5, window: MINUTE },
  // 3/min -- stricter than login, to slow account-enumeration attempts.
  register: { limit: 3, window: MINUTE },
  // 100/min -- allows normal listing while limiting scraping.
  list: { limit: 100, window: MINUTE },
  // 50/min -- create/update/delete, tighter than reads.
  mutation: { limit: 50, window: MINUTE },
  // 1000/hour -- generous default for public endpoints.
  public: { limit: 1000, window: HOUR },
  // 1/hour -- system initialization should only ever happen once.
  bootstrap: { limit: 1, window: HOUR },
}
