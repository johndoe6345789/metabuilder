import { describe, it, expect } from 'vitest'
import { verifyPassword } from './verify-password'
import { hashPassword } from './hash-password'

describe('verifyPassword', () => {
  it.each([{ password: 'test123' }, { password: 'P@ssw0rd!' }, { password: 'simple' }])(
    'should verify correct password "$password"',
    async ({ password }) => {
      const hash = await hashPassword(password)
      const result = await verifyPassword(password, hash)

      expect(result).toBe(true)
    }
  )

  it.each([
    { password: 'correct', wrong: 'incorrect' },
    { password: 'test', wrong: 'TEST' },
    { password: 'pass', wrong: 'pass ' },
  ])('should reject wrong password', async ({ password, wrong }) => {
    const hash = await hashPassword(password)
    const result = await verifyPassword(wrong, hash)

    expect(result).toBe(false)
  })
})
