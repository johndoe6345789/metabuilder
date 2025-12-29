import { describe, expect,it } from 'vitest'

import { hashPassword } from './hash-password'

describe('hashPassword', () => {
  it.each([
    { password: 'test123', description: 'simple password' },
    { password: 'P@ssw0rd!', description: 'complex password' },
    { password: '', description: 'empty password' },
    { password: 'a'.repeat(100), description: 'long password' },
  ])('should hash $description consistently', async ({ password }) => {
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(128) // SHA-512 produces 128 hex chars
    expect(hash1).toMatch(/^[a-f0-9]+$/)
  })

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')

    expect(hash1).not.toBe(hash2)
  })
})
