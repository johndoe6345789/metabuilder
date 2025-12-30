import { describe, expect, it, vi } from 'vitest'

import type { PackageRepoConfig } from '../package-repo-config'
import {
  DEFAULT_PACKAGE_REPO_CONFIG,
  DEVELOPMENT_PACKAGE_REPO_CONFIG,
  getPackageRepoConfig,
  PRODUCTION_PACKAGE_REPO_CONFIG,
  validatePackageRepoConfig,
} from '../package-repo-config'

describe('package-repo-config', () => {
  describe('DEFAULT_PACKAGE_REPO_CONFIG', () => {
    it('should have priority conflict resolution', () => {
      expect(DEFAULT_PACKAGE_REPO_CONFIG.conflictResolution).toBe('priority')
    })

    it('should have one local source', () => {
      expect(DEFAULT_PACKAGE_REPO_CONFIG.sources).toHaveLength(1)
      expect(DEFAULT_PACKAGE_REPO_CONFIG.sources[0].type).toBe('local')
    })

    it('should have local source enabled', () => {
      expect(DEFAULT_PACKAGE_REPO_CONFIG.sources[0].enabled).toBe(true)
    })
  })

  describe('DEVELOPMENT_PACKAGE_REPO_CONFIG', () => {
    it('should use local-first conflict resolution', () => {
      expect(DEVELOPMENT_PACKAGE_REPO_CONFIG.conflictResolution).toBe('local-first')
    })

    it('should have two sources', () => {
      expect(DEVELOPMENT_PACKAGE_REPO_CONFIG.sources).toHaveLength(2)
    })

    it('should have local source enabled', () => {
      const local = DEVELOPMENT_PACKAGE_REPO_CONFIG.sources.find((s) => s.id === 'local')
      expect(local?.enabled).toBe(true)
    })

    it('should have staging source disabled by default', () => {
      const staging = DEVELOPMENT_PACKAGE_REPO_CONFIG.sources.find((s) => s.id === 'staging')
      expect(staging?.enabled).toBe(false)
    })
  })

  describe('PRODUCTION_PACKAGE_REPO_CONFIG', () => {
    it('should use latest-version conflict resolution', () => {
      expect(PRODUCTION_PACKAGE_REPO_CONFIG.conflictResolution).toBe('latest-version')
    })

    it('should have local with higher priority than remote', () => {
      const local = PRODUCTION_PACKAGE_REPO_CONFIG.sources.find((s) => s.id === 'local')
      const production = PRODUCTION_PACKAGE_REPO_CONFIG.sources.find((s) => s.id === 'production')
      expect(local?.priority).toBeGreaterThan(production?.priority ?? 0)
    })
  })

  describe('validatePackageRepoConfig', () => {
    it.each([
      {
        name: 'valid config',
        config: DEFAULT_PACKAGE_REPO_CONFIG,
        expectedErrors: 0,
      },
      {
        name: 'empty sources',
        config: { conflictResolution: 'priority', sources: [] } as PackageRepoConfig,
        expectedErrors: 2, // No sources + no enabled sources
      },
      {
        name: 'duplicate IDs',
        config: {
          conflictResolution: 'priority',
          sources: [
            { id: 'dup', name: 'Dup 1', type: 'local', url: '/a', priority: 0, enabled: true },
            { id: 'dup', name: 'Dup 2', type: 'local', url: '/b', priority: 1, enabled: true },
          ],
        } as PackageRepoConfig,
        expectedErrors: 1,
      },
      {
        name: 'remote with non-http URL',
        config: {
          conflictResolution: 'priority',
          sources: [
            { id: 'bad', name: 'Bad', type: 'remote', url: '/local/path', priority: 0, enabled: true },
          ],
        } as PackageRepoConfig,
        expectedErrors: 1,
      },
      {
        name: 'all sources disabled',
        config: {
          conflictResolution: 'priority',
          sources: [
            { id: 'off1', name: 'Off 1', type: 'local', url: '/a', priority: 0, enabled: false },
            { id: 'off2', name: 'Off 2', type: 'remote', url: 'https://x', priority: 1, enabled: false },
          ],
        } as PackageRepoConfig,
        expectedErrors: 1,
      },
    ])('should validate $name', ({ config, expectedErrors }) => {
      const errors = validatePackageRepoConfig(config)
      expect(errors).toHaveLength(expectedErrors)
    })

    it('should catch missing source ID', () => {
      const config: PackageRepoConfig = {
        conflictResolution: 'priority',
        sources: [
          { id: '', name: 'No ID', type: 'local', url: '/test', priority: 0, enabled: true },
        ],
      }
      const errors = validatePackageRepoConfig(config)
      expect(errors.some((e) => e.includes('ID'))).toBe(true)
    })

    it('should catch missing URL', () => {
      const config: PackageRepoConfig = {
        conflictResolution: 'priority',
        sources: [
          { id: 'no-url', name: 'No URL', type: 'local', url: '', priority: 0, enabled: true },
        ],
      }
      const errors = validatePackageRepoConfig(config)
      expect(errors.some((e) => e.includes('URL'))).toBe(true)
    })
  })

  describe('getPackageRepoConfig', () => {
    // Skip environment-dependent tests in this context
    // These would need proper mocking setup for process.env

    it('should return a valid config', () => {
      const config = getPackageRepoConfig()
      const errors = validatePackageRepoConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should have at least one source', () => {
      const config = getPackageRepoConfig()
      expect(config.sources.length).toBeGreaterThan(0)
    })

    it('should have at least one enabled source', () => {
      const config = getPackageRepoConfig()
      const enabledSources = config.sources.filter((s) => s.enabled)
      expect(enabledSources.length).toBeGreaterThan(0)
    })
  })
})
