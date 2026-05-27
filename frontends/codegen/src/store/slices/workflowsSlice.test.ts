import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
}))

import reducer, {
  addWorkflow,
  updateWorkflow,
  removeWorkflow,
  setActiveWorkflow,
  clearActiveWorkflow,
  setWorkflows,
  type Workflow,
} from './workflowsSlice'

function makeWorkflow(id: string, name = `Workflow ${id}`): Workflow {
  return {
    id,
    name,
    nodes: [],
    edges: [],
    updatedAt: Date.now(),
  }
}

describe('workflowsSlice reducer', () => {
  const empty = { workflows: [], activeWorkflowId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addWorkflow', () => {
    it('appends a workflow', () => {
      const state = reducer(empty, addWorkflow(makeWorkflow('1')))
      expect(state.workflows).toHaveLength(1)
      expect(state.workflows[0].id).toBe('1')
    })
  })

  describe('updateWorkflow', () => {
    it('updates an existing workflow', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1', 'Old')))
      state = reducer(state, updateWorkflow(makeWorkflow('1', 'New')))
      expect(state.workflows[0].name).toBe('New')
    })

    it('is a no-op for unknown id', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, updateWorkflow(makeWorkflow('999')))
      expect(state.workflows).toHaveLength(1)
    })
  })

  describe('removeWorkflow', () => {
    it('removes a workflow by id', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, addWorkflow(makeWorkflow('2')))
      state = reducer(state, removeWorkflow('1'))
      expect(state.workflows.map(w => w.id)).toEqual(['2'])
    })

    it('clears activeWorkflowId when active workflow removed', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, setActiveWorkflow('1'))
      state = reducer(state, removeWorkflow('1'))
      expect(state.activeWorkflowId).toBeNull()
    })

    it('preserves activeWorkflowId when different workflow removed', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, addWorkflow(makeWorkflow('2')))
      state = reducer(state, setActiveWorkflow('2'))
      state = reducer(state, removeWorkflow('1'))
      expect(state.activeWorkflowId).toBe('2')
    })
  })

  describe('setActiveWorkflow / clearActiveWorkflow', () => {
    it('sets active workflow id', () => {
      const state = reducer(empty, setActiveWorkflow('abc'))
      expect(state.activeWorkflowId).toBe('abc')
    })

    it('clears active workflow id', () => {
      let state = reducer(empty, setActiveWorkflow('abc'))
      state = reducer(state, clearActiveWorkflow())
      expect(state.activeWorkflowId).toBeNull()
    })
  })

  describe('setWorkflows', () => {
    it('replaces all workflows', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, setWorkflows([makeWorkflow('a'), makeWorkflow('b')]))
      expect(state.workflows).toHaveLength(2)
    })
  })

  describe('dbal/syncFromDBALBulk/fulfilled matcher', () => {
    it('replaces workflows from bulk payload', () => {
      const action = {
        type: 'dbal/syncFromDBALBulk/fulfilled',
        payload: { data: { workflows: [makeWorkflow('bulk')] } },
      }
      const state = reducer(empty, action)
      expect(state.workflows[0].id).toBe('bulk')
    })
  })

  describe('saveWorkflow.fulfilled async action', () => {
    it('updates existing workflow', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1', 'Before')))
      const action = { type: 'workflows/saveWorkflow/fulfilled', payload: makeWorkflow('1', 'After') }
      state = reducer(state, action)
      expect(state.workflows[0].name).toBe('After')
    })

    it('adds new workflow if not present', () => {
      const action = { type: 'workflows/saveWorkflow/fulfilled', payload: makeWorkflow('new') }
      const state = reducer(empty, action)
      expect(state.workflows[0].id).toBe('new')
    })
  })

  describe('deleteWorkflow.fulfilled async action', () => {
    it('removes workflow by id', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, addWorkflow(makeWorkflow('2')))
      const action = { type: 'workflows/deleteWorkflow/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.workflows.map(w => w.id)).toEqual(['2'])
    })

    it('clears activeWorkflowId if active workflow deleted', () => {
      let state = reducer(empty, addWorkflow(makeWorkflow('1')))
      state = reducer(state, setActiveWorkflow('1'))
      const action = { type: 'workflows/deleteWorkflow/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeWorkflowId).toBeNull()
    })
  })
})
