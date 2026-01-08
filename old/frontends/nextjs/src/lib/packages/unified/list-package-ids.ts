import { loadAllPackages } from './load-all-packages'

export async function listPackageIds(): Promise<string[]> {
  const packages = await loadAllPackages()
  return packages.map(p => p.packageId)
}
