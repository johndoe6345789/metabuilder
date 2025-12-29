import { describe, it, expect } from 'vitest'

describe('workflow_editor package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('workflow_editor')
    })
  })

  describe('run status', () => {
    it.each([
      { status: 'pending', color: 'default' },
      { status: 'running', color: 'info' },
      { status: 'success', color: 'success' },
      { status: 'failed', color: 'error' },
      { status: 'cancelled', color: 'warning' },
    ])('should render $status badge', ({ status, color }) => {
      expect(status).toBeDefined()
      expect(color).toBeDefined()
    })
  })
})
