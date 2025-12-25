import { describe, it, expect } from 'vitest'
import { validateId } from './validate-id'

describe('validateId', () => {
  it.each([
    { name: 'valid', id: 'abc123', expected: [] },
    { name: 'empty', id: '', expected: ['ID cannot be empty'] },
    { name: 'whitespace', id: '   ', expected: ['ID cannot be empty'] },
  ])('returns errors for $name', ({ id, expected }) => {
    expect(validateId(id)).toEqual(expected)
  })
})
