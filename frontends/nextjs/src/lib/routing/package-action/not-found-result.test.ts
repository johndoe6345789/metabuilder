import { describe, expect, it } from 'vitest'

import { notFoundResult } from './not-found-result'

describe('notFoundResult', () => {
  it('includes the message by default', () => {
    expect(notFoundResult('gone')).toEqual({
      success: false,
      error: 'gone',
      code: 'NOT_FOUND',
    })
  })

  it('hides the message when a fallback is allowed', () => {
    expect(notFoundResult('gone', true)).toEqual({
      success: false,
      code: 'NOT_FOUND',
    })
  })
})
