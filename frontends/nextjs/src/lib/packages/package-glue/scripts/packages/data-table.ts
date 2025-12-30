import type { PackageSeedConfig } from '../types'

const components: PackageSeedConfig['components'] = []
const metadata: PackageSeedConfig['metadata'] = {
  packageId: 'data_table',
  name: 'Data Table',
  version: '1.0.0',
  description: 'Data table package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const examples: PackageSeedConfig['examples'] = {}

export const dataTable: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
