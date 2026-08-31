/** The installed, enabled package record an action runs against, or
 *  null when it isn't installed (or has been disabled). */
export async function loadInstalledPackage(
  packageId: string
): Promise<unknown> {
  const { db } = await import('@/lib/db-client')
  const result = await db.installedPackages.list({
    filter: { packageId, enabled: true },
  })
  return result.data[0] ?? null
}
