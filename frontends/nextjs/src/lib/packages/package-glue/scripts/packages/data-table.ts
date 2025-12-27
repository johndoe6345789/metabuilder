import type { PackageSeedConfig } from '../types'

const components: any[] = []
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
const examples: any = {}

export const dataTable: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
