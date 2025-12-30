import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PackageSourceConfig, PackageIndexEntry, PackageData } from './package-source-types'
import { DEFAULT_LOCAL_SOURCE, DEFAULT_REMOTE_SOURCE } from './package-source-types'

describe('package-source-types', () => {
  describe('DEFAULT_LOCAL_SOURCE', () => {
    it.each([
      { property: 'id', expected: 'local' },
      { property: 'name', expected: 'Local Packages' },
      { property: 'type', expected: 'local' },
      { property: 'url', expected: '/packages' },
      { property: 'priority', expected: 0 },
      { property: 'enabled', expected: true },
    ])('should have correct $property', ({ property, expected }) => {
      expect(DEFAULT_LOCAL_SOURCE[property as keyof PackageSourceConfig]).toBe(expected)
    })
  })

  describe('DEFAULT_REMOTE_SOURCE', () => {
    it.each([
      { property: 'id', expected: 'metabuilder-registry' },
      { property: 'name', expected: 'MetaBuilder Registry' },
      { property: 'type', expected: 'remote' },
      { property: 'priority', expected: 10 },
      { property: 'enabled', expected: false },
    ])('should have correct $property', ({ property, expected }) => {
      expect(DEFAULT_REMOTE_SOURCE[property as keyof PackageSourceConfig]).toBe(expected)
    })

    it('should have https URL', () => {
      expect(DEFAULT_REMOTE_SOURCE.url).toMatch(/^https:\/\//)
    })
  })
})

describe('PackageSourceConfig interface', () => {
  it('should allow valid local config', () => {
    const config: PackageSourceConfig = {
      id: 'test-local',
      name: 'Test Local',
      type: 'local',
      url: '/custom-packages',
      priority: 5,
      enabled: true,
    }
    expect(config.type).toBe('local')
  })

  it('should allow valid remote config with auth', () => {
    const config: PackageSourceConfig = {
      id: 'test-remote',
      name: 'Test Remote',
      type: 'remote',
      url: 'https://example.com/api',
      priority: 10,
      enabled: true,
      authToken: 'secret-token',
    }
    expect(config.authToken).toBe('secret-token')
  })

  it('should allow git config with branch', () => {
    const config: PackageSourceConfig = {
      id: 'test-git',
      name: 'Test Git',
      type: 'git',
      url: 'https://github.com/org/repo',
      priority: 20,
      enabled: true,
      branch: 'main',
    }
    expect(config.branch).toBe('main')
  })
})

describe('PackageIndexEntry interface', () => {
  it('should represent a complete package entry', () => {
    const entry: PackageIndexEntry = {
      packageId: 'test-package',
      name: 'Test Package',
      version: '1.0.0',
      description: 'A test package',
      author: 'Test Author',
      category: 'testing',
      dependencies: ['dep1', 'dep2'],
      minLevel: 2,
      sourceId: 'local',
      icon: 'test-icon.svg',
      checksum: 'abc123',
    }
    expect(entry.packageId).toBe('test-package')
    expect(entry.dependencies).toHaveLength(2)
  })

  it('should allow minimal entry without optional fields', () => {
    const entry: PackageIndexEntry = {
      packageId: 'minimal',
      name: 'Minimal',
      version: '0.1.0',
      description: 'Minimal package',
      author: 'Anonymous',
      category: 'other',
      dependencies: [],
      minLevel: 1,
      sourceId: 'local',
    }
    expect(entry.icon).toBeUndefined()
    expect(entry.checksum).toBeUndefined()
  })
})

describe('PackageData interface', () => {
  it('should represent complete package data', () => {
    const data: PackageData = {
      metadata: {
        packageId: 'complete',
        name: 'Complete Package',
        version: '2.0.0',
        description: 'A complete package',
        author: 'Author',
        category: 'complete',
        dependencies: [],
        minLevel: 1,
        sourceId: 'local',
      },
      components: [{ id: 'component1', type: 'button' }],
      scripts: 'local M = {}; return M',
      scriptFiles: [
        { name: 'init', path: 'scripts/init.lua', code: 'return true' },
      ],
      examples: { demo: { title: 'Demo' } },
    }
    expect(data.components).toHaveLength(1)
    expect(data.scriptFiles).toHaveLength(1)
  })
})
