import type { PackageSeedConfig } from '../types'

const components: any[] = []
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
const examples: any = {}

export const adminDialog: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
