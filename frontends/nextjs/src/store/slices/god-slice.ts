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

/**
 * Note that this workflow has unpublished edits.
 *
 * `dirty.workflow` is one flag covering every workflow, so publishing any
 * of them cleared it: edit A, switch to B, publish B, and the bar read
 * "Published -- up to date" while A's edits had never been written. The
 * flag stays as the "anything unpublished?" indicator; the set says which.
 */
function markWorkflowDirty(s: GodState, id: string): void {
  s.dirtyWorkflows ??= []
  if (!s.dirtyWorkflows.includes(id)) s.dirtyWorkflows.push(id)
  s.dirty.workflow = true
}

/** That workflow has been published; the flag follows the set. */
function markWorkflowPublished(s: GodState, id: string): void {
  s.dirtyWorkflows = (s.dirtyWorkflows ?? []).filter(w => w !== id)
  s.dirty.workflow = s.dirtyWorkflows.length > 0
}

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
      markWorkflowDirty(s, a.payload.entry.workflow.id)
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
      markWorkflowDirty(s, a.payload.id)
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
      markWorkflowDirty(s, a.payload.id)
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
     * The set is every key a founder authored: `tree` and `css` (page
     * content and its classes), `workflow`, `smtp` -- which carries an
     * outbound mail password -- and the browser-local `plan`, `tests` and
     * `dropdowns`. The last three were once left out because they are
     * never written to DBAL; but the slice persists per origin, so they
     * were on screen for whoever signed in next on the same machine. The
     * rule is "authored by one community", not "published under one".
     * `packages` and `bql` are keyed by tenant already.
     *
     * Cloned rather than assigned: initialState is a module-level object,
     * and handing Immer a reference to it would let the next edit mutate
     * the defaults for the rest of the session.
     */
    resetTenantOwned: s => {
      s.tree = structuredClone(initialState.tree)
      s.css = structuredClone(initialState.css)
      s.smtp = structuredClone(initialState.smtp)
      // Never written to DBAL, which is why these were left out: the
      // rule was "cleared if published under a tenant id". But the slice
      // persists per browser origin, so founder A's plan cards, saved
      // tests and dropdown lists were on screen for founder B the moment
      // B signed in on the same machine. What is shown is what leaks; a
      // browser-local draft is still one community's draft.
      s.plan = structuredClone(initialState.plan)
      s.tests = structuredClone(initialState.tests)
      s.dropdowns = structuredClone(initialState.dropdowns)
      s.dirty.tree = false
      s.dirty.css = false
      s.dirty.smtp = false
      s.dirty.plan = false
      s.dirty.tests = false
      s.dirty.dropdowns = false
      // The comment above has always named workflow; the body did not
      // clear it, so a tenant switch left the previous one's "unpublished
      // changes" showing over a list that had already been swapped out.
      s.dirtyWorkflows = []
      s.dirty.workflow = false
    },
    workflowPublished: (s, a: PayloadAction<string>) => {
      markWorkflowPublished(s, a.payload)
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
  workflowPublished,
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
