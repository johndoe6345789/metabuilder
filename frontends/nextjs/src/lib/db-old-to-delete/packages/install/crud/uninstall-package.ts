import { getAdapter } from '../../../core/dbal-client'

/**
 * Uninstall a package
 */
export async function uninstallPackage(packageId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('InstalledPackage', packageId)
}
