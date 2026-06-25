import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
  fetchAllFromDBAL: vi.fn().mockResolvedValue({}),
}))

import reducer, {
  addModel,
  updateModel,
  removeModel,
  setActiveModel,
  clearActiveModel,
  setModels,
  type Model,
} from './modelsSlice'

function makeModel(id: string, name = `Model ${id}`): Model {
  return { id, name, fields: [], updatedAt: Date.now() }
}

describe('modelsSlice reducer', () => {
  const empty = { models: [], activeModelId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addModel', () => {
    it('appends a model', () => {
      const state = reducer(empty, addModel(makeModel('1')))
      expect(state.models).toHaveLength(1)
      expect(state.models[0].id).toBe('1')
    })
  })

  describe('updateModel', () => {
    it('updates an existing model', () => {
      let state = reducer(empty, addModel(makeModel('1', 'Original')))
      state = reducer(state, updateModel(makeModel('1', 'Updated')))
      expect(state.models[0].name).toBe('Updated')
      expect(state.models).toHaveLength(1)
    })

    it('is a no-op for unknown id', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, updateModel(makeModel('999')))
      expect(state.models).toHaveLength(1)
    })
  })

  describe('removeModel', () => {
    it('removes a model by id', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, addModel(makeModel('2')))
      state = reducer(state, removeModel('1'))
      expect(state.models.map(m => m.id)).toEqual(['2'])
    })

    it('clears activeModelId when active model is removed', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, setActiveModel('1'))
      state = reducer(state, removeModel('1'))
      expect(state.activeModelId).toBeNull()
    })

    it('preserves activeModelId when a different model is removed', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, addModel(makeModel('2')))
      state = reducer(state, setActiveModel('2'))
      state = reducer(state, removeModel('1'))
      expect(state.activeModelId).toBe('2')
    })
  })

  describe('setActiveModel / clearActiveModel', () => {
    it('sets active model id', () => {
      const state = reducer(empty, setActiveModel('xyz'))
      expect(state.activeModelId).toBe('xyz')
    })

    it('clears active model id', () => {
      let state = reducer(empty, setActiveModel('xyz'))
      state = reducer(state, clearActiveModel())
      expect(state.activeModelId).toBeNull()
    })
  })

  describe('setModels', () => {
    it('replaces all models', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, setModels([makeModel('10'), makeModel('20')]))
      expect(state.models).toHaveLength(2)
      expect(state.models[0].id).toBe('10')
    })
  })

  describe('dbal/syncFromDBALBulk/fulfilled matcher', () => {
    it('replaces models from bulk payload', () => {
      const action = {
        type: 'dbal/syncFromDBALBulk/fulfilled',
        payload: { data: { models: [makeModel('bulk')] } },
      }
      const state = reducer(empty, action)
      expect(state.models[0].id).toBe('bulk')
    })
  })

  describe('saveModel.fulfilled async action', () => {
    it('updates existing model', () => {
      let state = reducer(empty, addModel(makeModel('1', 'Before')))
      const action = { type: 'models/saveModel/fulfilled', payload: makeModel('1', 'After') }
      state = reducer(state, action)
      expect(state.models[0].name).toBe('After')
    })

    it('adds new model if not present', () => {
      const action = { type: 'models/saveModel/fulfilled', payload: makeModel('new') }
      const state = reducer(empty, action)
      expect(state.models[0].id).toBe('new')
    })
  })

  describe('deleteModel.fulfilled async action', () => {
    it('removes model by id', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, addModel(makeModel('2')))
      const action = { type: 'models/deleteModel/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.models.map(m => m.id)).toEqual(['2'])
    })

    it('clears activeModelId if active model deleted', () => {
      let state = reducer(empty, addModel(makeModel('1')))
      state = reducer(state, setActiveModel('1'))
      const action = { type: 'models/deleteModel/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeModelId).toBeNull()
    })
  })
})
