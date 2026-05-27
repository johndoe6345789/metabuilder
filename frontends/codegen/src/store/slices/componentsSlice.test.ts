import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
  fetchAllFromDBAL: vi.fn().mockResolvedValue({}),
}))

import reducer, {
  addComponent,
  updateComponent,
  removeComponent,
  setActiveComponent,
  clearActiveComponent,
  setComponents,
  type Component,
} from './componentsSlice'

function makeComponent(id: string, name = `Comp ${id}`): Component {
  return {
    id,
    name,
    type: 'atom',
    code: `export const ${name} = () => null`,
    updatedAt: Date.now(),
  }
}

describe('componentsSlice reducer', () => {
  const empty = { components: [], activeComponentId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addComponent', () => {
    it('appends a component', () => {
      const state = reducer(empty, addComponent(makeComponent('1')))
      expect(state.components).toHaveLength(1)
      expect(state.components[0].id).toBe('1')
    })
  })

  describe('updateComponent', () => {
    it('updates an existing component', () => {
      let state = reducer(empty, addComponent(makeComponent('1', 'Old')))
      state = reducer(state, updateComponent(makeComponent('1', 'New')))
      expect(state.components[0].name).toBe('New')
      expect(state.components).toHaveLength(1)
    })

    it('is a no-op for unknown id', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, updateComponent(makeComponent('999')))
      expect(state.components).toHaveLength(1)
    })
  })

  describe('removeComponent', () => {
    it('removes a component by id', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, addComponent(makeComponent('2')))
      state = reducer(state, removeComponent('1'))
      expect(state.components.map(c => c.id)).toEqual(['2'])
    })

    it('clears activeComponentId when active component removed', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, setActiveComponent('1'))
      state = reducer(state, removeComponent('1'))
      expect(state.activeComponentId).toBeNull()
    })

    it('does not clear activeComponentId for a different component', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, addComponent(makeComponent('2')))
      state = reducer(state, setActiveComponent('2'))
      state = reducer(state, removeComponent('1'))
      expect(state.activeComponentId).toBe('2')
    })
  })

  describe('setActiveComponent / clearActiveComponent', () => {
    it('sets active component id', () => {
      const state = reducer(empty, setActiveComponent('abc'))
      expect(state.activeComponentId).toBe('abc')
    })

    it('clears active component id', () => {
      let state = reducer(empty, setActiveComponent('abc'))
      state = reducer(state, clearActiveComponent())
      expect(state.activeComponentId).toBeNull()
    })
  })

  describe('setComponents', () => {
    it('replaces all components', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, setComponents([makeComponent('a'), makeComponent('b')]))
      expect(state.components).toHaveLength(2)
    })
  })

  describe('dbal/syncFromDBALBulk/fulfilled matcher', () => {
    it('replaces components from bulk payload', () => {
      const action = {
        type: 'dbal/syncFromDBALBulk/fulfilled',
        payload: { data: { components: [makeComponent('bulk')] } },
      }
      const state = reducer(empty, action)
      expect(state.components[0].id).toBe('bulk')
    })
  })

  describe('saveComponent.fulfilled async action', () => {
    it('updates existing component', () => {
      let state = reducer(empty, addComponent(makeComponent('1', 'Old')))
      const action = { type: 'components/saveComponent/fulfilled', payload: makeComponent('1', 'New') }
      state = reducer(state, action)
      expect(state.components[0].name).toBe('New')
    })

    it('adds new component if not present', () => {
      const action = { type: 'components/saveComponent/fulfilled', payload: makeComponent('new') }
      const state = reducer(empty, action)
      expect(state.components[0].id).toBe('new')
    })
  })

  describe('deleteComponent.fulfilled async action', () => {
    it('removes component by id', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, addComponent(makeComponent('2')))
      const action = { type: 'components/deleteComponent/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.components.map(c => c.id)).toEqual(['2'])
    })

    it('clears activeComponentId if active component deleted', () => {
      let state = reducer(empty, addComponent(makeComponent('1')))
      state = reducer(state, setActiveComponent('1'))
      const action = { type: 'components/deleteComponent/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeComponentId).toBeNull()
    })
  })
})
