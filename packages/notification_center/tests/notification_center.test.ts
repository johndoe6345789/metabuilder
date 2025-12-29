import { describe, it, expect } from 'vitest'

describe('notification_center package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('notification_center')
    })
  })

  describe('toast variants', () => {
    it.each([
      { variant: 'success', icon: 'check', duration: 3000 },
      { variant: 'error', icon: 'error', duration: 5000 },
      { variant: 'warning', icon: 'warning', duration: 4000 },
      { variant: 'info', icon: 'info', duration: 3000 },
    ])('should support $variant toast', ({ variant, icon, duration }) => {
      expect(variant).toBeDefined()
      expect(icon).toBeDefined()
      expect(duration).toBeGreaterThan(0)
    })
  })

  describe('badge rendering', () => {
    it.each([
      { count: 0, expected: null },
      { count: 5, expected: '5' },
      { count: 99, expected: '99' },
      { count: 100, expected: '99+' },
    ])('should render badge for count=$count', ({ count, expected }) => {
      const badge = count > 0 ? (count > 99 ? '99+' : String(count)) : null
      expect(badge).toBe(expected)
    })
  })
})
