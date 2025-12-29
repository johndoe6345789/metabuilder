import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Level 5 Metadata', () => {
  it('should have valid structure', () => {
    expect(metadata.packageId).toBe('ui_level5')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
  it('should depend on shared packages', () => {
    expect(metadata.dependencies).toContain('ui_permissions')
    expect(metadata.dependencies).toContain('ui_header')
  })
  it('should export level5 page', () => {
    expect(metadata.exports.pages).toContain('level5')
  })
})
