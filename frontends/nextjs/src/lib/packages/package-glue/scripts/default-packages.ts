import type { PackageDefinition } from './types'

export type PackageSeedConfig = {
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

const codegenStudioComponents: any[] = []
const codegenStudioMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'codegen_studio',
  name: 'Codegen Studio',
  version: '1.0.0',
  description: 'Template-driven code generation studio with zip exports',
  author: 'MetaBuilder',
  category: 'tools',
  dependencies: [],
  exports: { components: [] },
}
const codegenStudioExamples: any = {}

const forumForgeComponents: any[] = []
const forumForgeMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'forum_forge',
  name: 'Forum Forge',
  version: '1.0.0',
  description: 'Modern forum starter with categories, threads, and moderation',
  author: 'MetaBuilder',
  category: 'social',
  dependencies: [],
  exports: { components: [] },
}
const forumForgeExamples: any = {}

const arcadeLobbyComponents: any[] = []
const arcadeLobbyMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'arcade_lobby',
  name: 'Arcade Lobby',
  version: '1.0.0',
  description: 'Gaming lobby with queues, tournaments, and party setup',
  author: 'MetaBuilder',
  category: 'gaming',
  dependencies: [],
  exports: { components: [] },
}
const arcadeLobbyExamples: any = {}

const streamCastComponents: any[] = []
const streamCastMetadata: PackageSeedConfig['metadata'] = {
  packageId: 'stream_cast',
  name: 'Stream Cast',
  version: '1.0.0',
  description: 'Live streaming control room with schedules and scene control',
  author: 'MetaBuilder',
  category: 'media',
  dependencies: [],
  exports: { components: [] },
}
const streamCastExamples: any = {}

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
  codegen_studio: {
    metadata: codegenStudioMetadata,
    components: codegenStudioComponents,
    examples: codegenStudioExamples,
  },
  forum_forge: {
    metadata: forumForgeMetadata,
    components: forumForgeComponents,
    examples: forumForgeExamples,
  },
  arcade_lobby: {
    metadata: arcadeLobbyMetadata,
    components: arcadeLobbyComponents,
    examples: arcadeLobbyExamples,
  },
  stream_cast: {
    metadata: streamCastMetadata,
    components: streamCastComponents,
    examples: streamCastExamples,
  },
}
