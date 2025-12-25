import { describe, expect, it } from 'vitest'
import { isValidTitle } from './is-valid-title'

describe('isValidTitle', () => {
  it.each([
    { title: 'Welcome' },
    { title: 'a'.repeat(255) },
  ])('accepts title length %s', ({ title }) => {
    expect(isValidTitle(title)).toBe(true)
  })

  it.each([
    { title: '' },
    { title: 'a'.repeat(256) },
  ])('rejects title length %s', ({ title }) => {
    expect(isValidTitle(title)).toBe(false)
  })
})
