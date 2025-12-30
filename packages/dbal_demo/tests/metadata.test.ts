import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'
import components from '../seed/components.json'
import scriptsManifest from '../seed/scripts/manifest.json'

describe('DBAL Demo Package Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.name).toBe('dbal_demo')
    expect(metadata.version).toBe('1.0.0')
    expect(metadata.description).toBeDefined()
  })

  it('should have correct minLevel', () => {
    expect(metadata.minLevel).toBe(3)
  })

  it('should have demo category', () => {
    expect(metadata.category).toBe('demo')
  })

  it('should have DBAL bindings enabled', () => {
    expect(metadata.bindings).toBeDefined()
    expect(metadata.bindings.dbal).toBe(true)
    expect(metadata.bindings.browser).toBe(false)
  })

  it('should require DBAL hooks', () => {
    expect(metadata.requiredHooks).toContain('dbal')
    expect(metadata.requiredHooks).toContain('kv_store')
    expect(metadata.requiredHooks).toContain('blob_storage')
    expect(metadata.requiredHooks).toContain('cached_data')
  })

  it('should export components', () => {
    expect(metadata.exports.components).toContain('DBALDemo')
    expect(metadata.exports.components).toContain('KVStorePanel')
    expect(metadata.exports.components).toContain('BlobStoragePanel')
    expect(metadata.exports.components).toContain('CachedDataPanel')
  })

  it('should export scripts', () => {
    expect(metadata.exports.scripts).toContain('init')
    expect(metadata.exports.scripts).toContain('kv_operations')
    expect(metadata.exports.scripts).toContain('blob_operations')
    expect(metadata.exports.scripts).toContain('cache_operations')
  })
})

describe('DBAL Demo Package Components', () => {
  it('should define DBALDemo component', () => {
    expect(components.DBALDemo).toBeDefined()
    expect(components.DBALDemo.type).toBe('DBALDemo')
    expect(components.DBALDemo.category).toBe('demo')
  })

  it('should define KVStorePanel with DBAL bindings', () => {
    expect(components.KVStorePanel).toBeDefined()
    expect(components.KVStorePanel.bindings?.dbal).toBe(true)
  })

  it('should define BlobStoragePanel with DBAL bindings', () => {
    expect(components.BlobStoragePanel).toBeDefined()
    expect(components.BlobStoragePanel.bindings?.dbal).toBe(true)
  })

  it('should define CachedDataPanel with DBAL bindings', () => {
    expect(components.CachedDataPanel).toBeDefined()
    expect(components.CachedDataPanel.bindings?.dbal).toBe(true)
  })

  it('should have valid component configs', () => {
    Object.values(components).forEach((component: unknown) => {
      const comp = component as { type: string; category: string; config: { layout: string } }
      expect(comp.type).toBeDefined()
      expect(comp.category).toBeDefined()
      expect(comp.config).toBeDefined()
      expect(comp.config.layout).toBeDefined()
    })
  })
})

describe('DBAL Demo Package Scripts', () => {
  it('should have scripts manifest', () => {
    expect(scriptsManifest.scripts).toBeDefined()
    expect(scriptsManifest.scripts.length).toBeGreaterThan(0)
  })

  it.each([
    ['init', 'lifecycle'],
    ['kv_operations', 'dbal'],
    ['blob_operations', 'dbal'],
    ['cache_operations', 'dbal'],
    ['connection', 'dbal'],
  ])('should have %s script in %s category', (name: string, category: string) => {
    const script = scriptsManifest.scripts.find((s: { name: string }) => s.name === name)
    expect(script).toBeDefined()
    expect(script?.category).toBe(category)
  })
})
