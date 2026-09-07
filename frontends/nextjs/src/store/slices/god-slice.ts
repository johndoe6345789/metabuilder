import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TreeNode } from '@/app/[tenantSlug]/panel/god/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/[tenantSlug]/panel/god/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'
import type { BqlScript } from '@/app/[tenantSlug]/panel/god/tabs/bql/bql-script'
import { initialState } from './god-slice/initial-state'
import type { WorkflowEntry } from './god-slice/workflow-entry'
import { normalizeCssProps } from './god-slice/normalize-css-props'
import type { GodDomain, GodState } from './god-slice/types'

export type { GodDomain, GodState }

const godSlice = createSlice({
  name: 'god',
  initialState,
  reducers: {
    /**
     * A tenant's whole workflow list. Shaped as intents below rather than
     * a wholesale set wherever two edits could land in one tick, for the
     * same reason as the BQL reducers: a list read during a render is
     * stale the moment anything else has dispatched.
     */
    setWorkflows: (
      s,
      a: PayloadAction<{ tenant: string; entries: WorkflowEntry[] }>
    ) => {
      s.workflows ??= {}
      s.workflows[a.payload.tenant] = a.payload.entries
    },
    addWorkflow: (
      s,
      a: PayloadAction<{ tenant: string; entry: WorkflowEntry }>
    ) => {
      s.workflows ??= {}
      const list = s.workflows[a.payload.tenant] ?? []
      s.workflows[a.payload.tenant] = [...list, a.payload.entry]
      s.workflowSelected ??= {}
      s.workflowSelected[a.payload.tenant] = a.payload.entry.workflow.id
      s.dirty.workflow = true
    },
    patchWorkflow: (
      s,
      a: PayloadAction<{
        tenant: string
        id: string
        change: Partial<WorkflowEntry>
      }>
    ) => {
      s.workflows ??= {}
      const list = s.workflows[a.payload.tenant] ?? []
      s.workflows[a.payload.tenant] = list.map(e =>
        e.workflow.id === a.payload.id ? { ...e, ...a.payload.change } : e
      )
      s.dirty.workflow = true
    },
    removeWorkflow: (
      s,
      a: PayloadAction<{ tenant: string; id: string }>
    ) => {
      s.workflows ??= {}
      const list = s.workflows[a.payload.tenant] ?? []
      // Keeping the last one leaves somewhere to type; removing it would
      // leave the tab with nothing to show and no way back.
      if (list.length <= 1) return
      s.workflows[a.payload.tenant] = list.filter(
        e => e.workflow.id !== a.payload.id
      )
      s.dirty.workflow = true
    },
    selectWorkflow: (
      s,
      a: PayloadAction<{ tenant: string; id: string }>
    ) => {
      s.workflowSelected ??= {}
      s.workflowSelected[a.payload.tenant] = a.payload.id
    },
    setTree: (s, a: PayloadAction<TreeNode>) => {
      s.tree = a.payload
      s.dirty.tree = true
    },
    setPackages: (s, a: PayloadAction<RegistryPackage[]>) => {
      s.packages = a.payload
      s.dirty.packages = true
    },
    setCss: (s, a: PayloadAction<CssClass[]>) => {
      s.css = a.payload
      s.dirty.css = true
    },
    /**
     * Blank everything in this slice that belongs to one tenant.
     *
     * The slice persists per browser origin, so nothing stored in it says
     * whose it is -- see tree-tenant.ts. The tree had a guard; nothing
     * else did, and a founder signing in after someone else in the same
     * browser was shown the other tenant's styles, staged and one click
     * from being published into their own.
     *
     * The set is every key that is published under a tenant id: `tree` and
     * `css` (page content and its classes), `workflow`, and `smtp` --
     * which carries an outbound mail password, so leaving it out would
     * have handed one tenant another's credential. `packages`,
     * `dropdowns`, `tests` and `plan` are deliberately not here: none of
     * them is written to DBAL under a tenant at all. Check that before
     * adding a key, rather than assuming either way -- `smtp` was assumed
     * to be local editor state and is not.
     *
     * Cloned rather than assigned: initialState is a module-level object,
     * and handing Immer a reference to it would let the next edit mutate
     * the defaults for the rest of the session.
     */
    resetTenantOwned: s => {
      s.tree = structuredClone(initialState.tree)
      s.css = structuredClone(initialState.css)
      s.smtp = structuredClone(initialState.smtp)
      s.dirty.tree = false
      s.dirty.css = false
      s.dirty.smtp = false
    },
    setDropdowns: (s, a: PayloadAction<DropdownConfig[]>) => {
      s.dropdowns = a.payload
      s.dirty.dropdowns = true
    },
    setSmtp: (s, a: PayloadAction<SmtpConfig>) => {
      s.smtp = a.payload
      s.dirty.smtp = true
    },
    setTests: (s, a: PayloadAction<TestCase[]>) => {
      s.tests = a.payload
      s.dirty.tests = true
    },
    setPlan: (s, a: PayloadAction<Task[]>) => {
      s.plan = a.payload
      s.dirty.plan = true
    },
    /**
     * Scripts are per tenant; see GodState.bql for why. These are shaped as
     * intents rather than a wholesale set so that two edits in one tick
     * cannot clobber each other: a `setBql(nextList)` built from a value
     * read during render is stale the moment anything else has dispatched.
     */
    setBql: (
      s,
      a: PayloadAction<{ tenant: string; scripts: BqlScript[] }>
    ) => {
      // See the read side: a rehydrated slice may predate this key.
      s.bql ??= {}
      s.bql[a.payload.tenant] = a.payload.scripts
    },
    addBqlScript: (
      s,
      a: PayloadAction<{ tenant: string; script: BqlScript }>
    ) => {
      s.bql ??= {}
      const list = s.bql[a.payload.tenant] ?? []
      s.bql[a.payload.tenant] = [...list, a.payload.script]
    },
    patchBqlScript: (
      s,
      a: PayloadAction<{
        tenant: string
        id: string
        change: Partial<BqlScript>
      }>
    ) => {
      s.bql ??= {}
      const list = s.bql[a.payload.tenant] ?? []
      s.bql[a.payload.tenant] = list.map(script =>
        script.id === a.payload.id ? { ...script, ...a.payload.change } : script
      )
    },
    removeBqlScript: (
      s,
      a: PayloadAction<{ tenant: string; id: string }>
    ) => {
      s.bql ??= {}
      const list = s.bql[a.payload.tenant] ?? []
      // Never leave the tab with nothing to type into.
      if (list.length <= 1) return
      s.bql[a.payload.tenant] = list.filter(
        script => script.id !== a.payload.id
      )
    },
    clearDirty: (s, a: PayloadAction<GodDomain>) => {
      s.dirty[a.payload] = false
    },
    rehydrate: (_s, a: PayloadAction<GodState>) => normalizeCssProps(a.payload),
  },
})

export const {
  setWorkflows,
  addWorkflow,
  patchWorkflow,
  removeWorkflow,
  selectWorkflow,
  setTree,
  setPackages,
  setCss,
  resetTenantOwned,
  setDropdowns,
  setSmtp,
  setTests,
  setPlan,
  setBql,
  addBqlScript,
  patchBqlScript,
  removeBqlScript,
  clearDirty,
  rehydrate,
} = godSlice.actions
export default godSlice.reducer
