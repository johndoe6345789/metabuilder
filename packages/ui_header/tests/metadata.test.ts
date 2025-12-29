import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Header Metadata', () => {
  it('should have valid structure', () => {
    expect(metadata.packageId).toBe('ui_header')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
  it('should export AppHeader component', () => {
    expect(metadata.exports.components).toContain('AppHeader')
  })
})
