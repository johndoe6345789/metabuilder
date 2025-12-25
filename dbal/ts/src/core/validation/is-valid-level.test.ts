import { describe, expect, it } from 'vitest'
import { isValidLevel } from './is-valid-level'

describe('isValidLevel', () => {
  it.each([
    { level: 1 },
    { level: 5 },
  ])('accepts level $level', ({ level }) => {
    expect(isValidLevel(level)).toBe(true)
  })

  it.each([
    { level: 0 },
    { level: 6 },
    { level: 2.5 },
  ])('rejects level $level', ({ level }) => {
    expect(isValidLevel(level)).toBe(false)
  })
})
