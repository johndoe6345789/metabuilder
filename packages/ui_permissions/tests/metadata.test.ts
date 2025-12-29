import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Permissions Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('ui_permissions')
    expect(metadata.name).toBe('UI Permissions')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should have no dependencies', () => {
    expect(metadata.dependencies).toEqual([])
  })

  it('should export scripts', () => {
    expect(metadata.exports.scripts).toContain('permissions')
  })
})
