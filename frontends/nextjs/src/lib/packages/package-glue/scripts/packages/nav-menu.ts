import type { PackageSeedConfig } from '../types'

const components: any[] = []
const metadata: PackageSeedConfig['metadata'] = {
  packageId: 'nav_menu',
  name: 'Navigation Menu',
  version: '1.0.0',
  description: 'Navigation menu package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const examples: any = {}

export const navMenu: PackageSeedConfig = {
  metadata,
  components,
  examples,
}
