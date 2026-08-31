import { describe, expect, it } from 'vitest'

import { isTruthy } from './truthiness'

describe('isTruthy', () => {
  it.each([null, undefined, false, 0, ''])('treats %p as false', v => {
    expect(isTruthy(v)).toBe(false)
  })

  it.each([true, 1, 'text', {}, []])('treats %p as true', v => {
    expect(isTruthy(v as never)).toBe(true)
  })
})
