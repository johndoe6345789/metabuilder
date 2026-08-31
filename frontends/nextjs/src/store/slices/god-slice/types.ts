import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/[tenantSlug]/panel/god/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/[tenantSlug]/panel/god/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'

export type GodDomain =
  | 'workflow'
  | 'tree'
  | 'packages'
  | 'css'
  | 'dropdowns'
  | 'smtp'
  | 'tests'
  | 'plan'

export interface GodState {
  workflow: Workflow
  tree: TreeNode
  packages: RegistryPackage[]
  css: CssClass[]
  dropdowns: DropdownConfig[]
  smtp: SmtpConfig
  tests: TestCase[]
  plan: Task[]
  dirty: Record<GodDomain, boolean>
}
