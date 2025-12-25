import { describe, expect, it } from 'vitest'
import { validateId } from './validate-id'

describe('validateId', () => {
  it.each([
    { id: '550e8400-e29b-41d4-a716-446655440000', expected: [] },
  ])('accepts valid id $id', ({ id, expected }) => {
    expect(validateId(id)).toEqual(expected)
  })

  it.each([
    { id: '', message: 'ID cannot be empty' },
    { id: 'not-a-uuid', message: 'ID must be a valid UUID' },
  ])('rejects invalid id $id', ({ id, message }) => {
    expect(validateId(id)).toContain(message)
  })
})
