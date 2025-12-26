import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('Arcade Lobby Package Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('arcade_lobby')
    expect(metadata.name).toBe('Arcade Lobby')
    expect(metadata.version).toBeDefined()
    expect(metadata.description).toBeDefined()
  })

  it('should have correct package ID format', () => {
    expect(metadata.packageId).toMatch(/^[a-z_]+$/)
  })

  it('should have semantic version', () => {
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should have exports defined', () => {
    expect(metadata.exports).toBeDefined()
    expect(metadata.exports.components).toBeInstanceOf(Array)
  })

  it('should have dependencies array', () => {
    expect(metadata.dependencies).toBeInstanceOf(Array)
  })
})
