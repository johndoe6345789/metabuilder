import { describe, it, expect } from 'vitest'
import { validateUserCreate } from '../../../src/core/validation/validate-user-create'

describe('validateUserCreate', () => {
  it.each([
    {
      data: {},
      expected: ['Username is required', 'Email is required', 'Role is required'],
      description: 'missing required fields',
    },
    {
      data: { username: 'bad name', email: 'user@example.com', role: 'user' },
      expected: ['Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)'],
      description: 'invalid username',
    },
    {
      data: { username: 'user', email: 'invalid', role: 'user' },
      expected: ['Invalid email format (max 255 chars)'],
      description: 'invalid email',
    },
    {
      data: { username: 'user', email: 'user@example.com', role: 'owner' },
      expected: ['Invalid role'],
      description: 'invalid role',
    },
    {
      data: { username: 'user', email: 'user@example.com', role: 'admin' },
      expected: [],
      description: 'valid payload',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validateUserCreate(data)).toEqual(expected)
  })
})
