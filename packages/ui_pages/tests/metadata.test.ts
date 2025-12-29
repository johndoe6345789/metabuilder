import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Pages Bundle Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('ui_pages')
    expect(metadata.name).toBe('UI Pages Bundle')
    expect(metadata.version).toBeDefined()
    expect(metadata.description).toBeDefined()
  })

  it('should have correct package ID format', () => {
    expect(metadata.packageId).toMatch(/^[a-z_]+$/)
  })

  it('should have semantic version', () => {
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should depend on ui_permissions', () => {
    expect(metadata.dependencies).toContain('ui_permissions')
  })

  it('should depend on ui_login', () => {
    expect(metadata.dependencies).toContain('ui_login')
  })

  it('should depend on ui_home', () => {
    expect(metadata.dependencies).toContain('ui_home')
  })

  it('should be in ui category', () => {
    expect(metadata.category).toBe('ui')
  })
})
