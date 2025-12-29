const RATE_LIMIT_WINDOW_KEY = 'rate_limit_window_ms'
const MAX_REQUESTS_KEY = 'rate_limit_max_requests'

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 100

const parsePositiveInt = (value: string | null | undefined, fallback: number): number => {
  if (!value) return fallback

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback

  return parsed
}

const getEnvRateLimitConfig = () => ({
  windowMs: parsePositiveInt(process.env.MB_RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
  maxRequests: parsePositiveInt(
    process.env.MB_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_MAX_REQUESTS_PER_WINDOW
  ),
})

let rateLimitConfig = getEnvRateLimitConfig()
let configLoaded = false
let configLoadPromise: Promise<void> | null = null

export const getRateLimitConfig = () => ({ ...rateLimitConfig })

export async function loadRateLimitConfig(): Promise<void> {
  if (configLoaded) return
  if (configLoadPromise) return configLoadPromise

  configLoadPromise = (async () => {
    try {
      const envConfig = getEnvRateLimitConfig()
      const { getSystemConfigValue } =
        await import('@/lib/db/system-config/get-system-config-value')
      const [windowValue, maxRequestsValue] = await Promise.all([
        getSystemConfigValue(RATE_LIMIT_WINDOW_KEY),
        getSystemConfigValue(MAX_REQUESTS_KEY),
      ])

      rateLimitConfig = {
        windowMs: parsePositiveInt(windowValue, envConfig.windowMs),
        maxRequests: parsePositiveInt(maxRequestsValue, envConfig.maxRequests),
      }
    } catch (error) {
      console.error('Failed to load rate limit config:', error)
      rateLimitConfig = getEnvRateLimitConfig()
    } finally {
      configLoaded = true
    }
  })()

  return configLoadPromise
}

export function resetRateLimitConfig(): void {
  rateLimitConfig = getEnvRateLimitConfig()
  configLoaded = false
  configLoadPromise = null
}

const rateLimitMap = new Map<string, number[]>()

export { DEFAULT_RATE_LIMIT_WINDOW_MS, DEFAULT_MAX_REQUESTS_PER_WINDOW, rateLimitMap }
