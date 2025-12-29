import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Pages Bundle Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('ui_pages')
    expect(metadata.name).toBe('UI Pages Bundle')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should depend on ui_permissions', () => {
    expect(metadata.dependencies).toContain('ui_permissions')
  })

  it('should depend on ui_header', () => {
    expect(metadata.dependencies).toContain('ui_header')
  })

  it('should depend on ui_footer', () => {
    expect(metadata.dependencies).toContain('ui_footer')
  })

  it('should depend on ui_intro', () => {
    expect(metadata.dependencies).toContain('ui_intro')
  })

  it('should depend on ui_login', () => {
    expect(metadata.dependencies).toContain('ui_login')
  })

  it('should depend on ui_home', () => {
    expect(metadata.dependencies).toContain('ui_home')
  })

  it('should depend on all level packages', () => {
    expect(metadata.dependencies).toContain('ui_level2')
    expect(metadata.dependencies).toContain('ui_level3')
    expect(metadata.dependencies).toContain('ui_level4')
    expect(metadata.dependencies).toContain('ui_level5')
  })

  it('should be in ui category', () => {
    expect(metadata.category).toBe('ui')
  })
})
