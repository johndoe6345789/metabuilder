/**
 * Global type declarations for DBAL integration
 * These types are used across the DBAL codebase
 */

declare global {
  type TenantContext = {
    tenantId: string
    userId?: string
  }

  type InMemoryKVStore = any
  type InMemoryBlobStorage = any
  type InMemoryTenantManager = any

  type DBALErrorCode = string
  
  class DBALError extends Error {
    code: DBALErrorCode
    constructor(message: string, code: DBALErrorCode)
  }
}

export {}
