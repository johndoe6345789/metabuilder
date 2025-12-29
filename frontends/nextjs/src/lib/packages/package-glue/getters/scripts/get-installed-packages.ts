type InstalledPackageRecord = {
  packageId: string
  name?: string
  version?: string
  installedAt?: number
}

type InstalledPackageIndex = Record<string, InstalledPackageRecord>

type InstalledPackageStore = {
  getAll(table: 'installed_packages'): Promise<InstalledPackageIndex | null>
}

// Get all installed packages
export async function getInstalledPackages(db: InstalledPackageStore): Promise<string[]> {
  try {
    const installed = await db.getAll('installed_packages')
    return Object.keys(installed || {})
  } catch (error) {
    return []
  }
}
