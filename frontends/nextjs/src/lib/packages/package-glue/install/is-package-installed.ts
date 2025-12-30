type InstalledPackageStore = {
  get(table: 'installed_packages', id: string): Promise<{ packageId: string } | null>
}

// Check if package is installed
export async function isPackageInstalled(
  packageId: string,
  db: InstalledPackageStore
): Promise<boolean> {
  try {
    const pkg = await db.get('installed_packages', packageId)
    return !!pkg
  } catch (error) {
    return false
  }
}
