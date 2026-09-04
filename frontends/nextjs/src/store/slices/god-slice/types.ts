import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/[tenantSlug]/panel/god/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/[tenantSlug]/panel/god/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'
import type { BqlScript } from '@/app/[tenantSlug]/panel/god/tabs/bql/bql-script'

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
  /**
   * BQL scripts, keyed by tenant. Keyed rather than a flat list because
   * this slice persists per browser origin, not per tenant -- a flat list
   * would show one tenant's scripts, paths and copy to the next person to
   * sign in here, which is the same hole that put one tenant's draft tree
   * under another's URL.
   *
   * Optional because it genuinely can be absent: redux-persist replaces
   * this slice with whatever it saved, so a store written before this key
   * existed rehydrates without it. Saying so in the type is what makes the
   * guards at every read and write legitimate rather than dead code.
   */
  bql?: Record<string, BqlScript[]>
  dirty: Record<GodDomain, boolean>
}
