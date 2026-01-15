import { describe, it, expect } from 'vitest'
import { validateUserUpdate } from '../../../../../src/core/validation/validate-user-update'

describe('validateUserUpdate', () => {
  it.each([
    { data: {}, expected: [], description: 'no updates' },
    {
      data: { username: 'bad name' },
      expected: ['Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)'],
      description: 'invalid username',
    },
    {
      data: { email: 'invalid' },
      expected: ['Invalid email format (max 255 chars)'],
      description: 'invalid email',
    },
    {
      data: { role: 'owner' },
      expected: ['Invalid role'],
      description: 'invalid role',
    },
    {
      data: { username: 'user', email: 'user@example.com', role: 'admin' },
      expected: [],
      description: 'valid updates',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validateUserUpdate(data)).toEqual(expected)
  })
})
