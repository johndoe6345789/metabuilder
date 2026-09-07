import { describe, expect, it } from 'vitest'

import reducer, {
  addWorkflow,
  patchWorkflow,
  removeWorkflow,
  selectWorkflow,
  setWorkflows,
  type GodState,
} from './god-slice'
import { newWorkflowEntry } from './god-slice/workflow-entry'

const initial = (): GodState =>
  reducer(undefined, { type: '@@INIT' }) as GodState

const entry = (name: string) => newWorkflowEntry(name)

describe('a tenant’s workflows', () => {
  it('starts with none, and holds as many as are added', () => {
    let state = initial()
    expect(state.workflows).toEqual({})

    state = reducer(state, addWorkflow({ tenant: 'acme', entry: entry('One') }))
    state = reducer(state, addWorkflow({ tenant: 'acme', entry: entry('Two') }))
    state = reducer(
      state,
      addWorkflow({ tenant: 'acme', entry: entry('Three') })
    )

    expect(state.workflows?.acme?.map(e => e.workflow.name)).toEqual([
      'One',
      'Two',
      'Three',
    ])
  })

  /**
   * The slice persists per browser origin, not per tenant. A flat list
   * would show one tenant's automation to whoever signs in next on the
   * same machine -- a workflow says what a business does automatically
   * and to what.
   */
  it('never shows one tenant’s workflows to another', () => {
    let state = initial()
    state = reducer(
      state,
      addWorkflow({ tenant: 'harbour', entry: entry('Log a booking') })
    )

    expect(state.workflows?.kestrel).toBeUndefined()
    expect(state.workflows?.harbour).toHaveLength(1)
  })

  it('adds a workflow already selected, so it is the one being edited', () => {
    const made = entry('Fresh')
    const state = reducer(initial(), addWorkflow({ tenant: 'acme', entry: made }))

    expect(state.workflowSelected?.acme).toBe(made.workflow.id)
  })

  it('changes only the workflow named', () => {
    const one = entry('One')
    const two = entry('Two')
    let state = reducer(initial(), setWorkflows({ tenant: 'acme', entries: [one, two] }))

    state = reducer(
      state,
      patchWorkflow({
        tenant: 'acme',
        id: two.workflow.id,
        change: { trigger: 'FormSubmission.created' },
      })
    )

    expect(state.workflows?.acme?.[0]?.trigger).toBe('')
    expect(state.workflows?.acme?.[1]?.trigger).toBe('FormSubmission.created')
  })

  it('removes the one asked for', () => {
    const one = entry('One')
    const two = entry('Two')
    let state = reducer(initial(), setWorkflows({ tenant: 'acme', entries: [one, two] }))

    state = reducer(state, removeWorkflow({ tenant: 'acme', id: one.workflow.id }))

    expect(state.workflows?.acme?.map(e => e.workflow.name)).toEqual(['Two'])
  })

  // Removing the last leaves the tab with nothing to show and no way back.
  it('keeps the last one', () => {
    const only = entry('Only')
    let state = reducer(initial(), setWorkflows({ tenant: 'acme', entries: [only] }))

    state = reducer(state, removeWorkflow({ tenant: 'acme', id: only.workflow.id }))

    expect(state.workflows?.acme).toHaveLength(1)
  })

  it('remembers which one each tenant is editing, separately', () => {
    const a = entry('A')
    const b = entry('B')
    let state = reducer(initial(), setWorkflows({ tenant: 'acme', entries: [a, b] }))
    state = reducer(state, selectWorkflow({ tenant: 'acme', id: b.workflow.id }))
    state = reducer(state, selectWorkflow({ tenant: 'globex', id: 'other' }))

    expect(state.workflowSelected?.acme).toBe(b.workflow.id)
    expect(state.workflowSelected?.globex).toBe('other')
  })

  it('gives every workflow its own id', () => {
    const ids = new Set([entry('x'), entry('x'), entry('x')].map(e => e.workflow.id))
    expect(ids.size).toBe(3)
  })
})
