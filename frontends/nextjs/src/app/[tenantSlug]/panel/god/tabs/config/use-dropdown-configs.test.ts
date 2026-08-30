import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({ dropdowns: [] as unknown[] }))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setDropdowns') store.dropdowns = action.payload as unknown[]
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    setDropdowns: (payload: unknown) => ({ type: 'setDropdowns', payload }),
  }
})

import { useDropdownConfigs } from './use-dropdown-configs'

beforeEach(() => {
  store.dropdowns = []
})

describe('create', () => {
  it('adds a new list with no options', () => {
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.create('Status')
    })
    expect(store.dropdowns).toEqual([
      expect.objectContaining({ name: 'Status', options: [] }),
    ])
  })

  it('returns the new list\'s id', () => {
    const { result } = renderHook(() => useDropdownConfigs())
    let id = ''
    act(() => {
      id = result.current.create('Status')
    })
    expect((store.dropdowns[0] as { id: string }).id).toBe(id)
  })

  it('names a blank list "new-list" rather than leaving it empty', () => {
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.create('   ')
    })
    expect((store.dropdowns[0] as { name: string }).name).toBe('new-list')
  })
})

describe('rename', () => {
  it('renames only the named list', () => {
    store.dropdowns = [
      { id: 'd1', name: 'A', options: [] },
      { id: 'd2', name: 'B', options: [] },
    ]
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.rename('d1', 'Renamed')
    })
    expect(store.dropdowns).toEqual([
      { id: 'd1', name: 'Renamed', options: [] },
      { id: 'd2', name: 'B', options: [] },
    ])
  })
})

describe('addOption / removeOption', () => {
  beforeEach(() => {
    store.dropdowns = [{ id: 'd1', name: 'A', options: [] }]
  })

  it('appends an option to the named list', () => {
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.addOption('d1', { label: 'Active', value: 'active' })
    })
    expect(
      (store.dropdowns[0] as { options: unknown[] }).options
    ).toEqual([{ label: 'Active', value: 'active' }])
  })

  it('removes an option by index', () => {
    store.dropdowns = [
      {
        id: 'd1',
        name: 'A',
        options: [
          { label: 'a', value: 'a' },
          { label: 'b', value: 'b' },
        ],
      },
    ]
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.removeOption('d1', 0)
    })
    expect((store.dropdowns[0] as { options: unknown[] }).options).toEqual([
      { label: 'b', value: 'b' },
    ])
  })

  it('does not touch a different list\'s options', () => {
    store.dropdowns = [
      { id: 'd1', name: 'A', options: [{ label: 'a', value: 'a' }] },
      { id: 'd2', name: 'B', options: [{ label: 'b', value: 'b' }] },
    ]
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.addOption('d1', { label: 'x', value: 'x' })
    })
    expect((store.dropdowns[1] as { options: unknown[] }).options).toEqual([
      { label: 'b', value: 'b' },
    ])
  })
})

describe('remove', () => {
  it('deletes the named list', () => {
    store.dropdowns = [
      { id: 'd1', name: 'A', options: [] },
      { id: 'd2', name: 'B', options: [] },
    ]
    const { result } = renderHook(() => useDropdownConfigs())
    act(() => {
      result.current.remove('d1')
    })
    expect(store.dropdowns).toEqual([{ id: 'd2', name: 'B', options: [] }])
  })
})
