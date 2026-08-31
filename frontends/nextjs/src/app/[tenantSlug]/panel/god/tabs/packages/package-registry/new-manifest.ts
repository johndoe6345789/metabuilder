import type { PackageManifest } from '@/lib/packages/core/package-types'

export function newManifest(name: string): PackageManifest {
  const t = Date.now()
  return {
    id: `pkg_${t}`,
    name,
    version: '0.1.0',
    description: '',
    author: 'you',
    category: 'other',
    icon: 'deployed_code',
    screenshots: [],
    tags: [],
    dependencies: [],
    createdAt: t,
    updatedAt: t,
    downloadCount: 0,
    rating: 0,
    installed: false,
  }
}
