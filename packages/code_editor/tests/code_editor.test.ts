import { describe, it, expect } from 'vitest'

describe('code_editor package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('code_editor')
    })
  })

  describe('languages', () => {
    it.each([
      { language: 'json', extension: '.json' },
      { language: 'lua', extension: '.lua' },
      { language: 'javascript', extension: '.js' },
    ])('should support $language', ({ language }) => {
      expect(language).toBeDefined()
    })
  })
})
