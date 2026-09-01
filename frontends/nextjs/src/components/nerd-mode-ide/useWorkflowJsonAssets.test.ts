import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  saveWorkflowJsonAssets,
  useWorkflowJsonAssets,
} from './useWorkflowJsonAssets'

const KEY = 'workflow-json-assets'

beforeEach(() => {
  localStorage.clear()
})

describe('saveWorkflowJsonAssets', () => {
  it('writes assets to localStorage as JSON', () => {
    saveWorkflowJsonAssets([{ id: 'a1', name: 'a.json', code: '{}' }])
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual([
      { id: 'a1', name: 'a.json', code: '{}' },
    ])
  })
})

describe('useWorkflowJsonAssets', () => {
  it('starts empty with nothing selected when localStorage is empty', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    expect(result.current.assets).toEqual([])
    expect(result.current.selectedId).toBeNull()
    expect(result.current.selected).toBeNull()
  })

  it('loads existing assets and selects the first one', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: 'a1', name: 'a.json', code: '{}' },
        { id: 'a2', name: 'b.json', code: '{}' },
      ])
    )
    const { result } = renderHook(() => useWorkflowJsonAssets())
    expect(result.current.assets).toHaveLength(2)
    expect(result.current.selectedId).toBe('a1')
    expect(result.current.selected?.id).toBe('a1')
  })

  it('ignores malformed localStorage content', () => {
    localStorage.setItem(KEY, '{not json')
    const { result } = renderHook(() => useWorkflowJsonAssets())
    expect(result.current.assets).toEqual([])
  })

  it('addAsset creates and selects a new default workflow, persisting it', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    act(() => result.current.addAsset())

    expect(result.current.assets).toHaveLength(1)
    expect(result.current.assets[0].name).toBe('new-workflow.json')
    expect(result.current.selectedId).toBe(result.current.assets[0].id)
    expect(result.current.selected).toEqual(result.current.assets[0])

    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    expect(stored).toHaveLength(1)
  })

  it('updateName renames the matching asset without touching others', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    act(() => result.current.addAsset())
    const id = result.current.assets[0].id

    act(() => result.current.updateName('renamed.json', id))

    expect(result.current.assets[0].name).toBe('renamed.json')
  })

  it('updateName does nothing when id is null', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    act(() => result.current.addAsset())
    const before = result.current.assets[0].name

    act(() => result.current.updateName('ignored.json', null))

    expect(result.current.assets[0].name).toBe(before)
  })

  it('save persists the current in-memory assets', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    act(() => result.current.addAsset())
    localStorage.clear()

    act(() => result.current.save())

    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    expect(stored).toHaveLength(1)
  })

  it('selecting a different id changes `selected`', () => {
    const { result } = renderHook(() => useWorkflowJsonAssets())
    act(() => result.current.addAsset())
    act(() => result.current.addAsset())
    const [first] = result.current.assets

    act(() => result.current.setSelectedId(first.id))

    expect(result.current.selected?.id).toBe(first.id)
  })
})
