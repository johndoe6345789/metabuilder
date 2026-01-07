import { getAdapter } from '../core/dbal-client'

const ENTITY_TYPES = [
  'User',
  'Credential',
  'Workflow',
  'LuaScript',
  'PageConfig',
  'ModelSchema',
  'AppConfiguration',
  'Comment',
  'ComponentNode',
  'ComponentConfig',
  'SystemConfig',
  'CssCategory',
  'DropdownConfig',
  'InstalledPackage',
  'PackageData',
  'Tenant',
  'PowerTransferRequest',
  'SMTPConfig',
  'PasswordResetToken',
] as const

type DBALDeleteCandidate = {
  id?: string
  packageId?: string
  name?: string
  key?: string
  username?: string
}

/**
 * Clear all data from the database
 */
export async function clearDatabase(): Promise<void> {
  const adapter = getAdapter()
  for (const entityType of ENTITY_TYPES) {
    try {
      const result = (await adapter.list(entityType)) as { data: DBALDeleteCandidate[] }
      for (const item of result.data) {
        const id = item.id ?? item.packageId ?? item.name ?? item.key ?? item.username
        if (id !== undefined) {
          await adapter.delete(entityType, id)
        }
      }
    } catch {
      // Skip if entity type doesn't exist
    }
  }
}
