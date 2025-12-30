import type { PackageSeedConfig } from '../types'

const components: PackageSeedConfig['components'] = []
const metadata: PackageSeedConfig['metadata'] = {
  packageId: 'admin_dialog',
  name: 'Admin Dialog',
  version: '1.0.0',
  description: 'Admin dialog package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const examples: PackageSeedConfig['examples'] = {}

export const adminDialog: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
