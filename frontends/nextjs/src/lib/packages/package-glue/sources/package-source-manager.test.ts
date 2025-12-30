import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PackageSourceManager, createPackageSourceManager } from './package-source-manager'
import type { PackageSource, PackageSourceConfig, PackageIndexEntry, PackageData } from './package-source-types'

// Mock package source for testing
class MockPackageSource implements PackageSource {
  constructor(
    private config: PackageSourceConfig,
    private packages: PackageIndexEntry[] = [],
    private packageData: Map<string, PackageData> = new Map()
  ) {}

  getConfig(): PackageSourceConfig {
    return this.config
  }

  async fetchIndex(): Promise<PackageIndexEntry[]> {
    return this.packages.map((p) => ({ ...p, sourceId: this.config.id }))
  }

  async loadPackage(packageId: string): Promise<PackageData | null> {
    return this.packageData.get(packageId) ?? null
  }

  async hasPackage(packageId: string): Promise<boolean> {
    return this.packages.some((p) => p.packageId === packageId)
  }

  async getVersions(packageId: string): Promise<string[]> {
    const pkg = this.packages.find((p) => p.packageId === packageId)
    return pkg ? [pkg.version] : []
  }

  clearCache(): void {
    // No-op for mock
  }
}

// Test fixtures
const createMockEntry = (
  id: string,
  version: string = '1.0.0',
  minLevel: number = 1
): PackageIndexEntry => ({
  packageId: id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  version,
  description: `${id} package`,
  author: 'Test',
  category: 'test',
  dependencies: [],
  minLevel,
  sourceId: 'mock',
})

