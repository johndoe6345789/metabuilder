import { describe, it, expect } from 'vitest'
import type { User } from '../types'
import { validateUserCreate } from './validate-user-create'

describe('validateUserCreate', () => {
  it.each([
    {
      name: 'missing fields',
      data: {},
      expected: ['Username is required', 'Email is required', 'Role is required'],
    },
    {
      name: 'invalid fields',
      data: {
        username: 'bad name',
        email: 'bad@',
        role: 'owner' as User['role'],
      },
      expected: [
        'Invalid username format (alphanumeric, underscore, hyphen only, 1-50 chars)',
        'Invalid email format',
        'Invalid role',
      ],
    },
    {
      name: 'valid fields',
      data: {
        username: 'user_1',
        email: 'user@example.com',
        role: 'admin',
      },
      expected: [],
    },
  ])('returns errors for $name', ({ data, expected }) => {
    expect(validateUserCreate(data)).toEqual(expected)
  })
})
