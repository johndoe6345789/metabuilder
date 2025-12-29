import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Login Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('ui_login')
    expect(metadata.name).toBe('Login Page')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should depend on ui_permissions', () => {
    expect(metadata.dependencies).toContain('ui_permissions')
  })

  it('should export login page', () => {
    expect(metadata.exports.pages).toContain('login')
  })
})
