import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Footer Metadata', () => {
  it('should have valid structure', () => {
    expect(metadata.packageId).toBe('ui_footer')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
  it('should export AppFooter component', () => {
    expect(metadata.exports.components).toContain('AppFooter')
  })
})
