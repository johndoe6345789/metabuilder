/** Builders for PackageInfo, so each test states only what it cares about. */
import type { PackageInfo } from '@/lib/types/package-admin-types'

export const pkg = (over: Partial<PackageInfo> = {}): PackageInfo =>
  ({
    id: 'core',
    name: 'Core',
    description: 'The core package',
    author: 'Ward',
    tags: ['base'],
    rating: 4,
    downloadCount: 100,
    updatedAt: 1_700_000_000_000,
    status: 'available',
    enabled: false,
    ...over,
  }) as PackageInfo
