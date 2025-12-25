import { describe, expect, it } from 'vitest'
import { isValidUuid } from './is-valid-uuid'

describe('isValidUuid', () => {
  it.each([
    { id: '550e8400-e29b-41d4-a716-446655440000' },
    { id: '00000000-0000-0000-0000-000000000000' },
  ])('accepts $id', ({ id }) => {
    expect(isValidUuid(id)).toBe(true)
  })

  it.each([
    { id: 'not-a-uuid' },
    { id: '550e8400e29b41d4a716446655440000' },
    { id: '550e8400-e29b-41d4-a716-44665544000' },
  ])('rejects $id', ({ id }) => {
    expect(isValidUuid(id)).toBe(false)
  })
})
