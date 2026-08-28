import { describe, expect, it } from 'vitest'

import { WorkflowErrorCode } from './error-codes'
import { ERROR_HINTS } from './error-hints'
import { ERROR_MESSAGES } from './error-messages'
import { ERROR_STATUS_MAP } from './error-status'

const codes = Object.values(WorkflowErrorCode)

/**
 * Three tables are keyed by one enum. Adding a code and forgetting a table is
 * the easy mistake, and it does not fail to compile -- it ships `undefined`
 * as an HTTP status, or a message reading "undefined", to a real caller.
 */
describe('error catalog completeness', () => {
  it('has codes to check', () => {
    expect(codes.length).toBeGreaterThan(0)
  })

  it.each(codes)('%s has an HTTP status', code => {
    expect(typeof ERROR_STATUS_MAP[code]).toBe('number')
  })

  it.each(codes)('%s has a message', code => {
    expect(ERROR_MESSAGES[code]).toBeTruthy()
  })

  it.each(codes)('%s has a hint', code => {
    expect(ERROR_HINTS[code]).toBeTruthy()
  })

  it('has no table entry for a code that no longer exists', () => {
    const known = new Set<string>(codes)
    for (const table of [ERROR_STATUS_MAP, ERROR_MESSAGES, ERROR_HINTS]) {
      for (const key of Object.keys(table)) {
        expect(known.has(key)).toBe(true)
      }
    }
  })
})
