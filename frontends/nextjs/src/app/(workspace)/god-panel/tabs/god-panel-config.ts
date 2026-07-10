'use client'

import type { GodPanelTab } from '@/lib/packages/navigation'
import { OverviewTab } from './OverviewTab'
import { RenditionTab } from './rendition/RenditionTab'
import { SchemasTab } from './SchemasTab'
import { WorkflowsTab } from './WorkflowsTab'
import { PackagesTab } from './PackagesTab'
import { PageRoutesTab } from './PageRoutesTab'
import { ComponentTreeTab } from './builder/ComponentTreeTab'
import { UsersTab } from './UsersTab'
import { DatabaseTab } from './DatabaseTab'
import { CredentialsTab } from './CredentialsTab'
import { ThemeTab } from './ThemeTab'
import { CssClassesTab } from './styles/CssClassesTab'
import { ConfigTab } from './config/ConfigTab'
import { TestRunnerTab } from './test/TestRunnerTab'
import { PlanTab } from './plan/PlanTab'
import { DeployTab } from './deploy/DeployTab'

export type WalkStep = {
  tabId: string
  title: string
  body: string
}

export const WALK_ME_STEPS = [
  {
    tabId: 'overview',
    title: 'Check the system is alive',
    body: 'Confirm DBAL is connected, then use quick actions only when you need export, import, or preview.',
  },
  {
    tabId: 'rendition',
    title: 'Shape this tenant',
    body: 'Define the branded shell, enabled control panel modules, and navigation before assembling pages.',
  },
  {
    tabId: 'plan',
    title: 'Turn intent into tasks',
    body: 'Capture the feature you are building before editing schemas, pages, or workflows.',
  },
  {
    tabId: 'schemas',
    title: 'Model the data',
    body: 'Create or adjust DBAL entities first so the rest of the builder has real structure to work with.',
  },
  {
    tabId: 'components',
    title: 'Build the page surface',
    body: 'Assemble UI blocks, wire useful actions, and preview the actual experience instead of static placeholders.',
  },
  {
    tabId: 'workflows',
    title: 'Wire behavior',
    body: 'Connect triggers, actions, branches, and tests so clicks produce visible outcomes.',
  },
  {
    tabId: 'credentials',
    title: 'Bind tenant secrets',
    body: 'Create credentials scoped to this tenant; supergods can move across tenants when needed.',
  },
  {
    tabId: 'test',
    title: 'Prove it works',
    body: 'Run point-and-click tests against the current workflow and fix failures before deployment.',
  },
  {
    tabId: 'deploy',
    title: 'Ship or export',
    body: 'Use deploy/export only after pages, data, credentials, and tests match the target tenant.',
  },
] as const satisfies readonly WalkStep[]

export const TAB_COMPONENTS: Record<string, React.FC> = {
  overview: OverviewTab,
  rendition: RenditionTab,
  schemas: SchemasTab,
  workflows: WorkflowsTab,
  packages: PackagesTab,
  pages: PageRoutesTab,
  components: ComponentTreeTab,
  users: UsersTab,
  database: DatabaseTab,
  credentials: CredentialsTab,
  theme: ThemeTab,
  styles: CssClassesTab,
  config: ConfigTab,
  test: TestRunnerTab,
  plan: PlanTab,
  deploy: DeployTab,
}

export function getTabById(tabs: readonly GodPanelTab[], tabId: string) {
  return tabs.find(tab => tab.id === tabId)
}
