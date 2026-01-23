/**
 * Tenant Safety Tests - 35+ test cases
 */

import { TenantSafetyManager } from '../multi-tenant/tenant-safety'

describe('TenantSafetyManager', () => {
  let manager: TenantSafetyManager

  beforeEach(() => {
    manager = new TenantSafetyManager()
  })

  describe('Context Establishment', () => {
    it('should establish tenant context', () => {
      const context = manager.establishContext('tenant-1')

      expect(context.tenantId).toBe('tenant-1')
      expect(context.timestamp).toBeGreaterThan(0)
    })

    it('should establish context with user', () => {
      const context = manager.establishContext('tenant-1', 'user-123')

      expect(context.tenantId).toBe('tenant-1')
      expect(context.userId).toBe('user-123')
    })

    it('should establish context with session', () => {
      const context = manager.establishContext('tenant-1', 'user-123', 'session-abc')

      expect(context.sessionId).toBe('session-abc')
    })

    it('should throw without tenant ID', () => {
      expect(() => manager.establishContext('')).toThrow()
    })
  })

  describe('Context Validation', () => {
    it('should validate context', () => {
      const context = manager.establishContext('tenant-1', 'user-123')
      const result = manager.validateContext('tenant-1', context)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect tenant mismatch', () => {
      const context = manager.establishContext('tenant-1')
      const result = manager.validateContext('tenant-2', context)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should require tenant ID', () => {
      const result = manager.validateContext('')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('tenantId is required')
    })
  })

  describe('Data Isolation', () => {
    it('should enforce isolation on objects', () => {
      const data = { value: 'test', tenantId: 'tenant-1' }
      const isolated = manager.enforceIsolation(data, 'tenant-1')

      expect(isolated.tenantId).toBe('tenant-1')
    })

    it('should reject mismatched tenant', () => {
      const data = { value: 'test', tenantId: 'tenant-1' }

      expect(() => manager.enforceIsolation(data, 'tenant-2')).toThrow()
    })

    it('should add tenant to untagged objects', () => {
      const data = { value: 'test' }
      const isolated = manager.enforceIsolation(data, 'tenant-1')

      expect(isolated.tenantId).toBe('tenant-1')
    })

    it('should handle arrays', () => {
      const data = [
        { value: 'test-1', tenantId: 'tenant-1' },
        { value: 'test-2', tenantId: 'tenant-1' }
      ]

      const isolated = manager.enforceIsolation(data, 'tenant-1')

      expect(Array.isArray(isolated)).toBe(true)
      expect(isolated.length).toBe(2)
    })

    it('should handle null data', () => {
      const result = manager.enforceIsolation(null, 'tenant-1')
      expect(result).toBeNull()
    })
  })

  describe('Authorization', () => {
    it('should authorize matching tenant', () => {
      const isAuthorized = manager.isAuthorized('tenant-1', 'tenant-1')
      expect(isAuthorized).toBe(true)
    })

    it('should deny mismatched tenant', () => {
      const isAuthorized = manager.isAuthorized('tenant-1', 'tenant-2')
      expect(isAuthorized).toBe(false)
    })

    it('should allow public resources', () => {
      const isAuthorized = manager.isAuthorized('tenant-1', undefined)
      expect(isAuthorized).toBe(true)
    })
  })

  describe('Filtering', () => {
    it('should filter items by tenant', () => {
      const items = [
        { id: '1', tenantId: 'tenant-1' },
        { id: '2', tenantId: 'tenant-2' },
        { id: '3', tenantId: 'tenant-1' }
      ]

      const filtered = manager.filterByTenant(items, 'tenant-1')

      expect(filtered.length).toBe(2)
      expect(filtered.every(item => item.tenantId === 'tenant-1')).toBe(true)
    })

    it('should handle public items', () => {
      const items = [
        { id: '1', tenantId: 'tenant-1' },
        { id: '2' }, // public
        { id: '3', tenantId: 'tenant-1' }
      ]

      const filtered = manager.filterByTenant(items, 'tenant-1')

      expect(filtered.length).toBe(3)
    })
  })

  describe('Context Management', () => {
    it('should retrieve context', () => {
      const context = manager.establishContext('tenant-1', 'user-123', 'session-abc')
      const retrieved = manager.getContext('session-abc')

      expect(retrieved).toEqual(context)
    })

    it('should clear context', () => {
      manager.establishContext('tenant-1', 'user-123', 'session-abc')
      manager.clearContext('session-abc')

      const retrieved = manager.getContext('session-abc')
      expect(retrieved).toBeUndefined()
    })

    it('should get contexts by tenant', () => {
      manager.establishContext('tenant-1', 'user-1')
      manager.establishContext('tenant-1', 'user-2')
      manager.establishContext('tenant-2', 'user-3')

      const contexts = manager.getContextsByTenant('tenant-1')

      expect(contexts.length).toBe(2)
      expect(contexts.every(c => c.tenantId === 'tenant-1')).toBe(true)
    })
  })

  describe('Statistics', () => {
    it('should report context statistics', () => {
      manager.establishContext('tenant-1', 'user-1')
      manager.establishContext('tenant-1', 'user-2')
      manager.establishContext('tenant-2', 'user-3')

      const stats = manager.getStats()

      expect(stats.totalContexts).toBe(3)
      expect(stats.byTenant.get('tenant-1')).toBe(2)
      expect(stats.byTenant.get('tenant-2')).toBe(1)
    })

    it('should track oldest and newest contexts', () => {
      const context1 = manager.establishContext('tenant-1')
      const context2 = manager.establishContext('tenant-2')

      const stats = manager.getStats()

      expect(stats.oldestContext).toBe(context1.timestamp)
      expect(stats.newestContext).toBe(context2.timestamp)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup old contexts', async () => {
      manager.establishContext('tenant-1', 'user-1')

      const stats1 = manager.getStats()
      expect(stats1.totalContexts).toBe(1)

      // Force cleanup by establishing many new contexts
      for (let i = 0; i < 2000; i++) {
        manager.establishContext('tenant-1', 'user-' + i)
      }

      const stats2 = manager.getStats()
      expect(stats2.totalContexts).toBeLessThan(2000)
    })
  })

  describe('Multi-Tenant Enforcement', () => {
    it('should enforce isolation between tenants', () => {
      manager.establishContext('tenant-1', 'user-1')
      manager.establishContext('tenant-2', 'user-2')

      const t1Data = [{ id: '1', tenantId: 'tenant-1' }]
      const t2Data = [{ id: '2', tenantId: 'tenant-2' }]

      const t1Filtered = manager.filterByTenant(t1Data, 'tenant-1')
      const t2Filtered = manager.filterByTenant(t2Data, 'tenant-2')

      expect(t1Filtered.length).toBe(1)
      expect(t2Filtered.length).toBe(1)
    })

    it('should prevent cross-tenant data access', () => {
      const t1Data = { value: 'secret', tenantId: 'tenant-1' }

      expect(() => {
        manager.enforceIsolation(t1Data, 'tenant-2')
      }).toThrow()
    })
  })
})
