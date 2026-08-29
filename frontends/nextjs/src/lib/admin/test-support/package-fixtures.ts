/** Builders for PackageInfo, so each test states only what it cares about. */
import type { PackageInfo } from '@/lib/types/package-admin-types'

/**
 * Every field the type declares, so a test can assert on a complete
 * package rather than on a partial one that happens to typecheck.
 */
export const pkg = (over: Partial<PackageInfo> = {}): PackageInfo => ({
  id: 'core',
  name: 'Core',
  version: '1.0.0',
  description: 'The core package',
  author: 'Ward',
  category: 'platform',
  icon: '',
  screenshots: [],
  tags: ['base'],
  dependencies: [],
  createdAt: 1_600_000_000_000,
  updatedAt: 1_700_000_000_000,
  downloadCount: 100,
  rating: 4,
  status: 'available',
  enabled: false,
  ...over,
})
