import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/(workspace)/god-panel/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/(workspace)/god-panel/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/(workspace)/god-panel/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/(workspace)/god-panel/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/(workspace)/god-panel/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/(workspace)/god-panel/tabs/test/use-test-runner'
import type { Task } from '@/app/(workspace)/god-panel/tabs/plan/use-plan-board'

export type GodDomain =
  | 'workflow'
  | 'tree'
  | 'packages'
  | 'css'
  | 'dropdowns'
  | 'smtp'
  | 'tests'
  | 'plan'
  | 'rendition'

export interface RenditionModule {
  id: string
  label: string
  description: string
  minLevel: 1 | 2 | 3 | 4 | 5
  enabled: boolean
  pinned: boolean
}

export interface RenditionNavItem {
  id: string
  label: string
  path: string
  minLevel: 1 | 2 | 3 | 4 | 5
  enabled: boolean
}

export interface RenditionConfig {
  id: string
  tenantId: string
  productName: string
  tagline: string
  controlPanelName: string
  primaryAccent: string
  secondaryAccent: string
  borderRadius: number
  density: 'comfortable' | 'compact' | 'spacious'
  defaultLandingPath: string
  modules: RenditionModule[]
  navItems: RenditionNavItem[]
  updatedAt: string
}

export interface GodState {
  workflow: Workflow
  tree: TreeNode
  packages: RegistryPackage[]
  css: CssClass[]
  dropdowns: DropdownConfig[]
  smtp: SmtpConfig
  tests: TestCase[]
  plan: Task[]
  rendition: RenditionConfig
  dirty: Record<GodDomain, boolean>
}

const now = () => new Date().toISOString()

export const DEFAULT_RENDITION_CONFIG: RenditionConfig = {
  id: 'rendition_default',
  tenantId: 'system',
  productName: 'MetaBuilder',
  tagline: 'Build, operate and ship tenant apps from one control panel.',
  controlPanelName: 'Control Panel',
  primaryAccent: '#4493f8',
  secondaryAccent: '#56d364',
  borderRadius: 18,
  density: 'comfortable',
  defaultLandingPath: '/app',
  modules: [
    {
      id: 'overview',
      label: 'Overview',
      description: 'System health, alerts and quick actions',
      minLevel: 1,
      enabled: true,
      pinned: true,
    },
    {
      id: 'content',
      label: 'Content Studio',
      description: 'Pages, component trees and reusable blocks',
      minLevel: 4,
      enabled: true,
      pinned: true,
    },
    {
      id: 'data',
      label: 'Data Models',
      description: 'Schemas, records and tenant data operations',
      minLevel: 3,
      enabled: true,
      pinned: false,
    },
    {
      id: 'automation',
      label: 'Automations',
      description: 'JSON workflows, test runs and execution logs',
      minLevel: 4,
      enabled: true,
      pinned: true,
    },
    {
      id: 'users',
      label: 'People',
      description: 'Users, roles and access policy',
      minLevel: 3,
      enabled: true,
      pinned: false,
    },
    {
      id: 'credentials',
      label: 'Credentials',
      description: 'Tenant-scoped secrets and integrations',
      minLevel: 4,
      enabled: true,
      pinned: false,
    },
    {
      id: 'deploy',
      label: 'Release',
      description: 'Publish, export, import and rollback controls',
      minLevel: 4,
      enabled: true,
      pinned: true,
    },
  ],
  navItems: [
    {
      id: 'nav_dashboard',
      label: 'Dashboard',
      path: '/',
      minLevel: 1,
      enabled: true,
    },
    {
      id: 'nav_profile',
      label: 'Profile',
      path: '/profile',
      minLevel: 1,
      enabled: true,
    },
    {
      id: 'nav_admin',
      label: 'Admin',
      path: '/admin',
      minLevel: 3,
      enabled: true,
    },
    {
      id: 'nav_builder',
      label: 'Builder',
      path: '/god-panel',
      minLevel: 4,
      enabled: true,
    },
  ],
  updatedAt: now(),
}

const normalizeCssProps = (state: GodState): GodState => {
  const persisted = state as Partial<GodState>
  return {
    ...initialState,
    ...state,
    rendition: persisted.rendition ?? initialState.rendition,
    dirty: { ...initialState.dirty, ...persisted.dirty },
    css: (persisted.css ?? initialState.css).map(cssClass => {
      const props = { ...cssClass.props }
      if ('border-radius' in props) {
        props.borderRadius = props['border-radius']
        delete props['border-radius']
      }
      if ('font-size' in props) {
        props.fontSize = props['font-size']
        delete props['font-size']
      }
      if ('font-weight' in props) {
        props.fontWeight = props['font-weight']
        delete props['font-weight']
      }
      return { ...cssClass, props }
    }),
  }
}

const initialState: GodState = {
  workflow: {
    id: 'wf_god_default',
    name: 'Untitled Workflow',
    description: '',
    nodes: [],
    connections: [],
    createdAt: now(),
    updatedAt: now(),
  },
  tree: {
    id: 'root',
    type: 'container',
    props: { direction: 'column', gap: 12 },
    children: [],
  },
  packages: [],
  css: [
    {
      id: 'c_card',
      name: 'card',
      props: {
        padding: '16px',
        borderRadius: '16px',
        background: '#161b22',
        border: '1px solid #30363d',
      },
    },
    {
      id: 'c_pill',
      name: 'pill',
      props: {
        padding: '4px 12px',
        borderRadius: '999px',
        background: '#1f6feb',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
      },
    },
  ],
  dropdowns: [
    {
      id: 'd_status',
      name: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ],
  smtp: {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'MetaBuilder',
  },
  tests: [
    {
      id: 't1',
      name: 'returns email',
      input: '{\n  "email": "a@b.com"\n}',
      expected: '{\n  "email": "a@b.com"\n}',
    },
  ],
  plan: [
    { id: 'p1', title: 'Design the landing page', status: 'todo' },
    { id: 'p2', title: 'Wire signup workflow', status: 'doing' },
  ],
  rendition: DEFAULT_RENDITION_CONFIG,
  dirty: {
    workflow: false,
    tree: false,
    packages: false,
    css: false,
    dropdowns: false,
    smtp: false,
    tests: false,
    plan: false,
    rendition: false,
  },
}

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
    setRendition: (s, a: PayloadAction<RenditionConfig>) => {
      s.rendition = { ...a.payload, updatedAt: now() }
      s.dirty.rendition = true
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
  setRendition,
  clearDirty,
  rehydrate,
} = godSlice.actions
export default godSlice.reducer
