import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSet } from '@/hooks/useSet'

describe('useSet', () => {
  it('initializes with empty set by default', () => {
    const { result } = renderHook(() => useSet())
    expect(result.current.values.size).toBe(0)
  })

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]))
    expect(result.current.values.size).toBe(3)
    expect(result.current.has(1)).toBe(true)
    expect(result.current.has(2)).toBe(true)
    expect(result.current.has(3)).toBe(true)
  })

  it('adds values to the set', () => {
    const { result } = renderHook(() => useSet<number>())

    act(() => {
      result.current.add(1)
    })

    expect(result.current.values.size).toBe(1)
    expect(result.current.has(1)).toBe(true)
  })

  it('does not add duplicate values', () => {
    const { result } = renderHook(() => useSet<number>())

    act(() => {
      result.current.add(1)
      result.current.add(1)
    })

    expect(result.current.values.size).toBe(1)
  })

  it('removes values from the set', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]))

    act(() => {
      result.current.remove(2)
    })

    expect(result.current.values.size).toBe(2)
    expect(result.current.has(2)).toBe(false)
    expect(result.current.has(1)).toBe(true)
  })

  it('checks if value exists', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]))

    expect(result.current.has(1)).toBe(true)
    expect(result.current.has(4)).toBe(false)
  })

  it('toggles values in the set', () => {
    const { result } = renderHook(() => useSet([1, 2]))

    // Toggle existing value
    act(() => {
      result.current.toggle(1)
    })
    expect(result.current.has(1)).toBe(false)
    expect(result.current.values.size).toBe(1)

    // Toggle non-existing value
    act(() => {
      result.current.toggle(3)
    })
    expect(result.current.has(3)).toBe(true)
    expect(result.current.values.size).toBe(2)
  })

  it('clears the set', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]))

    act(() => {
      result.current.clear()
    })

    expect(result.current.values.size).toBe(0)
  })

  it('works with string values', () => {
    const { result } = renderHook(() => useSet<string>(['a', 'b', 'c']))

    expect(result.current.has('a')).toBe(true)

    act(() => {
      result.current.add('d')
    })

    expect(result.current.values.size).toBe(4)
  })

  it('works with object values', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const { result } = renderHook(() => useSet([obj1, obj2]))

    expect(result.current.has(obj1)).toBe(true)

    act(() => {
      result.current.remove(obj1)
    })

    expect(result.current.has(obj1)).toBe(false)
    expect(result.current.values.size).toBe(1)
  })

  it('performs multiple operations sequentially', () => {
    const { result } = renderHook(() => useSet<number>())

    act(() => {
      result.current.add(1)
      result.current.add(2)
      result.current.add(3)
      result.current.remove(2)
      result.current.toggle(4)
    })

    expect(result.current.values.size).toBe(3)
    expect(result.current.has(1)).toBe(true)
    expect(result.current.has(2)).toBe(false)
    expect(result.current.has(3)).toBe(true)
    expect(result.current.has(4)).toBe(true)
  })
})
