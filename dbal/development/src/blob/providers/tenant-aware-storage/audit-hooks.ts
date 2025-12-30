import type { TenantAwareDeps } from './context'

const recordUsageChange = async (deps: TenantAwareDeps, bytesChange: number, countChange: number): Promise<void> => {
  await deps.tenantManager.updateBlobUsage(deps.tenantId, bytesChange, countChange)
}

export const auditUpload = async (deps: TenantAwareDeps, sizeBytes: number): Promise<void> => {
  await recordUsageChange(deps, sizeBytes, 1)
}

export const auditDeletion = async (deps: TenantAwareDeps, sizeBytes: number): Promise<void> => {
  await recordUsageChange(deps, -sizeBytes, -1)
}

export const auditCopy = async (deps: TenantAwareDeps, sizeBytes: number): Promise<void> => {
  await recordUsageChange(deps, sizeBytes, 1)
}
