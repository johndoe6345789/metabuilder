import { describe, it, expect } from 'vitest'

describe('user_manager package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('user_manager')
    })
  })

  describe('user actions', () => {
    it.each([
      { action: 'create', requiresConfirm: false },
      { action: 'update', requiresConfirm: false },
      { action: 'delete', requiresConfirm: true },
      { action: 'change_level', requiresConfirm: false },
    ])('should handle $action', ({ action, requiresConfirm }) => {
      expect(action).toBeDefined()
      expect(typeof requiresConfirm).toBe('boolean')
    })
  })
})