describe('PackageSourceManager', () => {
  let manager: PackageSourceManager

  beforeEach(() => {
    manager = new PackageSourceManager()
  })

  describe('addSource', () => {
    it('should add enabled source', () => {
      const source = new MockPackageSource({
        id: 'test',
        name: 'Test',
        type: 'local',
        url: '/test',
        priority: 0,
        enabled: true,
      })
      manager.addSource(source)
      expect(manager.getSources()).toHaveLength(1)
    })

    it('should not add disabled source', () => {
      const source = new MockPackageSource({
        id: 'disabled',
        name: 'Disabled',
        type: 'local',
        url: '/disabled',
        priority: 0,
        enabled: false,
      })
      manager.addSource(source)
      expect(manager.getSources()).toHaveLength(0)
    })
  })

  describe('removeSource', () => {
    it('should remove existing source', () => {
      const source = new MockPackageSource({
        id: 'removable',
        name: 'Removable',
        type: 'local',
        url: '/removable',
        priority: 0,
        enabled: true,
      })
      manager.addSource(source)
      expect(manager.removeSource('removable')).toBe(true)
      expect(manager.getSources()).toHaveLength(0)
    })

    it('should return false for non-existent source', () => {
      expect(manager.removeSource('nonexistent')).toBe(false)
    })
  })

  describe('getSourcesByPriority', () => {
    it('should return sources sorted by priority', () => {
      const lowPriority = new MockPackageSource({
        id: 'low',
        name: 'Low',
        type: 'local',
        url: '/low',
        priority: 10,
        enabled: true,
      })
      const highPriority = new MockPackageSource({
        id: 'high',
        name: 'High',
        type: 'local',
        url: '/high',
        priority: 0,
        enabled: true,
      })
      const medPriority = new MockPackageSource({
        id: 'med',
        name: 'Med',
        type: 'local',
        url: '/med',
        priority: 5,
        enabled: true,
      })

      manager.addSource(lowPriority)
      manager.addSource(highPriority)
      manager.addSource(medPriority)

      const sorted = manager.getSourcesByPriority()
      expect(sorted.map((s) => s.getConfig().id)).toEqual(['high', 'med', 'low'])
    })
  })

  describe('fetchMergedIndex', () => {
    it('should merge packages from multiple sources', async () => {
      const source1 = new MockPackageSource(
        { id: 's1', name: 'S1', type: 'local', url: '/s1', priority: 0, enabled: true },
        [createMockEntry('pkg1'), createMockEntry('pkg2')]
      )
      const source2 = new MockPackageSource(
        { id: 's2', name: 'S2', type: 'remote', url: '/s2', priority: 10, enabled: true },
        [createMockEntry('pkg3'), createMockEntry('pkg4')]
      )

      manager.addSource(source1)
      manager.addSource(source2)

      const merged = await manager.fetchMergedIndex()
      expect(merged).toHaveLength(4)
      expect(merged.map((p) => p.packageId).sort()).toEqual(['pkg1', 'pkg2', 'pkg3', 'pkg4'])
    })

    it('should handle package conflicts by priority', async () => {
      const localSource = new MockPackageSource(
        { id: 'local', name: 'Local', type: 'local', url: '/local', priority: 0, enabled: true },
        [createMockEntry('shared', '1.0.0')]
      )
      const remoteSource = new MockPackageSource(
        { id: 'remote', name: 'Remote', type: 'remote', url: '/remote', priority: 10, enabled: true },
        [createMockEntry('shared', '2.0.0')]
      )

      manager.addSource(localSource)
      manager.addSource(remoteSource)

      const merged = await manager.fetchMergedIndex()
      const sharedPkg = merged.find((p) => p.packageId === 'shared')
      
      expect(sharedPkg).toBeDefined()
      expect(sharedPkg?.version).toBe('1.0.0') // Local wins due to lower priority
      expect(sharedPkg?.selectedSource).toBe('local')
      expect(sharedPkg?.availableSources).toEqual(['local', 'remote'])
    })

    it('should cache merged index', async () => {
      const source = new MockPackageSource(
        { id: 'cached', name: 'Cached', type: 'local', url: '/cached', priority: 0, enabled: true },
        [createMockEntry('cached-pkg')]
      )
      const fetchIndexSpy = vi.spyOn(source, 'fetchIndex')

      manager.addSource(source)

      await manager.fetchMergedIndex()
      await manager.fetchMergedIndex()
      await manager.fetchMergedIndex()

      expect(fetchIndexSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('loadPackage', () => {
    it('should load package from selected source', async () => {
      const packageData: PackageData = {
        metadata: createMockEntry('loadable'),
        components: [{ id: 'comp1' }],
        scriptFiles: [],
      }

      const source = new MockPackageSource(
        { id: 'loader', name: 'Loader', type: 'local', url: '/loader', priority: 0, enabled: true },
        [createMockEntry('loadable')],
        new Map([['loadable', packageData]])
      )

      manager.addSource(source)

      const loaded = await manager.loadPackage('loadable')
      expect(loaded).toBeDefined()
      expect(loaded?.components).toHaveLength(1)
    })

    it('should return null for non-existent package', async () => {
      const source = new MockPackageSource(
        { id: 'empty', name: 'Empty', type: 'local', url: '/empty', priority: 0, enabled: true },
        []
      )

      manager.addSource(source)

      const loaded = await manager.loadPackage('nonexistent')
      expect(loaded).toBeNull()
    })
  })

  describe('hasPackage', () => {
    it.each([
      { packageId: 'exists', expected: true },
      { packageId: 'not-exists', expected: false },
    ])('should return $expected for $packageId', async ({ packageId, expected }) => {
      const source = new MockPackageSource(
        { id: 'has', name: 'Has', type: 'local', url: '/has', priority: 0, enabled: true },
        [createMockEntry('exists')]
      )

      manager.addSource(source)

      const result = await manager.hasPackage(packageId)
      expect(result).toBe(expected)
    })
  })

  describe('getAllVersions', () => {
    it('should aggregate versions from all sources', async () => {
      const source1 = new MockPackageSource(
        { id: 's1', name: 'S1', type: 'local', url: '/s1', priority: 0, enabled: true },
        [createMockEntry('versioned', '1.0.0')]
      )
      const source2 = new MockPackageSource(
        { id: 's2', name: 'S2', type: 'remote', url: '/s2', priority: 10, enabled: true },
        [createMockEntry('versioned', '2.0.0')]
      )

      manager.addSource(source1)
      manager.addSource(source2)

      const versions = await manager.getAllVersions('versioned')
      expect(versions.get('s1')).toEqual(['1.0.0'])
      expect(versions.get('s2')).toEqual(['2.0.0'])
    })
  })
})

describe('createPackageSourceManager', () => {
  it('should create manager with local source by default', () => {
    const manager = createPackageSourceManager()
    const sources = manager.getSources()
    expect(sources).toHaveLength(1)
    expect(sources[0].getConfig().type).toBe('local')
  })

  it('should add remote source when enabled', () => {
    const manager = createPackageSourceManager({
      enableRemote: true,
      remoteUrl: 'https://test.registry.com',
    })
    const sources = manager.getSources()
    expect(sources).toHaveLength(2)
    expect(sources.some((s) => s.getConfig().type === 'remote')).toBe(true)
  })
})
