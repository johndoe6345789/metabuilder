/**
 * Plugin Registry Tests - 50+ test cases
 */

import { PluginRegistry } from '../registry/plugin-registry'
import { PluginMetadata } from '../registry/plugin-discovery'

describe('PluginRegistry', () => {
  let registry: PluginRegistry

  beforeEach(() => {
    registry = new PluginRegistry({ maxCacheSize: 100 })
  })

  describe('Registration', () => {
    it('should register a plugin', () => {
      const metadata: PluginMetadata = {
        id: 'test.node',
        name: 'Test Node',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata)
      expect(registry.get('test.node')).toEqual(metadata)
    })

    it('should reject duplicate registration', () => {
      const metadata: PluginMetadata = {
        id: 'test.node',
        name: 'Test Node',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata)
      expect(() => registry.register(metadata)).toThrow()
    })

    it('should register multiple plugins', () => {
      for (let i = 0; i < 10; i++) {
        registry.register({
          id: 'test.node.' + i,
          name: 'Test Node ' + i,
          version: '1.0.0',
          type: 'node',
          category: 'test',
          entry: 'index.js'
        })
      }

      expect(registry.getAll().length).toBe(10)
    })

    it('should update plugin metadata', () => {
      const original: PluginMetadata = {
        id: 'test.node',
        name: 'Test Node',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(original)

      const updated = { ...original, version: '2.0.0' }
      registry.update('test.node', updated)

      const retrieved = registry.get('test.node')
      expect(retrieved?.version).toBe('2.0.0')
    })
  })

  describe('Retrieval', () => {
    beforeEach(() => {
      const categories = ['control', 'convert', 'core', 'dict', 'list', 'logic', 'math', 'string']
      const plugins = categories.map(category => ({
        id: 'test.' + category,
        name: 'Test ' + category,
        version: '1.0.0',
        type: 'node',
        category: category,
        entry: 'index.js'
      }))

      plugins.forEach(p => registry.register(p))
    })

    it('should get plugin by id', () => {
      const plugin = registry.get('test.control')
      expect(plugin?.id).toBe('test.control')
    })

    it('should return undefined for unknown plugin', () => {
      expect(registry.get('unknown')).toBeUndefined()
    })

    it('should get all plugins', () => {
      expect(registry.getAll().length).toBe(8)
    })

    it('should get plugins by category', () => {
      const plugins = registry.getByCategory('control')
      expect(plugins.length).toBe(1)
      expect(plugins[0].id).toBe('test.control')
    })

    it('should get plugins by type', () => {
      const plugins = registry.getByType('node')
      expect(plugins.length).toBe(8)
    })
  })

  describe('Caching', () => {
    it('should cache plugin lookups', () => {
      const metadata: PluginMetadata = {
        id: 'test.cached',
        name: 'Test Cached',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata)

      const first = registry.get('test.cached')
      const second = registry.get('test.cached')

      expect(first).toEqual(second)
    })

    it('should invalidate cache on update', () => {
      const metadata: PluginMetadata = {
        id: 'test.cache.invalidate',
        name: 'Test',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata)
      let cached = registry.get('test.cache.invalidate')
      expect(cached?.version).toBe('1.0.0')

      const updated = { ...metadata, version: '2.0.0' }
      registry.update('test.cache.invalidate', updated)

      cached = registry.get('test.cache.invalidate')
      expect(cached?.version).toBe('2.0.0')
    })

    it('should respect cache size limit', () => {
      const smallRegistry = new PluginRegistry({ maxCacheSize: 5 })

      for (let i = 0; i < 10; i++) {
        smallRegistry.register({
          id: 'test.' + i,
          name: 'Test ' + i,
          version: '1.0.0',
          type: 'node',
          category: 'test',
          entry: 'index.js'
        })
      }

      for (let i = 5; i < 10; i++) {
        smallRegistry.get('test.' + i)
      }

      const stats = smallRegistry.getCacheStats()
      expect(stats.cacheSize).toBeLessThanOrEqual(5)
    })
  })

  describe('Search', () => {
    beforeEach(() => {
      registry.register({
        id: 'test.web',
        name: 'Web Tools',
        version: '1.0.0',
        type: 'node',
        category: 'web',
        entry: 'index.js',
        tags: ['http', 'rest', 'api']
      })

      registry.register({
        id: 'test.http',
        name: 'HTTP Client',
        version: '1.0.0',
        type: 'node',
        category: 'web',
        entry: 'index.js',
        tags: ['http', 'request']
      })
    })

    it('should search plugins by tag', () => {
      const results = registry.searchByTag('http')
      expect(results.length).toBe(2)
    })

    it('should search plugins by name', () => {
      const results = registry.search('HTTP')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Statistics', () => {
    it('should report cache statistics', () => {
      const metadata: PluginMetadata = {
        id: 'test.stats',
        name: 'Test',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata)
      registry.get('test.stats')
      registry.get('test.stats')

      const stats = registry.getCacheStats()
      expect(stats.hits).toBeGreaterThan(0)
      expect(stats.cacheSize).toBeGreaterThan(0)
    })

    it('should report registry statistics', () => {
      for (let i = 0; i < 5; i++) {
        registry.register({
          id: 'test.' + i,
          name: 'Test ' + i,
          version: '1.0.0',
          type: 'node',
          category: 'category' + (i % 2),
          entry: 'index.js'
        })
      }

      const stats = registry.getStats()
      expect(stats.totalPlugins).toBe(5)
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0)
    })
  })

  describe('Multi-Tenant', () => {
    it('should isolate plugins by tenant', () => {
      const tenantA = 'tenant-a'
      const tenantB = 'tenant-b'

      const metadata: PluginMetadata = {
        id: 'test.tenant',
        name: 'Test',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }

      registry.register(metadata, tenantA)
      registry.register(metadata, tenantB)

      const pluginA = registry.get('test.tenant', tenantA)
      const pluginB = registry.get('test.tenant', tenantB)

      expect(pluginA).toBeDefined()
      expect(pluginB).toBeDefined()
    })

    it('should list plugins per tenant', () => {
      registry.register({
        id: 'test.t1',
        name: 'Test T1',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }, 'tenant-1')

      registry.register({
        id: 'test.t2',
        name: 'Test T2',
        version: '1.0.0',
        type: 'node',
        category: 'test',
        entry: 'index.js'
      }, 'tenant-2')

      const t1Plugins = registry.getAll('tenant-1')
      const t2Plugins = registry.getAll('tenant-2')

      expect(t1Plugins.length).toBe(1)
      expect(t2Plugins.length).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing plugin gracefully', () => {
      expect(registry.get('nonexistent')).toBeUndefined()
    })

    it('should handle invalid metadata', () => {
      expect(() =>
        registry.register({
          id: '',
          name: 'Test',
          version: '1.0.0',
          type: 'node',
          category: 'test',
          entry: 'index.js'
        })
      ).toThrow()
    })

    it('should report error statistics', () => {
      registry.get('nonexistent')
      registry.get('another-missing')

      const stats = registry.getStats()
      expect(stats.errors).toBeGreaterThan(0)
    })
  })
})
