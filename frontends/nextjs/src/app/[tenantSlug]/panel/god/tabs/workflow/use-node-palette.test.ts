import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useNodePalette } from './use-node-palette'
import { RUNNABLE_CATEGORIES } from './runnable-steps'

const categories = Object.keys(RUNNABLE_CATEGORIES)

describe('useNodePalette', () => {
  it('starts with every category expanded', () => {
    const { result } = renderHook(() => useNodePalette())

    expect(Object.keys(result.current.expanded)).toEqual(categories)
    expect(Object.values(result.current.expanded).every(Boolean)).toBe(true)
  })

  it('starts with an empty search', () => {
    const { result } = renderHook(() => useNodePalette())
    expect(result.current.search).toBe('')
  })

  it('toggles one category without disturbing the others', () => {
    const { result } = renderHook(() => useNodePalette())
    const [first, ...rest] = categories

    act(() => {
      result.current.toggle(first)
    })

    expect(result.current.expanded[first]).toBe(false)
    expect(rest.every(c => result.current.expanded[c])).toBe(true)
  })

  it('toggles back', () => {
    const { result } = renderHook(() => useNodePalette())

    act(() => {
      result.current.toggle(categories[0])
    })
    act(() => {
      result.current.toggle(categories[0])
    })

    expect(result.current.expanded[categories[0]]).toBe(true)
  })

  it('collapses and expands every category at once', () => {
    const { result } = renderHook(() => useNodePalette())

    act(() => {
      result.current.collapseAll()
    })
    expect(Object.values(result.current.expanded).some(Boolean)).toBe(false)

    act(() => {
      result.current.expandAll()
    })
    expect(Object.values(result.current.expanded).every(Boolean)).toBe(true)
  })

  it('drops a stray category on expandAll', () => {
    // toggle() on an unknown key adds it as expanded (!undefined is true).
    // expandAll rebuilds from RUNNABLE_CATEGORIES, so the stray goes away.
    const { result } = renderHook(() => useNodePalette())

    act(() => {
      result.current.toggle('not-a-category')
    })
    expect(result.current.expanded['not-a-category']).toBe(true)

    act(() => {
      result.current.expandAll()
    })
    expect(Object.keys(result.current.expanded)).toEqual(categories)
  })

  it('keeps the search text it is given', () => {
    const { result } = renderHook(() => useNodePalette())

    act(() => {
      result.current.setSearch('http')
    })
    expect(result.current.search).toBe('http')
  })
})
