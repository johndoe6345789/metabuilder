const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 100

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback

  return parsed
}

export const getRateLimitConfig = () => ({
  windowMs: parsePositiveInt(process.env.MB_RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
  maxRequests: parsePositiveInt(process.env.MB_RATE_LIMIT_MAX_REQUESTS, DEFAULT_MAX_REQUESTS_PER_WINDOW),
})

const rateLimitMap = new Map<string, number[]>()

export { DEFAULT_RATE_LIMIT_WINDOW_MS, DEFAULT_MAX_REQUESTS_PER_WINDOW, rateLimitMap }
