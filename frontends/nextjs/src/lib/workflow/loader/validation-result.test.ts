import { describe, expect, it } from 'vitest'

import { failedResult, passedResult } from './validation-result'

describe('passedResult', () => {
  it('is valid with nothing to report', () => {
    const result = passedResult(12)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result._validationTime).toBe(12)
  })
})

describe('failedResult', () => {
  it('carries the error message at the root', () => {
    const result = failedResult(new Error('boom'), 'VALIDATION_FAILED', 3)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatchObject({
      path: 'root',
      message: 'Validation failed: boom',
      severity: 'error',
      code: 'VALIDATION_FAILED',
    })
    expect(result._validationTime).toBe(3)
  })

  it('distinguishes a rule failure from an exception', () => {
    expect(
      failedResult(new Error('x'), 'VALIDATION_EXCEPTION').errors[0]?.code
    ).toBe('VALIDATION_EXCEPTION')
  })

  it.each([
    ['a string', 'plain failure', 'Validation failed: plain failure'],
    ['null', null, 'Validation failed: null'],
    ['a number', 42, 'Validation failed: 42'],
  ])('describes %s', (_label, thrown, expected) => {
    expect(failedResult(thrown, 'VALIDATION_FAILED').errors[0]?.message).toBe(
      expected
    )
  })

  // A batch failure has no duration to report; the field is left off
  // rather than reported as zero milliseconds.
  it('omits the timing when there is none', () => {
    expect(failedResult(new Error('x'), 'VALIDATION_EXCEPTION')).not.toEqual(
      expect.objectContaining({ _validationTime: expect.anything() })
    )
  })
})
