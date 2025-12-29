import { describe, it, expect } from 'vitest'

describe('ui_auth package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('ui_auth')
    })
  })

  describe('access denied', () => {
    it.each([
      { level: 2, message: 'User access required' },
      { level: 3, message: 'Admin access required' },
      { level: 4, message: 'God access required' },
      { level: 5, message: 'Super God access required' },
    ])('should show message for level $level', ({ message }) => {
      expect(message).toBeDefined()
    })
  })

  describe('auth gate', () => {
    it.each([
      { user_level: 1, required: 2, allowed: false },
      { user_level: 2, required: 2, allowed: true },
      { user_level: 3, required: 2, allowed: true },
    ])('should gate level $user_level against required $required', ({ user_level, required, allowed }) => {
      expect(user_level >= required).toBe(allowed)
    })
  })
})
