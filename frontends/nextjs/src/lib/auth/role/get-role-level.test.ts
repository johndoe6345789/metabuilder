import { describe, expect,it } from 'vitest'

import type { UserRole } from '../types/level-types'
import { getRoleLevel } from './get-role-level'

describe('getRoleLevel', () => {
  it.each([
    ['public', 1],
    ['user', 2],
    ['moderator', 3],
    ['admin', 4],
    ['god', 5],
    ['supergod', 6],
  ] as const)('maps %s to level %i', (role, expected) => {
    expect(getRoleLevel(role as UserRole)).toBe(expected)
  })
})
