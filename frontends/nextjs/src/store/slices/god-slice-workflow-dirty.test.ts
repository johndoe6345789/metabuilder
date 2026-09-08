import { describe, expect, it } from 'vitest'

import reducer, {
  addWorkflow,
  patchWorkflow,
  resetTenantOwned,
  workflowPublished,
  type GodState,
} from './god-slice'
import { newWorkflowEntry } from './god-slice/workflow-entry'

const entry = (name: string) => newWorkflowEntry(name)

const withTwo = () => {
  const a = entry('A')
  const b = entry('B')
  let s = reducer(undefined, addWorkflow({ tenant: 'acme', entry: a }))
  s = reducer(s, addWorkflow({ tenant: 'acme', entry: b }))
  return { s: s as GodState, a: a.workflow.id, b: b.workflow.id }
}

/**
 * `dirty.workflow` was one flag covering every workflow, so publishing any
 * of them cleared it. Edit A, switch to B, publish B, and the bar read
 * "Published -- up to date" while A's edits had never been written.
 */
describe('which workflows have unpublished edits', () => {
  it('remembers each one that was touched', () => {
    const { s, a, b } = withTwo()
    expect(s.dirtyWorkflows).toContain(a)
    expect(s.dirtyWorkflows).toContain(b)
  })

  it('clears only the one that was published', () => {
    const { s, a, b } = withTwo()
    const after = reducer(s, workflowPublished(b)) as GodState

    expect(after.dirtyWorkflows).toContain(a)
    expect(after.dirtyWorkflows).not.toContain(b)
    // Something is still unpublished, so the indicator stays lit.
    expect(after.dirty.workflow).toBe(true)
  })

  it('goes clean once the last one is published', () => {
    const { s, a, b } = withTwo()
    let after = reducer(s, workflowPublished(b)) as GodState
    after = reducer(after, workflowPublished(a)) as GodState

    expect(after.dirtyWorkflows).toEqual([])
    expect(after.dirty.workflow).toBe(false)
  })

  it('marks it again when it is edited after publishing', () => {
    const { s, a, b } = withTwo()
    let after = reducer(s, workflowPublished(a)) as GodState
    after = reducer(
      after,
      patchWorkflow({ tenant: 'acme', id: a, change: { trigger: 'x' } })
    ) as GodState

    expect(after.dirtyWorkflows).toContain(a)
    expect(after.dirtyWorkflows).toContain(b)
  })

  // The reset's own comment has always named workflow; the body did not
  // clear it, so a tenant switch left the previous one's "unpublished
  // changes" showing over a list that had already been swapped out.
  it('is cleared when the panel switches community', () => {
    const { s } = withTwo()
    const after = reducer(s, resetTenantOwned()) as GodState

    expect(after.dirtyWorkflows).toEqual([])
    expect(after.dirty.workflow).toBe(false)
  })

  // A slice persisted before this key existed rehydrates without it.
  it('survives a state that predates the set', () => {
    const old = { ...withTwo().s, dirtyWorkflows: undefined }
    const after = reducer(old, workflowPublished('anything')) as GodState

    expect(after.dirtyWorkflows).toEqual([])
    expect(after.dirty.workflow).toBe(false)
  })
})
