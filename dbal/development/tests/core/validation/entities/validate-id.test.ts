import { describe, it, expect } from 'vitest'
import { validateId } from '../../../src/core/validation/validate-id'

describe('validateId', () => {
  it.each([
    { id: '550e8400-e29b-41d4-a716-446655440000', expected: [], description: 'valid UUID' },
    { id: '', expected: ['ID cannot be empty'], description: 'empty string' },
    { id: '   ', expected: ['ID cannot be empty'], description: 'whitespace only' },
    { id: 'id-123', expected: ['ID must be a valid UUID'], description: 'non-uuid' },
  ])('returns errors for $description', ({ id, expected }) => {
    expect(validateId(id)).toEqual(expected)
  })
})
