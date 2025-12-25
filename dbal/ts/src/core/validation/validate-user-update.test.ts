import { describe, it, expect } from 'vitest'
import type { User } from '../types'
import { validateUserUpdate } from './validate-user-update'

describe('validateUserUpdate', () => {
  it.each([
    { name: 'empty', data: {}, expected: [] },
    {
      name: 'invalid username',
      data: { username: 'bad name' },
      expected: ['Invalid username format'],
    },
    {
      name: 'invalid email',
      data: { email: 'bad@' },
      expected: ['Invalid email format'],
    },
    {
      name: 'invalid role',
      data: { role: 'owner' as User['role'] },
      expected: ['Invalid role'],
    },
    {
      name: 'multiple invalid',
      data: {
        username: 'bad name',
        email: 'bad@',
        role: 'owner' as User['role'],
      },
      expected: ['Invalid username format', 'Invalid email format', 'Invalid role'],
    },
    {
      name: 'valid update',
      data: {
        username: 'user_1',
        email: 'user@example.com',
        role: 'admin',
      },
      expected: [],
    },
  ])('returns errors for $name', ({ data, expected }) => {
    expect(validateUserUpdate(data)).toEqual(expected)
  })
})
