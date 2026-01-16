import { getAdapter } from '../../../../core/dbal-client'

/**
 * Toggle package enabled state
 */
export async function togglePackageEnabled(packageId: string, enabled: boolean): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('InstalledPackage', packageId, { enabled })
}
