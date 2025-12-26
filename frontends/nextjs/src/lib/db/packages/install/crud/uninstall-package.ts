import { getAdapter } from '../dbal-client'

/**
 * Uninstall a package
 */
export async function uninstallPackage(packageId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('InstalledPackage', packageId)
}
