import { DBALError } from '../../../core/foundation/errors'
import type { TenantContext, TenantManager } from '../core/tenant-context'

export const assertWithinQuota = (
  context: TenantContext,
  size: number
): void => {
  if (!context.canUploadBlob(size)) {
    throw DBALError.rateLimitExceeded()
  }
}

export const recordQuotaDelta = async (
  tenantManager: TenantManager,
  tenantId: string,
  sizeDelta: number,
  countDelta: number
): Promise<void> => {
  await tenantManager.updateBlobUsage(tenantId, sizeDelta, countDelta)
}
