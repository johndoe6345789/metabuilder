import { describe, it, expect } from 'vitest'
import { validateId } from '../../../src/core/validation/validate-id'

describe('validateId', () => {
  it.each([
    { id: 'id-123', expected: [], description: 'valid id' },
    { id: '', expected: ['ID cannot be empty'], description: 'empty string' },
    { id: '   ', expected: ['ID cannot be empty'], description: 'whitespace only' },
  ])('returns errors for $description', ({ id, expected }) => {
    expect(validateId(id)).toEqual(expected)
  })
})
