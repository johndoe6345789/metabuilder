import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Workflow } from '@/workflow-editor'
import type { TreeNode } from '@/app/app/god-panel/tabs/builder/builder-registry'
import type { RegistryPackage } from '@/app/app/god-panel/tabs/packages/use-package-registry'
import type { CssClass } from '@/app/app/god-panel/tabs/styles/use-css-classes'
import type { DropdownConfig } from '@/app/app/god-panel/tabs/config/use-dropdown-configs'
import type { SmtpConfig } from '@/app/app/god-panel/tabs/config/use-smtp-config'
import type { TestCase } from '@/app/app/god-panel/tabs/test/use-test-runner'
import type { Task } from '@/app/app/god-panel/tabs/plan/use-plan-board'

export type GodDomain =
  | 'workflow' | 'tree' | 'packages' | 'css'
  | 'dropdowns' | 'smtp' | 'tests' | 'plan'

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

const now = () => new Date().toISOString()

const normalizeCssProps = (state: GodState): GodState => ({
  ...state,
  css: state.css.map(cssClass => {
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
})

const initialState: GodState = {
  workflow: {
    id: 'wf_god_default', name: 'Untitled Workflow', description: '',
    nodes: [], connections: [], createdAt: now(), updatedAt: now(),
  },
  tree: { id: 'root', type: 'container', props: { direction: 'column', gap: 12 }, children: [] },
  packages: [],
  css: [
    { id: 'c_card', name: 'card', props: { padding: '16px', borderRadius: '8px', background: '#161b22', border: '1px solid #30363d' } },
    { id: 'c_pill', name: 'pill', props: { padding: '4px 12px', borderRadius: '999px', background: '#1f6feb', color: '#fff', fontSize: '12px', fontWeight: '600' } },
  ],
  dropdowns: [
    { id: 'd_status', name: 'status', options: [
      { label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' },
      { label: 'Archived', value: 'archived' },
    ] },
  ],
  smtp: { host: '', port: 587, secure: false, username: '', password: '', fromEmail: '', fromName: 'MetaBuilder' },
  tests: [{ id: 't1', name: 'returns email', input: '{\n  "email": "a@b.com"\n}', expected: '{\n  "email": "a@b.com"\n}' }],
  plan: [
    { id: 'p1', title: 'Design the landing page', status: 'todo' },
    { id: 'p2', title: 'Wire signup workflow', status: 'doing' },
  ],
  dirty: { workflow: false, tree: false, packages: false, css: false, dropdowns: false, smtp: false, tests: false, plan: false },
}

const godSlice = createSlice({
  name: 'god',
  initialState,
  reducers: {
    setWorkflow: (s, a: PayloadAction<Workflow>) => { s.workflow = a.payload; s.dirty.workflow = true },
    setTree: (s, a: PayloadAction<TreeNode>) => { s.tree = a.payload; s.dirty.tree = true },
    setPackages: (s, a: PayloadAction<RegistryPackage[]>) => { s.packages = a.payload; s.dirty.packages = true },
    setCss: (s, a: PayloadAction<CssClass[]>) => { s.css = a.payload; s.dirty.css = true },
    setDropdowns: (s, a: PayloadAction<DropdownConfig[]>) => { s.dropdowns = a.payload; s.dirty.dropdowns = true },
    setSmtp: (s, a: PayloadAction<SmtpConfig>) => { s.smtp = a.payload; s.dirty.smtp = true },
    setTests: (s, a: PayloadAction<TestCase[]>) => { s.tests = a.payload; s.dirty.tests = true },
    setPlan: (s, a: PayloadAction<Task[]>) => { s.plan = a.payload; s.dirty.plan = true },
    clearDirty: (s, a: PayloadAction<GodDomain>) => { s.dirty[a.payload] = false },
    rehydrate: (_s, a: PayloadAction<GodState>) => normalizeCssProps(a.payload),
  },
})

export const {
  setWorkflow, setTree, setPackages, setCss, setDropdowns,
  setSmtp, setTests, setPlan, clearDirty, rehydrate,
} = godSlice.actions
export default godSlice.reducer
