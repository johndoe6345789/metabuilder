import { describe, expect, it } from 'vitest'
import reducer, { setUIState, deleteUIState, clearUIState } from './uiStateSlice'

describe('uiStateSlice reducer', () => {
  const emptyState = { data: {} }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(emptyState)
  })

  it('setUIState stores a value by key', () => {
    const state = reducer(emptyState, setUIState({ key: 'sidebar', value: true }))
    expect(state.data.sidebar).toBe(true)
  })

  it('setUIState overwrites existing value', () => {
    let state = reducer(emptyState, setUIState({ key: 'count', value: 1 }))
    state = reducer(state, setUIState({ key: 'count', value: 42 }))
    expect(state.data.count).toBe(42)
  })

  it('setUIState stores object values', () => {
    const state = reducer(emptyState, setUIState({ key: 'modal', value: { open: true, id: '5' } }))
    expect(state.data.modal).toEqual({ open: true, id: '5' })
  })

  it('deleteUIState removes a key', () => {
    let state = reducer(emptyState, setUIState({ key: 'temp', value: 'hello' }))
    state = reducer(state, deleteUIState('temp'))
    expect(state.data.temp).toBeUndefined()
  })

  it('deleteUIState is a no-op for non-existent key', () => {
    const state = reducer(emptyState, deleteUIState('nonexistent'))
    expect(state).toEqual(emptyState)
  })

  it('clearUIState removes all keys', () => {
    let state = reducer(emptyState, setUIState({ key: 'a', value: 1 }))
    state = reducer(state, setUIState({ key: 'b', value: 2 }))
    state = reducer(state, clearUIState())
    expect(state.data).toEqual({})
  })

  it('multiple keys can coexist', () => {
    let state = reducer(emptyState, setUIState({ key: 'x', value: 'foo' }))
    state = reducer(state, setUIState({ key: 'y', value: 'bar' }))
    expect(Object.keys(state.data)).toHaveLength(2)
  })
})
