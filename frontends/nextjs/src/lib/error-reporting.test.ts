/**
 * Tests for Error Reporting Service
 */

import { errorReporting, type ErrorCategory } from './error-reporting'

describe('ErrorReporting Service', () => {
  beforeEach(() => {
    errorReporting.clearErrors()
  })

  describe('Error Categorization', () => {
    const testCases: Array<[string, ErrorCategory]> = [
      // Network errors
      ['Network connection failed', 'network'],
      ['fetch error', 'network'],
      ['offline error', 'network'],

      // Authentication errors
      ['401 Unauthorized', 'authentication'],
      ['auth required', 'authentication'],
      ['unauthorized access', 'authentication'],

      // Permission errors
      ['403 Forbidden', 'permission'],
      ['permission denied', 'permission'],
      ['forbidden', 'permission'],

      // Validation errors
      ['400 Bad Request', 'validation'],
      ['validation error', 'validation'],
      ['invalid input', 'validation'],

      // Not found errors
      ['404 Not Found', 'not-found'],
      ['not found', 'not-found'],

      // Conflict errors
      ['409 Conflict', 'conflict'],
      ['conflict error', 'conflict'],
      ['duplicate', 'conflict'],

      // Rate limit errors
      ['429 Too Many Requests', 'rate-limit'],
      ['rate limit', 'rate-limit'],
      ['too many requests', 'rate-limit'],

      // Server errors
      ['500 Internal Server Error', 'server'],
      ['502 Bad Gateway', 'server'],
      ['503 Service Unavailable', 'server'],
      ['504 Gateway Timeout', 'server'],

      // Timeout errors
      ['408 Request Timeout', 'timeout'],
      ['timeout', 'timeout'],
      ['timed out', 'timeout'],

      // Unknown errors
      ['Some random error', 'unknown'],
    ]

    testCases.forEach(([message, expectedCategory]) => {
      test(`categorizes "${message}" as ${expectedCategory}`, () => {
        const error = new Error(message)
        const report = errorReporting.reportError(error)
        expect(report.category).toBe(expectedCategory)
      })
    })
  })

  describe('Retry Eligibility', () => {
    const retryableErrors: Array<[string, boolean]> = [
      ['Network error', true],
      ['408 Timeout', true],
      ['429 Rate Limit', true],
      ['500 Server Error', true],
      ['502 Bad Gateway', true],
      ['503 Service Unavailable', true],
      ['504 Gateway Timeout', true],

      // Non-retryable
      ['401 Unauthorized', false],
      ['403 Forbidden', false],
      ['404 Not Found', false],
      ['400 Bad Request', false],
      ['409 Conflict', false],
    ]

    retryableErrors.forEach(([message, shouldBeRetryable]) => {
      test(`"${message}" ${shouldBeRetryable ? 'is' : 'is not'} retryable`, () => {
        const error = new Error(message)
        const report = errorReporting.reportError(error)
        expect(report.isRetryable).toBe(shouldBeRetryable)
      })
    })
  })

  describe('User Messages', () => {
    const messages: Array<[string, string]> = [
      ['Network error', /check.*connection/i],
      ['401 Unauthorized', /log in/i],
      ['403 Forbidden', /permission/i],
      ['404 Not Found', /not found/i],
      ['timeout', /took too long/i],
    ]

    messages.forEach(([errorMsg, expectedPattern]) => {
      test(`generates appropriate message for "${errorMsg}"`, () => {
        const error = new Error(errorMsg)
        const message = errorReporting.getUserMessage(error)
        expect(message).toMatch(expectedPattern)
      })
    })
  })

  describe('Error Reporting', () => {
    test('creates unique IDs for errors', () => {
      const error1 = errorReporting.reportError(new Error('Error 1'))
      const error2 = errorReporting.reportError(new Error('Error 2'))

      expect(error1.id).not.toBe(error2.id)
      expect(error1.id).toMatch(/^err_/)
      expect(error2.id).toMatch(/^err_/)
    })

    test('tracks error timestamps', () => {
      const before = new Date()
      const report = errorReporting.reportError(new Error('Test error'))
      const after = new Date()

      expect(report.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(report.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    test('stores error context', () => {
      const context = { userId: 'user123', action: 'save' }
      const report = errorReporting.reportError(new Error('Test error'), context)

      expect(report.context.userId).toBe('user123')
      expect(report.context.action).toBe('save')
    })

    test('maintains error history', () => {
      errorReporting.reportError(new Error('Error 1'))
      errorReporting.reportError(new Error('Error 2'))
      errorReporting.reportError(new Error('Error 3'))

      const errors = errorReporting.getErrors()
      expect(errors.length).toBe(3)
    })
  })

  describe('Error Queries', () => {
    beforeEach(() => {
      errorReporting.reportError(new Error('Network error'), {})
      errorReporting.reportError(new Error('401 Unauthorized'), {})
      errorReporting.reportError(new Error('503 Service Unavailable'), {})
      errorReporting.reportError(new Error('timeout'), {})
    })

    test('filters errors by category', () => {
      const networkErrors = errorReporting.getErrorsByCategory('network')
      expect(networkErrors.length).toBe(1)
      expect(networkErrors[0]?.message).toContain('Network')
    })

    test('returns retryable errors', () => {
      const retryableErrors = errorReporting.getRetryableErrors()
      expect(retryableErrors.length).toBeGreaterThan(0)
      expect(retryableErrors.every(e => e.isRetryable)).toBe(true)
    })
  })

  describe('Error Limits', () => {
    test('maintains maximum error history', () => {
      // Report more than max errors
      for (let i = 0; i < 150; i++) {
        errorReporting.reportError(new Error(`Error ${i}`))
      }

      const errors = errorReporting.getErrors()
      expect(errors.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Clear History', () => {
    test('clears all errors', () => {
      errorReporting.reportError(new Error('Error 1'))
      errorReporting.reportError(new Error('Error 2'))

      expect(errorReporting.getErrors().length).toBeGreaterThan(0)

      errorReporting.clearErrors()
      expect(errorReporting.getErrors().length).toBe(0)
    })
  })

  describe('String Error Messages', () => {
    test('handles string errors', () => {
      const report = errorReporting.reportError('Simple error message')
      expect(report.message).toBe('Simple error message')
      expect(report.category).toBe('unknown')
    })
  })

  describe('HTTP Status Code Detection', () => {
    test('extracts status codes from error messages', () => {
      const report = errorReporting.reportError(new Error('Error: 429 Too Many Requests'))
      expect(report.statusCode).toBe(429)
      expect(report.category).toBe('rate-limit')
    })
  })

  describe('Suggested Actions', () => {
    const actionTestCases: Array<[ErrorCategory, RegExp]> = [
      ['network', /connection/i],
      ['authentication', /log in/i],
      ['permission', /administrator/i],
      ['validation', /verify/i],
      ['not-found', /no longer exists/i],
      ['conflict', /different name/i],
      ['rate-limit', /wait.*moment/i],
      ['server', /try again later/i],
      ['timeout', /try again/i],
      ['unknown', /try again/i],
    ]

    actionTestCases.forEach(([category, expectedPattern]) => {
      test(`provides suggested action for ${category}`, () => {
        const error = new Error('test')
        const report = errorReporting.reportError(error)

        // Set category manually to test action suggestion
        report.category = category

        expect(report.suggestedAction).toMatch(expectedPattern)
      })
    })
  })
})
