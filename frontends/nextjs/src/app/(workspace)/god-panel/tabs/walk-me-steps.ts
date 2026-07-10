'use client'

export type WalkStep = {
  tabId: string
  title: string
  body: string
}

export const WALK_ME_STEPS = [
  {
    tabId: 'overview',
    title: 'Check the system is alive',
    body: 'Confirm DBAL is connected, then use quick actions only when you need export, import, or preview.',
  },
  {
    tabId: 'rendition',
    title: 'Shape this tenant',
    body: 'Define the branded shell, enabled control panel modules, and navigation before assembling pages.',
  },
  {
    tabId: 'plan',
    title: 'Turn intent into tasks',
    body: 'Capture the feature you are building before editing schemas, pages, or workflows.',
  },
  {
    tabId: 'schemas',
    title: 'Model the data',
    body: 'Create or adjust DBAL entities first so the rest of the builder has real structure to work with.',
  },
  {
    tabId: 'components',
    title: 'Build the page surface',
    body: 'Assemble UI blocks, wire useful actions, and preview the actual experience instead of static placeholders.',
  },
  {
    tabId: 'workflows',
    title: 'Wire behavior',
    body: 'Connect triggers, actions, branches, and tests so clicks produce visible outcomes.',
  },
  {
    tabId: 'credentials',
    title: 'Bind tenant secrets',
    body: 'Create credentials scoped to this tenant; supergods can move across tenants when needed.',
  },
  {
    tabId: 'test',
    title: 'Prove it works',
    body: 'Run point-and-click tests against the current workflow and fix failures before deployment.',
  },
  {
    tabId: 'deploy',
    title: 'Ship or export',
    body: 'Use deploy/export only after pages, data, credentials, and tests match the target tenant.',
  },
] as const satisfies readonly WalkStep[]
