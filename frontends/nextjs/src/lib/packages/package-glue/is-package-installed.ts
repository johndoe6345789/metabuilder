// Check if package is installed
export async function isPackageInstalled(packageId: string, db: any): Promise<boolean> {
  try {
    const pkg = await db.get('installed_packages', packageId)
    return !!pkg
  } catch (error) {
    return false
  }
}
