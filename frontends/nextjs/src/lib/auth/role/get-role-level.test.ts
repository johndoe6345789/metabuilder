import { describe, it, expect } from 'vitest'
import { getRoleLevel } from './get-role-level'
import type { UserRole } from '../types/level-types'

describe('getRoleLevel', () => {
  it.each([
    ['public', 1],
    ['user', 2],
    ['admin', 3],
    ['god', 4],
    ['supergod', 5],
  ] as const)('maps %s to level %i', (role, expected) => {
    expect(getRoleLevel(role as UserRole)).toBe(expected)
  })
})
