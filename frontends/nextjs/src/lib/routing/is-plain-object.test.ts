import { describe, expect, it } from 'vitest'

import { isPlainObject } from './is-plain-object'

describe('isPlainObject', () => {
  it('accepts a plain object', () => {
    expect(isPlainObject({ a: 1 })).toBe(true)
  })

  it.each([null, undefined, 'str', 42, true, [1, 2]])(
    'rejects %p',
    value => {
      expect(isPlainObject(value)).toBe(false)
    }
  )
})
