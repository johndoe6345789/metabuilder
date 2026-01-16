// Legacy compatibility layer - wraps getDBALClient with old adapter methods
// This is a temporary shim to migrate away from the old adapter pattern
// TODO: Replace all getAdapter() calls with getDBALClient()

import type { DBALClient } from '@/dbal'
import { getDBALClient } from '@/dbal'

/**
 * Legacy adapter interface for backward compatibility
 * Maps old methods to new DBALClient entity operations
 */
export type LegacyAdapter = DBALClient & {
  findFirst(entityType: string, query: Record<string, unknown>): Promise<Record<string, unknown> | null>
  read(entityType: string, id: string | number): Promise<Record<string, unknown> | null>
  get(entityType: string, id: string | number): Promise<{ data?: Record<string, unknown> | null }>
  list(entityType: string, query?: Record<string, unknown>): Promise<{ data: Record<string, unknown>[] }>
  create(entityType: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  update(entityType: string, id: string | number, data: Record<string, unknown>): Promise<Record<string, unknown>>
  delete(entityType: string, id: string | number): Promise<boolean>
  upsert(entityType: string, filter: Record<string, unknown>, data: Record<string, unknown>): Promise<Record<string, unknown>>
}

/**
 * Create a legacy adapter wrapper that translates old adapter methods
 * to new DBALClient entity operations
 */
function createLegacyAdapter(client: DBALClient): LegacyAdapter {
  const legacyMethods = {
    /**
     * Find first record matching query
     * Stub implementation - returns null for now
     */
    async findFirst(entityType: string, query: Record<string, unknown>): Promise<Record<string, unknown> | null> {
      try {
        // Try to use the new API
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations) {
          console.warn(`No operations found for entity type: ${entityType}`)
          return null
        }

        // If there's an id in the query, use read()
        if (query.id && typeof query.id === 'string') {
          return operations.read(query.id) || null
        }

        // Otherwise, list and return first match
        const result = await operations.list({ filter: query })
        return result?.data?.[0] || null
      } catch (error) {
        console.error(`Error in findFirst for ${entityType}:`, error)
        return null
      }
    },

    /**
     * Read a record by ID
     */
    async read(entityType: string, id: string | number): Promise<Record<string, unknown> | null> {
      try {
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations?.read) {
          console.warn(`No read operation found for entity type: ${entityType}`)
          return null
        }

        return await operations.read(String(id))
      } catch (error) {
        console.error(`Error reading ${entityType}:`, error)
        return null
      }
    },

    /**
     * Get a record by ID (legacy - returns wrapped format)
     */
    async get(entityType: string, id: string | number): Promise<{ data?: Record<string, unknown> | null }> {
      try {
        const result = await legacyMethods.read(entityType, id)
        return { data: result }
      } catch (error) {
        console.error(`Error getting ${entityType}:`, error)
        return { data: null }
      }
    },

    /**
     * List records
     */
    async list(entityType: string, query?: Record<string, unknown>): Promise<{ data: Record<string, unknown>[] }> {
      try {
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations?.list) {
          console.warn(`No list operation found for entity type: ${entityType}`)
          return { data: [] }
        }

        const filter = (query?.filter || query || {}) as Record<string, unknown>

        // Special handling: if no filter provided and operations require tenantId, add a fallback
        if (!(filter.tenantId) && !(filter.tenant_id)) {
          // Try with the filter first, fall back to empty if tenant required
          try {
            const result = await operations.list({ filter })
            return { data: result?.data || [] }
          } catch (tenantError: unknown) {
            const errorMsg = String(tenantError)
            if (errorMsg.includes('Tenant') || errorMsg.includes('tenant')) {
              // Tenant is required - return empty for now
              console.debug(`Tenant ID required for ${entityType} list operation`)
              return { data: [] }
            }
            throw tenantError
          }
        }

        const result = await operations.list({ filter })
        return { data: result?.data || [] }
      } catch (error) {
        console.error(`Error listing ${entityType}:`, error)
        return { data: [] }
      }
    },

    /**
     * Create a record
     */
    async create(entityType: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
      try {
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations?.create) {
          console.warn(`No create operation found for entity type: ${entityType}`)
          return data
        }

        return await operations.create(data)
      } catch (error) {
        console.error(`Error creating ${entityType}:`, error)
        return data
      }
    },

    /**
     * Update a record
     */
    async update(entityType: string, id: string | number, data: Record<string, unknown>): Promise<Record<string, unknown>> {
      try {
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations?.update) {
          console.warn(`No update operation found for entity type: ${entityType}`)
          return data
        }

        return await operations.update(String(id), data)
      } catch (error) {
        console.error(`Error updating ${entityType}:`, error)
        return data
      }
    },

    /**
     * Delete a record
     */
    async delete(entityType: string, id: string | number): Promise<boolean> {
      try {
        const entityName = entityType.toLowerCase()
        const operations = (client as any)[entityName + 's'] || (client as any)[entityName]

        if (!operations?.delete) {
          console.warn(`No delete operation found for entity type: ${entityType}`)
          return false
        }

        return await operations.delete(String(id))
      } catch (error) {
        console.error(`Error deleting ${entityType}:`, error)
        return false
      }
    },

    /**
     * Upsert a record (create or update)
     * Stub implementation - tries to find then create or update
     */
    async upsert(
      entityType: string,
      filter: Record<string, unknown>,
      data: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
      try {
        const existing = await legacyMethods.findFirst(entityType, filter)
        if (existing) {
          // Update if exists
          const id = (existing as any).id || (filter as any).id
          if (id) {
            return await legacyMethods.update(entityType, id, data)
          }
        }
        // Create if doesn't exist
        return await legacyMethods.create(entityType, { ...data, ...filter })
      } catch (error) {
        console.error(`Error upserting ${entityType}:`, error)
        return { ...data, ...filter }
      }
    }
  }

  return {
    ...client,
    ...legacyMethods
  } as LegacyAdapter
}

/**
 * @deprecated Use getDBALClient() instead
 * Legacy function for backward compatibility
 * Returns adapter with old-style methods for backward compatibility
 */
export function getAdapter(): LegacyAdapter {
  const client = getDBALClient()
  return createLegacyAdapter(client)
}

/**
 * @deprecated No-op stub for backward compatibility
 * The DBAL client handles its own connection lifecycle
 */
export async function closeAdapter(): Promise<void> {
  // No-op: DBAL client manages its own connections
  return Promise.resolve()
}

// Re-export everything from DBAL for compatibility
export { getDBALClient } from '@/dbal'
