import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useCollapsedSet } from './use-collapsed-set'

describe('useCollapsedSet', () => {
  it('starts with nothing collapsed', () => {
    const { result } = renderHook(() => useCollapsedSet())
    expect(result.current.collapsed.size).toBe(0)
  })

  it('collapses a node on first toggle', () => {
    const { result } = renderHook(() => useCollapsedSet())
    act(() => {
      result.current.toggle('n1')
    })
    expect(result.current.collapsed.has('n1')).toBe(true)
  })

  it('expands it again on a second toggle', () => {
    const { result } = renderHook(() => useCollapsedSet())
    act(() => {
      result.current.toggle('n1')
    })
    act(() => {
      result.current.toggle('n1')
    })
    expect(result.current.collapsed.has('n1')).toBe(false)
  })

  it('tracks multiple nodes independently', () => {
    const { result } = renderHook(() => useCollapsedSet())
    act(() => {
      result.current.toggle('n1')
      result.current.toggle('n2')
    })
    expect([...result.current.collapsed].sort()).toEqual(['n1', 'n2'])
  })

  it('does not mutate the previous set', () => {
    const { result } = renderHook(() => useCollapsedSet())
    const before = result.current.collapsed
    act(() => {
      result.current.toggle('n1')
    })
    expect(before.has('n1')).toBe(false)
  })
})
