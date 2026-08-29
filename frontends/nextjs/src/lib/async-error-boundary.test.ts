import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createRetryableOperation,
  tryAsyncOperation,
  useAsyncErrorHandler,
  withAsyncErrorBoundary,
} from './async-error-boundary'

/** Fails the first `failures` calls, then succeeds. */
function flaky(failures: number, value = 'ok') {
  let left = failures
  return vi.fn(async () => {
    if (left > 0) {
      left -= 1
      throw new Error(`fail ${failures - left}`)
    }
    return value
  })
}

const noReport = { reportError: false, initialDelayMs: 0 }

describe('withAsyncErrorBoundary', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('success', () => {
    it('returns the value without retrying', async () => {
      const op = flaky(0)

      await expect(withAsyncErrorBoundary(op, noReport)).resolves.toBe('ok')
      expect(op).toHaveBeenCalledTimes(1)
    })

    it('recovers after a transient failure', async () => {
      const op = flaky(2)

      await expect(withAsyncErrorBoundary(op, noReport)).resolves.toBe('ok')
      expect(op).toHaveBeenCalledTimes(3)
    })

    it('reports the attempt count on a late success', async () => {
      const onRetrySuccess = vi.fn()

      await withAsyncErrorBoundary(flaky(1), { ...noReport, onRetrySuccess })

      expect(onRetrySuccess).toHaveBeenCalledWith(1)
    })

    it('does not call onRetrySuccess when it worked first time', async () => {
      const onRetrySuccess = vi.fn()

      await withAsyncErrorBoundary(flaky(0), { ...noReport, onRetrySuccess })

      expect(onRetrySuccess).not.toHaveBeenCalled()
    })
  })

  describe('exhausting retries', () => {
    it('throws the last error', async () => {
      await expect(
        withAsyncErrorBoundary(flaky(99), { ...noReport, maxRetries: 2 })
      ).rejects.toThrow('fail 3')
    })

    it('makes maxRetries + 1 attempts in total', async () => {
      const op = flaky(99)

      await expect(
        withAsyncErrorBoundary(op, { ...noReport, maxRetries: 2 })
      ).rejects.toThrow()

      expect(op).toHaveBeenCalledTimes(3)
    })

    it('makes exactly one attempt when retries are disabled', async () => {
      const op = flaky(99)

      await expect(
        withAsyncErrorBoundary(op, { ...noReport, maxRetries: 0 })
      ).rejects.toThrow()

      expect(op).toHaveBeenCalledTimes(1)
    })

    it('wraps a non-Error rejection', async () => {
      const op = vi.fn(async () => Promise.reject('a string'))

      await expect(
        withAsyncErrorBoundary(op, { ...noReport, maxRetries: 0 })
      ).rejects.toThrow('a string')
    })
  })

  describe('callbacks', () => {
    it('reports each failed attempt through onError', async () => {
      const onError = vi.fn()

      await expect(
        withAsyncErrorBoundary(flaky(99), {
          ...noReport,
          maxRetries: 2,
          onError,
        })
      ).rejects.toThrow()

      expect(onError).toHaveBeenCalledTimes(3)
      expect(onError.mock.calls[0][1]).toBe(0)
      expect(onError.mock.calls[2][1]).toBe(2)
    })

    it('announces each retry before it happens', async () => {
      const onRetry = vi.fn()

      await withAsyncErrorBoundary(flaky(2), { ...noReport, onRetry })

      expect(onRetry).toHaveBeenCalledTimes(2)
      expect(onRetry.mock.calls[0][0]).toBe(1)
    })

    it('does not announce a retry after the final failure', async () => {
      const onRetry = vi.fn()

      await expect(
        withAsyncErrorBoundary(flaky(99), {
          ...noReport,
          maxRetries: 1,
          onRetry,
        })
      ).rejects.toThrow()

      // Two attempts, one retry between them -- not two.
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('timeout', () => {
    it('rejects an operation that runs too long', async () => {
      const slow = vi.fn(
        () => new Promise(resolve => setTimeout(resolve, 10_000))
      )

      await expect(
        withAsyncErrorBoundary(slow as never, {
          ...noReport,
          maxRetries: 0,
          timeoutMs: 20,
        })
      ).rejects.toThrow('timed out')
    })

    it('leaves a fast operation alone', async () => {
      await expect(
        withAsyncErrorBoundary(flaky(0), {
          ...noReport,
          timeoutMs: 5000,
        })
      ).resolves.toBe('ok')
    })
  })
})

describe('tryAsyncOperation', () => {
  it('reports success with the value', async () => {
    await expect(tryAsyncOperation(flaky(0), noReport)).resolves.toEqual({
      success: true,
      data: 'ok',
    })
  })

  it('never rejects, reporting the failure instead', async () => {
    const result = await tryAsyncOperation(flaky(99), {
      ...noReport,
      maxRetries: 1,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBeInstanceOf(Error)
  })

  it('always reports attempt 0, whatever actually happened', async () => {
    // `lastAttempt` is a hardcoded 0 in the implementation, so this field
    // carries no information. Pinned so a fix is a visible change here.
    const result = await tryAsyncOperation(flaky(99), {
      ...noReport,
      maxRetries: 3,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.attempt).toBe(0)
  })
})

describe('createRetryableOperation', () => {
  it('applies the default options', async () => {
    const op = flaky(99)
    const run = createRetryableOperation(op, { ...noReport, maxRetries: 0 })

    await expect(run()).rejects.toThrow()
    expect(op).toHaveBeenCalledTimes(1)
  })

  it('lets a call override the defaults', async () => {
    const op = flaky(99)
    const run = createRetryableOperation(op, { ...noReport, maxRetries: 0 })

    await expect(run({ ...noReport, maxRetries: 2 })).rejects.toThrow()
    expect(op).toHaveBeenCalledTimes(3)
  })
})

describe('useAsyncErrorHandler', () => {
  it('exposes the three entry points', () => {
    const handler = useAsyncErrorHandler()

    expect(typeof handler.execute).toBe('function')
    expect(typeof handler.fetchWithRetry).toBe('function')
    expect(typeof handler.tryOperation).toBe('function')
  })
})
