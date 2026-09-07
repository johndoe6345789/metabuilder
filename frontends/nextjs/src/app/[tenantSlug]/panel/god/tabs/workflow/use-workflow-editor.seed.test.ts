import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useWorkflowEditor } from './use-workflow-editor'
import type { Workflow } from '@/workflow-editor'

const workflow = (id: string, nodeCount: number): Workflow => ({
  id,
  name: id,
  description: '',
  nodes: Array.from({ length: nodeCount }, (_, i) => ({
    id: `${id}-n${i}`,
    type: 'dbal.log',
    name: 'Write a note to the log',
    position: { x: 0, y: 0 },
    config: {},
    inputs: ['main'],
    outputs: ['main'],
  })) as Workflow['nodes'],
  connections: [],
  createdAt: '',
  updatedAt: '',
})

/**
 * The editor seeds its state from the prop once, by design -- it owns the
 * graph while you are dragging it about. That makes the *caller*
 * responsible for remounting it when a different workflow is picked, and
 * WorkflowsTab does so with a key.
 *
 * Without that key the canvas kept showing the previous workflow and
 * every edit landed on it: picking "Workflow 2" and adding a step added
 * the step to "Workflow 1", with nothing anywhere saying so.
 */
describe('useWorkflowEditor seeding', () => {
  it('holds the workflow it was seeded with', () => {
    const { result } = renderHook(() => useWorkflowEditor(workflow('a', 1), () => undefined))
    expect(result.current.workflow.id).toBe('a')
    expect(result.current.workflow.nodes).toHaveLength(1)
  })

  it('does not follow a different workflow arriving as a prop', () => {
    const { result, rerender } = renderHook(
      ({ wf }) => useWorkflowEditor(wf, () => undefined),
      { initialProps: { wf: workflow('a', 1) } }
    )

    rerender({ wf: workflow('b', 3) })

    // Still 'a': the caller has to remount, which is what the key does.
    expect(result.current.workflow.id).toBe('a')
  })

  it('starts from the new workflow when remounted, as the key causes', () => {
    const { result, unmount } = renderHook(() =>
      useWorkflowEditor(workflow('a', 1), () => undefined)
    )
    expect(result.current.workflow.id).toBe('a')
    unmount()

    const second = renderHook(() =>
      useWorkflowEditor(workflow('b', 3), () => undefined)
    )
    expect(second.result.current.workflow.id).toBe('b')
    expect(second.result.current.workflow.nodes).toHaveLength(3)
  })
})
