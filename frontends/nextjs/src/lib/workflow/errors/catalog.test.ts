import { describe, expect, it } from 'vitest'

import {
  FALLBACK_MESSAGE,
  FALLBACK_STATUS,
  hintFor,
  isClientError,
  messageFor,
  statusFor,
} from './catalog'
import { WorkflowErrorCode } from './error-codes'

describe('catalog lookups', () => {
  it('returns the mapped status and message for a known code', () => {
    expect(statusFor(WorkflowErrorCode.VALIDATION_ERROR)).toBe(400)
    expect(messageFor(WorkflowErrorCode.VALIDATION_ERROR)).toBe(
      'Workflow validation failed'
    )
  })

  it('falls back rather than answering with undefined', () => {
    // What happens if a code is ever added without its tables: a generic 500
    // beats a response with no status and the word "undefined" in it.
    const unknown = 'NOT_A_REAL_CODE' as WorkflowErrorCode
    expect(statusFor(unknown)).toBe(FALLBACK_STATUS)
    expect(messageFor(unknown)).toBe(FALLBACK_MESSAGE)
  })

  it('gives an empty hint rather than inventing advice', () => {
    expect(hintFor('NOT_A_REAL_CODE' as WorkflowErrorCode)).toBe('')
  })
})

describe('isClientError', () => {
  it('is true for a fault the caller can fix', () => {
    expect(isClientError(WorkflowErrorCode.VALIDATION_ERROR)).toBe(true)
  })

  it('is false for an unknown code, which falls back to 500', () => {
    expect(isClientError('NOT_A_REAL_CODE' as WorkflowErrorCode)).toBe(false)
  })

  it('splits every code cleanly into client and server faults', () => {
    // No code should map to a status outside 4xx/5xx: a workflow error
    // answering 200 or 302 would be a bug in the table.
    for (const code of Object.values(WorkflowErrorCode)) {
      const status = statusFor(code)
      expect(status).toBeGreaterThanOrEqual(400)
      expect(status).toBeLessThan(600)
    }
  })
})
