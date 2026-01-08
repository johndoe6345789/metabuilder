/**
 * Utility for retrying failed API requests
 * 
 * Provides exponential backoff retry logic for transient failures
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableStatusCodes?: number[]
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt)
  return Math.min(delay, options.maxDelayMs)
}

/**
 * Check if status code is retryable
 */
function isRetryable(statusCode: number, retryableStatusCodes: number[]): boolean {
  return retryableStatusCodes.includes(statusCode)
}

/**
 * Retry a fetch request with exponential backoff
 * 
 * @param fn - Function that returns a fetch promise
 * @param options - Retry options
 * @returns Promise that resolves with the response or rejects after all retries
 */
export async function retryFetch(
  fn: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fn()
      
      // If response is ok or not retryable, return it
      if (response.ok || !isRetryable(response.status, opts.retryableStatusCodes)) {
        return response
      }
      
      // If this was the last attempt, return the failed response
      if (attempt === opts.maxRetries) {
        return response
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // If this was the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    }
  }
  
  // Should never reach here, but TypeScript requires it
  throw lastError ?? new Error('Retry failed')
}

/**
 * Retry an async function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise that resolves with the result or rejects after all retries
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // If this was the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    }
  }
  
  // Should never reach here, but TypeScript requires it
  throw lastError ?? new Error('Retry failed')
}
