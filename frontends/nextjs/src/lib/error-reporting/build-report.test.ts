import { describe, expect, it } from 'vitest'

import { buildErrorReport } from './build-report'

describe('buildErrorReport', () => {
  it('categorizes and marks retryability from the error', () => {
    const report = buildErrorReport('Network error', {})
    expect(report.category).toBe('network')
    expect(report.isRetryable).toBe(true)
  })

  it('prefers an explicit statusCode in context over one in the message', () => {
    const report = buildErrorReport('404 not found', { statusCode: 500 })
    expect(report.statusCode).toBe(500)
    expect(report.category).toBe('server')
  })

  it('captures the stack only for real Error objects', () => {
    const withStack = buildErrorReport(new Error('boom'), {})
    const withoutStack = buildErrorReport('boom', {})
    expect(withStack.stack).toBeDefined()
    expect(withoutStack.stack).toBeUndefined()
  })

  it('computes suggestedAction lazily from the current category', () => {
    const report = buildErrorReport('Network error', {})
    expect(report.suggestedAction).toBe(
      'Check your internet connection and try again'
    )
    report.category = 'timeout'
    expect(report.suggestedAction).toBe('Request took too long. Please try again')
  })

  it('stamps a code only when context.code is a string', () => {
    expect(buildErrorReport('x', { code: 'E1' }).code).toBe('E1')
    expect(buildErrorReport('x', { code: 42 }).code).toBeUndefined()
  })
})
