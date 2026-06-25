import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  fetchAllFromDBAL: vi.fn().mockResolvedValue({}),
}))

import reducer, {
  clearConflicts,
  setAutoResolveStrategy,
  removeConflict,
} from './conflictsSlice'
import type { ConflictItem } from '@/types/conflicts'

function makeConflict(id: string): ConflictItem {
  return {
    id,
    entityType: 'files',
    localVersion: { id, name: 'local' },
    remoteVersion: { id, name: 'remote' },
    localTimestamp: 1000,
    remoteTimestamp: 2000,
    conflictDetectedAt: Date.now(),
  }
}

describe('conflictsSlice reducer', () => {
  const empty = {
    conflicts: [],
    autoResolveStrategy: null,
    detectingConflicts: false,
    resolvingConflict: null,
    error: null,
  }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('clearConflicts', () => {
    it('removes all conflicts and clears error', () => {
      const stateWithConflicts = {
        ...empty,
        conflicts: [makeConflict('1'), makeConflict('2')],
        error: 'some error',
      }
      const state = reducer(stateWithConflicts, clearConflicts())
      expect(state.conflicts).toHaveLength(0)
      expect(state.error).toBeNull()
    })
  })

  describe('setAutoResolveStrategy', () => {
    it('sets the auto resolve strategy', () => {
      const state = reducer(empty, setAutoResolveStrategy('local'))
      expect(state.autoResolveStrategy).toBe('local')
    })

    it('sets strategy to null', () => {
      let state = reducer(empty, setAutoResolveStrategy('remote'))
      state = reducer(state, setAutoResolveStrategy(null))
      expect(state.autoResolveStrategy).toBeNull()
    })

    it('supports all strategy types', () => {
      for (const strategy of ['local', 'remote', 'manual', 'merge'] as const) {
        const state = reducer(empty, setAutoResolveStrategy(strategy))
        expect(state.autoResolveStrategy).toBe(strategy)
      }
    })
  })

  describe('removeConflict', () => {
    it('removes a specific conflict by id', () => {
      const stateWithConflicts = {
        ...empty,
        conflicts: [makeConflict('1'), makeConflict('2'), makeConflict('3')],
      }
      const state = reducer(stateWithConflicts, removeConflict('2'))
      expect(state.conflicts.map(c => c.id)).toEqual(['1', '3'])
    })

    it('is a no-op when id not found', () => {
      const stateWithConflicts = {
        ...empty,
        conflicts: [makeConflict('1')],
      }
      const state = reducer(stateWithConflicts, removeConflict('999'))
      expect(state.conflicts).toHaveLength(1)
    })
  })

  describe('detectConflicts async actions', () => {
    it('sets detectingConflicts=true on pending', () => {
      const action = { type: 'conflicts/detectConflicts/pending' }
      const state = reducer(empty, action)
      expect(state.detectingConflicts).toBe(true)
      expect(state.error).toBeNull()
    })

    it('sets detectingConflicts=false and replaces conflicts on fulfilled', () => {
      const conflicts = [makeConflict('a')]
      const action = { type: 'conflicts/detectConflicts/fulfilled', payload: conflicts }
      const state = reducer({ ...empty, detectingConflicts: true }, action)
      expect(state.detectingConflicts).toBe(false)
      expect(state.conflicts).toEqual(conflicts)
    })

    it('sets error and detectingConflicts=false on rejected', () => {
      const action = {
        type: 'conflicts/detectConflicts/rejected',
        payload: 'fetch failed',
      }
      const state = reducer({ ...empty, detectingConflicts: true }, action)
      expect(state.detectingConflicts).toBe(false)
      expect(state.error).toBe('fetch failed')
    })
  })

  describe('resolveConflict async actions', () => {
    it('sets resolvingConflict id on pending', () => {
      const action = {
        type: 'conflicts/resolveConflict/pending',
        meta: { arg: { conflictId: 'c1', strategy: 'local' } },
      }
      const state = reducer(empty, action)
      expect(state.resolvingConflict).toBe('c1')
    })

    it('removes resolved conflict and clears resolvingConflict on fulfilled', () => {
      const stateWithConflict = {
        ...empty,
        resolvingConflict: 'c1',
        conflicts: [makeConflict('c1')],
      }
      const action = {
        type: 'conflicts/resolveConflict/fulfilled',
        payload: { conflictId: 'c1', strategy: 'local', resolvedVersion: {}, timestamp: 0 },
      }
      const state = reducer(stateWithConflict, action)
      expect(state.resolvingConflict).toBeNull()
      expect(state.conflicts).toHaveLength(0)
    })

    it('sets error on rejected', () => {
      const action = {
        type: 'conflicts/resolveConflict/rejected',
        payload: 'resolution failed',
      }
      const state = reducer(empty, action)
      expect(state.error).toBe('resolution failed')
      expect(state.resolvingConflict).toBeNull()
    })
  })

  describe('resolveAllConflicts async actions', () => {
    it('clears error on pending', () => {
      const action = { type: 'conflicts/resolveAllConflicts/pending' }
      const state = reducer({ ...empty, error: 'old error' }, action)
      expect(state.error).toBeNull()
    })

    it('clears all conflicts on fulfilled', () => {
      const stateWithConflicts = { ...empty, conflicts: [makeConflict('1'), makeConflict('2')] }
      const action = { type: 'conflicts/resolveAllConflicts/fulfilled', payload: [] }
      const state = reducer(stateWithConflicts, action)
      expect(state.conflicts).toHaveLength(0)
    })

    it('sets error on rejected', () => {
      const action = {
        type: 'conflicts/resolveAllConflicts/rejected',
        payload: 'bulk resolve error',
      }
      const state = reducer(empty, action)
      expect(state.error).toBe('bulk resolve error')
    })
  })

  describe('resolveConflict async actions - pending clears error', () => {
    it('clears error on resolveConflict pending', () => {
      const stateWithError = { ...empty, error: 'previous error' }
      const action = {
        type: 'conflicts/resolveConflict/pending',
        meta: { arg: { conflictId: 'c2', strategy: 'remote' } },
      }
      const state = reducer(stateWithError, action)
      expect(state.error).toBeNull()
      expect(state.resolvingConflict).toBe('c2')
    })
  })
})
