import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStack } from '@/hooks/useStack'

describe('useStack', () => {
  it('initializes with empty stack by default', () => {
    const { result } = renderHook(() => useStack())
    expect(result.current.items).toEqual([])
    expect(result.current.size).toBe(0)
    expect(result.current.isEmpty).toBe(true)
  })

  it('initializes with provided items', () => {
    const { result } = renderHook(() => useStack([1, 2, 3]))
    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.size).toBe(3)
    expect(result.current.isEmpty).toBe(false)
  })

  it('pushes items onto the stack', () => {
    const { result } = renderHook(() => useStack<number>())

    act(() => {
      result.current.push(1)
      result.current.push(2)
      result.current.push(3)
    })

    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.size).toBe(3)
  })

  it('pops items from the stack (LIFO)', () => {
    const { result } = renderHook(() => useStack([1, 2, 3]))

    let popped: number | undefined

    act(() => {
      popped = result.current.pop()
    })

    expect(popped).toBe(3)
    expect(result.current.items).toEqual([1, 2])
    expect(result.current.size).toBe(2)
  })

  it('returns undefined when popping empty stack', () => {
    const { result } = renderHook(() => useStack<number>())

    let popped: number | undefined

    act(() => {
      popped = result.current.pop()
    })

    expect(popped).toBe(undefined)
    expect(result.current.size).toBe(0)
  })

  it('peeks at top item without removing', () => {
    const { result } = renderHook(() => useStack([1, 2, 3]))

    expect(result.current.peek()).toBe(3)
    expect(result.current.size).toBe(3)
  })

  it('returns undefined when peeking empty stack', () => {
    const { result } = renderHook(() => useStack<number>())

    expect(result.current.peek()).toBe(undefined)
  })

  it('clears the stack', () => {
    const { result } = renderHook(() => useStack([1, 2, 3]))

    act(() => {
      result.current.clear()
    })

    expect(result.current.items).toEqual([])
    expect(result.current.size).toBe(0)
    expect(result.current.isEmpty).toBe(true)
  })

  it('maintains LIFO order through multiple operations', () => {
    const { result } = renderHook(() => useStack<number>())

    act(() => {
      result.current.push(1)
      result.current.push(2)
      result.current.push(3)
    })

    const popped: number[] = []

    act(() => {
      popped.push(result.current.pop()!)
    })

    act(() => {
      popped.push(result.current.pop()!)
    })

    act(() => {
      popped.push(result.current.pop()!)
    })

    expect(popped).toEqual([3, 2, 1])
  })

  it('works with string items', () => {
    const { result } = renderHook(() => useStack<string>())

    act(() => {
      result.current.push('a')
      result.current.push('b')
      result.current.push('c')
    })

    expect(result.current.peek()).toBe('c')
    expect(result.current.size).toBe(3)
  })

  it('works with object items', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const obj3 = { id: 3 }

    const { result } = renderHook(() => useStack([obj1, obj2, obj3]))

    expect(result.current.peek()).toEqual(obj3)

    act(() => {
      result.current.pop()
    })

    expect(result.current.peek()).toEqual(obj2)
  })

  it('tracks isEmpty state correctly', () => {
    const { result } = renderHook(() => useStack<number>())

    expect(result.current.isEmpty).toBe(true)

    act(() => {
      result.current.push(1)
    })

    expect(result.current.isEmpty).toBe(false)

    act(() => {
      result.current.pop()
    })

    expect(result.current.isEmpty).toBe(true)
  })

  it('performs push-pop cycle correctly', () => {
    const { result } = renderHook(() => useStack<number>())

    act(() => {
      result.current.push(10)
    })

    act(() => {
      result.current.push(20)
    })

    let firstPop: number | undefined
    act(() => {
      firstPop = result.current.pop()
    })

    expect(firstPop).toBe(20)

    act(() => {
      result.current.push(30)
    })

    let secondPop: number | undefined
    act(() => {
      secondPop = result.current.pop()
    })

    expect(secondPop).toBe(30)
    expect(result.current.peek()).toBe(10)
  })

  it('handles undo/redo pattern (push-pop-push)', () => {
    const { result } = renderHook(() => useStack<string>(['initial']))

    const history: string[] = []

    act(() => {
      result.current.push('action1')
    })

    act(() => {
      history.push(result.current.peek()!)
    })

    act(() => {
      const popped = result.current.pop()
      history.push(popped!)
    })

    act(() => {
      result.current.push('action2')
    })

    act(() => {
      history.push(result.current.peek()!)
    })

    expect(history).toEqual(['action1', 'action1', 'action2'])
  })
})
