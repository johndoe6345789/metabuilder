import type { InstalledPackage, PackageContent, PackageManifest } from '@/lib/package-types'
import { requestJson } from '@/lib/api/request-json'

type InstallPackageOptions = {
  manifest?: PackageManifest
  content?: PackageContent
}

export async function installPackage(
  packageId: string,
  options?: InstallPackageOptions
): Promise<InstalledPackage> {
  const payload = await requestJson<{ installed: InstalledPackage }>('/api/packages/installed', {
    method: 'POST',
    body: JSON.stringify({ packageId, manifest: options?.manifest, content: options?.content }),
  })
  return payload.installed
}
