import { SEED_CSS } from './seed-css'
import { SEED_DROPDOWNS, SEED_PLAN, SEED_TESTS } from './seed-content'
import type { GodState } from './types'

const now = () => new Date().toISOString()

export const initialState: GodState = {
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
  css: SEED_CSS,
  dropdowns: SEED_DROPDOWNS,
  smtp: {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'MetaBuilder',
  },
  tests: SEED_TESTS,
  plan: SEED_PLAN,
  dirty: {
    workflow: false,
    tree: false,
    packages: false,
    css: false,
    dropdowns: false,
    smtp: false,
    tests: false,
    plan: false,
  },
}
