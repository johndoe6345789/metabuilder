import { getAdapter } from '../dbal-client'

/**
 * Delete a tenant
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('Tenant', tenantId)
}
