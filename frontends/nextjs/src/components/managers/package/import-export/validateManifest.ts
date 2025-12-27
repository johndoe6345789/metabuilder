import type { PackageManifest } from '@/lib/package-types'

export const validateManifest = (manifest: Partial<PackageManifest>) => {
  if (!manifest.name?.trim()) {
    return 'Please provide a package name'
  }

  return null
}
