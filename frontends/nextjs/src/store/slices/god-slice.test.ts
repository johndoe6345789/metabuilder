import { describe, expect, it } from 'vitest'

import reducer, {
  clearDirty,
  rehydrate,
  setCss,
  setDropdowns,
  setPackages,
  setPlan,
  setSmtp,
  setTests,
  setTree,
  setWorkflow,
  type GodDomain,
  type GodState,
} from './god-slice'

const initial = (): GodState =>
  reducer(undefined, { type: '@@INIT' }) as GodState

describe('initial state', () => {
  it('starts with nothing dirty', () => {
    expect(Object.values(initial().dirty).every(v => !v)).toBe(true)
  })

  it('seeds an empty workflow and a root container', () => {
    const state = initial()
    expect(state.workflow.nodes).toEqual([])
    expect(state.tree.id).toBe('root')
  })

  it('has a dirty flag for every domain it stores', () => {
    const state = initial()
    const domains: GodDomain[] = [
      'workflow',
      'tree',
      'packages',
      'css',
      'dropdowns',
      'smtp',
      'tests',
      'plan',
    ]
    for (const domain of domains) {
      expect(state.dirty[domain]).toBe(false)
    }
  })
})

// Every setter does the same two things: store the value, and mark that
// domain unsaved. Testing them as a table is what makes a setter that
// forgets the second half visible.
describe.each([
  ['workflow', setWorkflow, { id: 'w', name: 'W', nodes: [] }],
  ['tree', setTree, { id: 'root', type: 'container', props: {}, children: [] }],
  ['packages', setPackages, [{ id: 'p' }]],
  ['css', setCss, [{ id: 'c', name: 'c', props: {} }]],
  ['dropdowns', setDropdowns, [{ id: 'd', name: 'd', options: [] }]],
  ['smtp', setSmtp, { host: 'mail', port: 25 }],
  ['tests', setTests, [{ id: 't', name: 't', input: '{}', expected: '{}' }]],
  ['plan', setPlan, [{ id: 'p', title: 'p', status: 'todo' }]],
])('%s', (domain, action, payload) => {
  it('stores what it was given', () => {
    const state = reducer(initial(), action(payload as never))
    expect(state[domain as keyof GodState]).toEqual(payload)
  })

  it('marks the domain unsaved', () => {
    const state = reducer(initial(), action(payload as never))
    expect(state.dirty[domain as GodDomain]).toBe(true)
  })

  it('leaves the other domains clean', () => {
    const state = reducer(initial(), action(payload as never))
    const others = Object.entries(state.dirty).filter(([k]) => k !== domain)
    expect(others.every(([, v]) => !v)).toBe(true)
  })
})

describe('clearDirty', () => {
  it('marks one domain saved again', () => {
    const dirty = reducer(initial(), setPlan([]))
    expect(reducer(dirty, clearDirty('plan')).dirty.plan).toBe(false)
  })

  it('leaves the other domains alone', () => {
    let state = reducer(initial(), setPlan([]))
    state = reducer(state, setCss([]))
    state = reducer(state, clearDirty('plan'))
    expect(state.dirty.css).toBe(true)
  })

  it('is harmless on a domain that is already clean', () => {
    expect(reducer(initial(), clearDirty('css')).dirty.css).toBe(false)
  })
})

describe('rehydrate', () => {
  it('replaces the whole state', () => {
    const state = reducer(
      initial(),
      rehydrate({ ...initial(), plan: [{ id: 'x', title: 'X' }] } as GodState)
    )
    expect(state.plan).toHaveLength(1)
  })

  // A persisted project may predate a field, so the defaults have to fill
  // the gaps rather than leaving them undefined.
  it('fills in fields the saved project never had', () => {
    const state = reducer(initial(), rehydrate({} as GodState))
    expect(state.css.length).toBeGreaterThan(0)
    expect(state.dirty.workflow).toBe(false)
  })

  it('fills in missing dirty flags', () => {
    const state = reducer(
      initial(),
      rehydrate({ dirty: { plan: true } } as unknown as GodState)
    )
    expect(state.dirty.plan).toBe(true)
    expect(state.dirty.css).toBe(false)
  })

  // Older projects stored CSS properties under their hyphenated CSS names,
  // which React refuses in a style object.
  it.each([
    ['border-radius', 'borderRadius'],
    ['font-size', 'fontSize'],
    ['font-weight', 'fontWeight'],
  ])('renames %s to %s', (hyphenated, camel) => {
    const state = reducer(
      initial(),
      rehydrate({
        css: [{ id: 'c', name: 'c', props: { [hyphenated]: '4px' } }],
      } as unknown as GodState)
    )
    const props = state.css[0]?.props as Record<string, unknown>
    expect(props[camel]).toBe('4px')
    expect(hyphenated in props).toBe(false)
  })

  it('renames every hyphenated property in one pass', () => {
    const state = reducer(
      initial(),
      rehydrate({
        css: [
          {
            id: 'c',
            name: 'c',
            props: {
              'border-radius': '4px',
              'font-size': '12px',
              'font-weight': '600',
            },
          },
        ],
      } as unknown as GodState)
    )
    expect(state.css[0]?.props).toEqual({
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
    })
  })

  it('leaves already-camelCase properties alone', () => {
    const state = reducer(
      initial(),
      rehydrate({
        css: [{ id: 'c', name: 'c', props: { borderRadius: '8px' } }],
      } as unknown as GodState)
    )
    expect(state.css[0]?.props).toEqual({ borderRadius: '8px' })
  })

  it('keeps the other CSS fields', () => {
    const state = reducer(
      initial(),
      rehydrate({
        css: [{ id: 'c_x', name: 'named', props: { 'font-size': '9px' } }],
      } as unknown as GodState)
    )
    expect(state.css[0]).toMatchObject({ id: 'c_x', name: 'named' })
  })
})
