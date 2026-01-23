import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useQueue } from '@/hooks/useQueue'

describe('useQueue', () => {
  it('initializes with empty queue by default', () => {
    const { result } = renderHook(() => useQueue())
    expect(result.current.items).toEqual([])
    expect(result.current.size).toBe(0)
    expect(result.current.isEmpty).toBe(true)
  })

  it('initializes with provided items', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]))
    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.size).toBe(3)
    expect(result.current.isEmpty).toBe(false)
  })

  it('enqueues items to the end of queue', () => {
    const { result } = renderHook(() => useQueue<number>())

    act(() => {
      result.current.enqueue(1)
      result.current.enqueue(2)
      result.current.enqueue(3)
    })

    expect(result.current.items).toEqual([1, 2, 3])
    expect(result.current.size).toBe(3)
  })

  it('dequeues items from the front (FIFO)', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]))

    let dequeued: number | undefined

    act(() => {
      dequeued = result.current.dequeue()
    })

    expect(dequeued).toBe(1)
    expect(result.current.items).toEqual([2, 3])
    expect(result.current.size).toBe(2)
  })

  it('returns undefined when dequeueing empty queue', () => {
    const { result } = renderHook(() => useQueue<number>())

    let dequeued: number | undefined

    act(() => {
      dequeued = result.current.dequeue()
    })

    expect(dequeued).toBe(undefined)
    expect(result.current.size).toBe(0)
  })

  it('peeks at front item without removing', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]))

    expect(result.current.peek()).toBe(1)
    expect(result.current.size).toBe(3)
  })

  it('returns undefined when peeking empty queue', () => {
    const { result } = renderHook(() => useQueue<number>())

    expect(result.current.peek()).toBe(undefined)
  })

  it('clears the queue', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]))

    act(() => {
      result.current.clear()
    })

    expect(result.current.items).toEqual([])
    expect(result.current.size).toBe(0)
    expect(result.current.isEmpty).toBe(true)
  })

  it('maintains FIFO order through multiple operations', () => {
    const { result } = renderHook(() => useQueue<number>())

    act(() => {
      result.current.enqueue(1)
      result.current.enqueue(2)
      result.current.enqueue(3)
    })

    const dequeued: number[] = []

    act(() => {
      dequeued.push(result.current.dequeue()!)
    })

    act(() => {
      dequeued.push(result.current.dequeue()!)
    })

    act(() => {
      dequeued.push(result.current.dequeue()!)
    })

    expect(dequeued).toEqual([1, 2, 3])
  })

  it('works with string items', () => {
    const { result } = renderHook(() => useQueue<string>())

    act(() => {
      result.current.enqueue('a')
      result.current.enqueue('b')
      result.current.enqueue('c')
    })

    expect(result.current.peek()).toBe('a')
    expect(result.current.size).toBe(3)
  })

  it('works with object items', () => {
    const obj1 = { id: 1, name: 'first' }
    const obj2 = { id: 2, name: 'second' }
    const obj3 = { id: 3, name: 'third' }

    const { result } = renderHook(() => useQueue([obj1, obj2, obj3]))

    expect(result.current.peek()).toEqual(obj1)

    act(() => {
      result.current.dequeue()
    })

    expect(result.current.peek()).toEqual(obj2)
  })

  it('tracks isEmpty state correctly', () => {
    const { result } = renderHook(() => useQueue<number>())

    expect(result.current.isEmpty).toBe(true)

    act(() => {
      result.current.enqueue(1)
    })

    expect(result.current.isEmpty).toBe(false)

    act(() => {
      result.current.dequeue()
    })

    expect(result.current.isEmpty).toBe(true)
  })

  it('performs enqueue-dequeue cycle correctly', () => {
    const { result } = renderHook(() => useQueue<number>())

    act(() => {
      result.current.enqueue(10)
    })

    act(() => {
      result.current.enqueue(20)
    })

    let firstDequeue: number | undefined
    act(() => {
      firstDequeue = result.current.dequeue()
    })

    expect(firstDequeue).toBe(10)

    act(() => {
      result.current.enqueue(30)
    })

    let secondDequeue: number | undefined
    act(() => {
      secondDequeue = result.current.dequeue()
    })

    expect(secondDequeue).toBe(20)
    expect(result.current.peek()).toBe(30)
  })

  it('handles task processing pattern', () => {
    const { result } = renderHook(() => useQueue<string>(['task1', 'task2', 'task3']))

    const processed: string[] = []

    act(() => {
      let task = result.current.dequeue()
      if (task) processed.push(task)
    })

    act(() => {
      let task = result.current.dequeue()
      if (task) processed.push(task)
    })

    act(() => {
      let task = result.current.dequeue()
      if (task) processed.push(task)
    })

    expect(processed).toEqual(['task1', 'task2', 'task3'])
  })

  it('handles interleaved enqueue-dequeue operations', () => {
    const { result } = renderHook(() => useQueue<number>())

    const sequence: number[] = []

    act(() => {
      result.current.enqueue(1)
      result.current.enqueue(2)
    })

    act(() => {
      sequence.push(result.current.dequeue()!)
    })

    act(() => {
      result.current.enqueue(3)
    })

    act(() => {
      sequence.push(result.current.dequeue()!)
    })

    act(() => {
      sequence.push(result.current.dequeue()!)
    })

    expect(sequence).toEqual([1, 2, 3])
  })

  it('validates FIFO behavior with peek after enqueue', () => {
    const { result } = renderHook(() => useQueue<number>())

    act(() => {
      result.current.enqueue(100)
    })

    expect(result.current.peek()).toBe(100)

    act(() => {
      result.current.enqueue(200)
    })

    expect(result.current.peek()).toBe(100)

    act(() => {
      result.current.enqueue(300)
    })

    expect(result.current.peek()).toBe(100)
  })
})
