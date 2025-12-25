// TODO: Load rate limit settings from config/DB instead of hardcoding.
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS_PER_WINDOW = 100

const rateLimitMap = new Map<string, number[]>()

export { RATE_LIMIT_WINDOW, MAX_REQUESTS_PER_WINDOW, rateLimitMap }
