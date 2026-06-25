import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
}))

import reducer, {
  addLambda,
  updateLambda,
  deleteLambda,
  setActiveLambda,
  clearActiveLambda,
  setLambdas,
  type Lambda,
} from './lambdasSlice'

function makeLambda(id: string, name = `Lambda ${id}`): Lambda {
  return {
    id,
    name,
    code: `def handler_${id}(): pass`,
    runtime: 'python3.9',
    handler: `main.handler_${id}`,
    updatedAt: Date.now(),
  }
}

describe('lambdasSlice reducer', () => {
  const empty = { lambdas: [], activeLambdaId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addLambda', () => {
    it('appends a lambda', () => {
      const state = reducer(empty, addLambda(makeLambda('1')))
      expect(state.lambdas).toHaveLength(1)
      expect(state.lambdas[0].id).toBe('1')
    })
  })

  describe('updateLambda', () => {
    it('updates an existing lambda', () => {
      let state = reducer(empty, addLambda(makeLambda('1', 'Old')))
      state = reducer(state, updateLambda(makeLambda('1', 'New')))
      expect(state.lambdas[0].name).toBe('New')
      expect(state.lambdas).toHaveLength(1)
    })

    it('is a no-op for unknown id', () => {
      let state = reducer(empty, addLambda(makeLambda('1')))
      state = reducer(state, updateLambda(makeLambda('999')))
      expect(state.lambdas).toHaveLength(1)
    })
  })

  describe('deleteLambda', () => {
    it('removes a lambda by id', () => {
      let state = reducer(empty, addLambda(makeLambda('1')))
      state = reducer(state, addLambda(makeLambda('2')))
      state = reducer(state, deleteLambda('1'))
      expect(state.lambdas.map(l => l.id)).toEqual(['2'])
    })

    it('clears activeLambdaId when active lambda is deleted', () => {
      let state = reducer(empty, addLambda(makeLambda('1')))
      state = reducer(state, setActiveLambda('1'))
      state = reducer(state, deleteLambda('1'))
      expect(state.activeLambdaId).toBeNull()
    })

    it('preserves activeLambdaId when different lambda is deleted', () => {
      let state = reducer(empty, addLambda(makeLambda('1')))
      state = reducer(state, addLambda(makeLambda('2')))
      state = reducer(state, setActiveLambda('2'))
      state = reducer(state, deleteLambda('1'))
      expect(state.activeLambdaId).toBe('2')
    })
  })

  describe('setActiveLambda / clearActiveLambda', () => {
    it('sets active lambda id', () => {
      const state = reducer(empty, setActiveLambda('abc'))
      expect(state.activeLambdaId).toBe('abc')
    })

    it('clears active lambda id', () => {
      let state = reducer(empty, setActiveLambda('abc'))
      state = reducer(state, clearActiveLambda())
      expect(state.activeLambdaId).toBeNull()
    })
  })

  describe('setLambdas', () => {
    it('replaces all lambdas', () => {
      let state = reducer(empty, addLambda(makeLambda('1')))
      state = reducer(state, setLambdas([makeLambda('a'), makeLambda('b')]))
      expect(state.lambdas).toHaveLength(2)
      expect(state.lambdas[0].id).toBe('a')
    })
  })
})
