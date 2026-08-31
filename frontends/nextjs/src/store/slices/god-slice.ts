import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/[tenantSlug]/panel/god/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/[tenantSlug]/panel/god/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/[tenantSlug]/panel/god/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/[tenantSlug]/panel/god/tabs/test/use-test-runner'
import type { Task } from '@/app/[tenantSlug]/panel/god/tabs/plan/use-plan-board'
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
  clearDirty,
  rehydrate,
} = godSlice.actions
export default godSlice.reducer
