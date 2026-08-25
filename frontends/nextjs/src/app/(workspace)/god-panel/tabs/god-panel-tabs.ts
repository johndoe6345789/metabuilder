'use client'

import { OverviewTab } from './OverviewTab'
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

export const TAB_COMPONENTS = {
  overview: OverviewTab,
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
} as const
