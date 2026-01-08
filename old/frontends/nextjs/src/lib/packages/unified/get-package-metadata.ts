import { loadPackage } from './load-package'

export async function getPackageMetadata(
  packageId: string
): Promise<{ name: string; description: string; version: string } | null> {
  const pkg = await loadPackage(packageId)
  if (pkg === null) return null

  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
  }
}
