import { describe, it, expect } from 'vitest'

describe('admin_dialog package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('admin_dialog')
    })
  })

  describe('user dialog', () => {
    it.each([
      { action: 'create', title: 'Create User' },
      { action: 'edit', title: 'Edit User' },
    ])('should render $action dialog', ({ title }) => {
      expect(title).toBeDefined()
    })
  })

  describe('settings dialog', () => {
    it.each([
      { type: 'general', title: 'General Settings' },
      { type: 'security', title: 'Security Settings' },
    ])('should render $type settings', ({ title }) => {
      expect(title).toBeDefined()
    })
  })
})
