import { DBALError } from '../../core/foundation/errors'
import type { TenantContext } from '../../core/foundation/tenant-context'
import type { TenantAwareDeps } from './context'

export const resolveTenantContext = async ({ tenantManager, tenantId, userId }: TenantAwareDeps): Promise<TenantContext> => {
  return tenantManager.getTenantContext(tenantId, userId)
}

export const ensurePermission = (context: TenantContext, action: 'read' | 'write' | 'delete'): void => {
  const accessCheck =
    action === 'read' ? context.canRead('blob') : action === 'write' ? context.canWrite('blob') : context.canDelete('blob')

  if (!accessCheck) {
    const verbs: Record<typeof action, string> = {
      read: 'read',
      write: 'write',
      delete: 'delete',
    }
    throw DBALError.forbidden(`Permission denied: cannot ${verbs[action]} blobs`)
  }
}
