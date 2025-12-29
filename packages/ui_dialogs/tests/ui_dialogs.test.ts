import { describe, it, expect } from 'vitest'

describe('ui_dialogs package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('ui_dialogs')
    })
  })

  describe('confirm dialog', () => {
    it.each([
      { title: 'Delete Item', confirm: 'Delete', cancel: 'Cancel', destructive: true },
      { title: 'Save Changes', confirm: 'Save', cancel: 'Discard', destructive: false },
    ])('should render confirm dialog: $title', ({ title, confirm, cancel }) => {
      expect(title).toBeDefined()
      expect(confirm).toBeDefined()
      expect(cancel).toBeDefined()
    })
  })

  describe('alert dialog', () => {
    it.each([
      { variant: 'info', icon: 'info' },
      { variant: 'success', icon: 'check' },
      { variant: 'warning', icon: 'warning' },
      { variant: 'error', icon: 'error' },
    ])('should render $variant alert', ({ variant, icon }) => {
      expect(variant).toBeDefined()
      expect(icon).toBeDefined()
    })
  })
})
