import type { PackageSeedConfig } from '../types'

const components: PackageSeedConfig['components'] = []
const metadata: PackageSeedConfig['metadata'] = {
  packageId: 'form_builder',
  name: 'Form Builder',
  version: '1.0.0',
  description: 'Form builder package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const examples: PackageSeedConfig['examples'] = {}

export const formBuilder: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
