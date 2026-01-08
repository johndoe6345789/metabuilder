/**
 * Tests for retry utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { retryFetch, retry } from './retry'

describe('retry utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  describe('retryFetch', () => {
    it.each([
      { statusCode: 200, shouldRetry: false, description: 'successful request' },
      { statusCode: 404, shouldRetry: false, description: 'client error (not retryable)' },
      { statusCode: 500, shouldRetry: true, description: 'server error (retryable)' },
      { statusCode: 502, shouldRetry: true, description: 'bad gateway (retryable)' },
      { statusCode: 503, shouldRetry: true, description: 'service unavailable (retryable)' },
      { statusCode: 429, shouldRetry: true, description: 'rate limited (retryable)' },
    ])('should handle $description correctly', async ({ statusCode, shouldRetry }) => {
      let callCount = 0
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        const currentCall = callCount++
        return new Response(JSON.stringify({ test: 'data' }), {
          status: shouldRetry ? (currentCall === 0 ? statusCode : 200) : statusCode,
        })
      })

      let responsePromise: Promise<Response>
      if (shouldRetry) {
        responsePromise = retryFetch(mockFetch, { maxRetries: 2, initialDelayMs: 10 })
        // Fast-forward through retry delays
        await vi.advanceTimersByTimeAsync(100)
      } else {
        responsePromise = retryFetch(mockFetch, { maxRetries: 2, initialDelayMs: 10 })
      }
      
      const response = await responsePromise
      
      if (shouldRetry) {
        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(response.status).toBe(200)
      } else {
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(response.status).toBe(statusCode)
      }
    })

    it('should retry up to maxRetries times', async () => {
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      })

      const promise = retryFetch(mockFetch, { maxRetries: 3, initialDelayMs: 10 })
      
      // Fast-forward through all retry delays
      await vi.advanceTimersByTimeAsync(1000)
      
      const response = await promise
      
      expect(mockFetch).toHaveBeenCalledTimes(4) // initial + 3 retries
      expect(response.status).toBe(500)
    })

    it('should use exponential backoff', async () => {
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      })

      const promise = retryFetch(mockFetch, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      })

      // Capture delays by advancing timers incrementally
      for (let i = 0; i < 3; i++) {
        await vi.advanceTimersByTimeAsync(1)
        const delay = 100 * Math.pow(2, i)
        await vi.advanceTimersByTimeAsync(delay)
      }
      
      await promise

      // Verify exponential backoff: 100ms, 200ms, 400ms
      expect(mockFetch).toHaveBeenCalledTimes(4)
    })

    it('should handle network errors with retries', async () => {
      let callCount = 0
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        callCount++
        if (callCount < 3) {
          throw new Error('Network error')
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 })
      })

      const promise = retryFetch(mockFetch, { maxRetries: 3, initialDelayMs: 10 })
      
      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(500)
      
      const response = await promise
      
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(response.status).toBe(200)
    })

    it('should throw error after max retries exceeded', async () => {
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        throw new Error('Network error')
      })

      // Fast-forward through all retry delays
      const promise = retryFetch(mockFetch, { maxRetries: 2, initialDelayMs: 10 })
      // Attach a catch handler to prevent unhandled rejection warning
      promise.catch(() => {})
      await vi.advanceTimersByTimeAsync(500)
      
      await expect(promise).rejects.toThrow('Network error')
      expect(mockFetch).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should respect maxDelayMs', async () => {
      const mockFetch = vi.fn(async () => { // eslint-disable-line @typescript-eslint/require-await
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      })

      const promise = retryFetch(mockFetch, {
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 2000,
        backoffMultiplier: 2,
      })

      // The delays would be: 1000, 2000, 2000 (capped), 2000 (capped), 2000 (capped)
      await vi.advanceTimersByTimeAsync(10000)
      
      await promise

      expect(mockFetch).toHaveBeenCalledTimes(6)
    })
  })

  describe('retry', () => {
    it('should retry async function on failure', async () => {
      let callCount = 0
      // eslint-disable-next-line @typescript-eslint/require-await
      const mockFn = vi.fn(async () => {
        callCount++
        if (callCount < 2) {
          throw new Error('Temporary error')
        }
        return 'success'
      })

      const promise = retry(mockFn, { maxRetries: 2, initialDelayMs: 10 })
      
      await vi.advanceTimersByTimeAsync(500)
      
      const result = await promise
      
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(result).toBe('success')
    })

    it('should return result on first success', async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const mockFn = vi.fn(async () => 'success')

      const result = await retry(mockFn, { maxRetries: 3, initialDelayMs: 10 })
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(result).toBe('success')
    })

    it('should throw after max retries', async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const mockFn = vi.fn(async () => {
        throw new Error('Persistent error')
      })

      // Fast-forward through all retry delays
      const promise = retry(mockFn, { maxRetries: 2, initialDelayMs: 10 })
      // Attach a catch handler to prevent unhandled rejection warning
      promise.catch(() => {})
      await vi.advanceTimersByTimeAsync(500)
      
      await expect(promise).rejects.toThrow('Persistent error')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should use exponential backoff', async () => {
      let callCount = 0
      // eslint-disable-next-line @typescript-eslint/require-await
      const mockFn = vi.fn(async () => {
        callCount++
        if (callCount < 4) {
          throw new Error('Temporary error')
        }
        return 'success'
      })

      const promise = retry(mockFn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      })

      // Advance through all delays: 100ms, 200ms, 400ms
      await vi.advanceTimersByTimeAsync(800)
      
      const result = await promise
      
      expect(mockFn).toHaveBeenCalledTimes(4)
      expect(result).toBe('success')
    })
  })
})
