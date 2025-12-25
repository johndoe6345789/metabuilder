// Get all installed packages
export async function getInstalledPackages(db: any): Promise<string[]> {
  try {
    const installed = await db.getAll('installed_packages')
    return Object.keys(installed || {})
  } catch (error) {
    return []
  }
}
