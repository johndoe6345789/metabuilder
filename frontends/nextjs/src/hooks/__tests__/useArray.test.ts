import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useArray } from '@/hooks/useArray'

describe('useArray', () => {
  it('initializes with empty array by default', () => {
    const { result } = renderHook(() => useArray())
    expect(result.current.items).toEqual([])
    expect(result.current.length).toBe(0)
  })

  it('initializes with provided items', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))
    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.length).toBe(3)
  })

  it('pushes items to the end', () => {
    const { result } = renderHook(() => useArray<number>())

    act(() => {
      result.current.push(1)
      result.current.push(2)
      result.current.push(3)
    })

    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.length).toBe(3)
  })

  it('pops items from the end', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    let popped: number | undefined

    act(() => {
      popped = result.current.pop()
    })

    expect(popped).toBe(3)
    expect(result.current.items).toEqual([1, 2])
    expect(result.current.length).toBe(2)
  })

  it('shifts items from the beginning', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    let shifted: number | undefined

    act(() => {
      shifted = result.current.shift()
    })

    expect(shifted).toBe(1)
    expect(result.current.items).toEqual([2, 3])
  })

  it('unshifts items to the beginning', () => {
    const { result } = renderHook(() => useArray([2, 3]))

    act(() => {
      result.current.unshift(1)
    })

    expect(result.current.items).toEqual([1, 2, 3])
  })

  it('inserts items at specific index', () => {
    const { result } = renderHook(() => useArray([1, 2, 4]))

    act(() => {
      result.current.insert(2, 3)
    })

    expect(result.current.items).toEqual([1, 2, 3, 4])
  })

  it('removes items at specific index', () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4]))

    act(() => {
      result.current.remove(1)
    })

    expect(result.current.items).toEqual([1, 3, 4])
  })

  it('swaps items at two indices', () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4]))

    act(() => {
      result.current.swap(0, 3)
    })

    expect(result.current.items).toEqual([4, 2, 3, 1])
  })

  it('clears the array', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    act(() => {
      result.current.clear()
    })

    expect(result.current.items).toEqual([])
    expect(result.current.length).toBe(0)
  })

  it('filters the array', () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]))

    act(() => {
      result.current.filter((item) => item > 2)
    })

    expect(result.current.items).toEqual([3, 4, 5])
  })

  it('maps the array', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    const mapped = result.current.map((item) => item * 2)

    expect(mapped).toEqual([2, 4, 6])
  })

  it('gets item at index', () => {
    const { result } = renderHook(() => useArray([10, 20, 30]))

    expect(result.current.get(0)).toBe(10)
    expect(result.current.get(1)).toBe(20)
    expect(result.current.get(5)).toBe(undefined)
  })

  it('handles out of bounds operations gracefully', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    act(() => {
      result.current.remove(10)
      result.current.swap(0, 10)
    })

    expect(result.current.items).toEqual([1, 2, 3])
  })

  it('normalizes insert index to valid range', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]))

    act(() => {
      result.current.insert(-1, 0)
    })

    expect(result.current.items).toEqual([0, 1, 2, 3])
  })

  it('works with string items', () => {
    const { result } = renderHook(() => useArray<string>())

    act(() => {
      result.current.push('a')
      result.current.push('b')
      result.current.push('c')
    })

    expect(result.current.items).toEqual(['a', 'b', 'c'])
  })

  it('works with object items', () => {
    const obj1 = { id: 1, name: 'Item 1' }
    const obj2 = { id: 2, name: 'Item 2' }
    const { result } = renderHook(() => useArray([obj1, obj2]))

    act(() => {
      result.current.push({ id: 3, name: 'Item 3' })
    })

    expect(result.current.length).toBe(3)
    expect(result.current.get(0)).toEqual(obj1)
  })

  it('performs complex sequence of operations', () => {
    const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]))

    act(() => {
      result.current.pop()
      result.current.unshift(0)
      result.current.insert(2, 10)
      result.current.filter((item) => item !== 10)
    })

    expect(result.current.items).toEqual([0, 1, 2, 3, 4])
  })
})
