import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Home Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('ui_home')
    expect(metadata.name).toBe('Home Page')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should depend on ui_permissions', () => {
    expect(metadata.dependencies).toContain('ui_permissions')
  })

  it('should export level1 page', () => {
    expect(metadata.exports.pages).toContain('level1')
  })
})
