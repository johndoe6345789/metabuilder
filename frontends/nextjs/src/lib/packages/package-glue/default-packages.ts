import type { PackageDefinition } from './types'

type PackageSeedConfig = {
  metadata: Omit<PackageDefinition, 'components' | 'scripts' | 'scriptFiles' | 'examples'>
  components: any[]
  examples: any
}

const adminDialogComponents: any[] = []
const adminDialogMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'admin_dialog',
  name: 'Admin Dialog',
  version: '1.0.0',
  description: 'Admin dialog package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const adminDialogExamples: any = {}

const dataTableComponents: any[] = []
const dataTableMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'data_table',
  name: 'Data Table',
  version: '1.0.0',
  description: 'Data table package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const dataTableExamples: any = {}

const formBuilderComponents: any[] = []
const formBuilderMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'form_builder',
  name: 'Form Builder',
  version: '1.0.0',
  description: 'Form builder package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const formBuilderExamples: any = {}

const navMenuComponents: any[] = []
const navMenuMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'nav_menu',
  name: 'Nav Menu',
  version: '1.0.0',
  description: 'Navigation menu package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const navMenuExamples: any = {}

const dashboardComponents: any[] = []
const dashboardMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',
  description: 'Dashboard package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const dashboardExamples: any = {}

const notificationCenterComponents: any[] = []
const notificationCenterMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'notification_center',
  name: 'Notification Center',
  version: '1.0.0',
  description: 'Notification center package',
  author: 'MetaBuilder',
  category: 'ui',
  dependencies: [],
  exports: { components: [] },
}
const notificationCenterExamples: any = {}

const socialHubComponents: any[] = []
const socialHubMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'social_hub',
  name: 'Social Hub',
  version: '1.0.0',
  description: 'Social feed package with live rooms and creator updates',
  author: 'MetaBuilder',
  category: 'social',
  dependencies: [],
  exports: { components: [] },
}
const socialHubExamples: any = {}

export const DEFAULT_PACKAGES: Record<string, PackageSeedConfig> = {
  admin_dialog: {
    metadata: adminDialogMetadata,
    components: adminDialogComponents,
    examples: adminDialogExamples,
  },
  data_table: {
    metadata: dataTableMetadata,
    components: dataTableComponents,
    examples: dataTableExamples,
  },
  form_builder: {
    metadata: formBuilderMetadata,
    components: formBuilderComponents,
    examples: formBuilderExamples,
  },
  nav_menu: {
    metadata: navMenuMetadata,
    components: navMenuComponents,
    examples: navMenuExamples,
  },
  dashboard: {
    metadata: dashboardMetadata,
    components: dashboardComponents,
    examples: dashboardExamples,
  },
  notification_center: {
    metadata: notificationCenterMetadata,
    components: notificationCenterComponents,
    examples: notificationCenterExamples,
  },
  social_hub: {
    metadata: socialHubMetadata,
    components: socialHubComponents,
    examples: socialHubExamples,
  },
}
