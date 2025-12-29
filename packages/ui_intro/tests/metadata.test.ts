import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('UI Intro Metadata', () => {
  it('should have valid structure', () => {
    expect(metadata.packageId).toBe('ui_intro')
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
  it('should export IntroSection component', () => {
    expect(metadata.exports.components).toContain('IntroSection')
  })
})
