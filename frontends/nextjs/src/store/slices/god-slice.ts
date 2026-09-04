import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/[tenantSlug]/panel/god/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/[tenantSlug]/panel/god/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'
import type { BqlScript } from '@/app/[tenantSlug]/panel/god/tabs/bql/bql-script'
import { initialState } from './god-slice/initial-state'
import { normalizeCssProps } from './god-slice/normalize-css-props'
import type { GodDomain, GodState } from './god-slice/types'

export type { GodDomain, GodState }

const godSlice = createSlice({
  name: 'god',
  initialState,
  reducers: {
    setWorkflow: (s, a: PayloadAction<Workflow>) => {
      s.workflow = a.payload
      s.dirty.workflow = true
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
  setWorkflow,
  setTree,
  setPackages,
  setCss,
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
