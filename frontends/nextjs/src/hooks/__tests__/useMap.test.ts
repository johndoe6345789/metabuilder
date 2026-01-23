import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMap } from '@/hooks/useMap'

describe('useMap', () => {
  it('initializes with empty map by default', () => {
    const { result } = renderHook(() => useMap())
    expect(result.current.data.size).toBe(0)
  })

  it('initializes with provided entries', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    )
    expect(result.current.data.size).toBe(3)
  })

  it('sets key-value pairs', () => {
    const { result } = renderHook(() => useMap<string, number>())

    act(() => {
      result.current.set('key1', 10)
    })

    expect(result.current.data.size).toBe(1)
    expect(result.current.get('key1')).toBe(10)
  })

  it('gets values by key', () => {
    const { result } = renderHook(() =>
      useMap<string, number>([['a', 1]])
    )

    expect(result.current.get('a')).toBe(1)
    expect(result.current.get('nonexistent')).toBe(undefined)
  })

  it('deletes entries by key', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ])
    )

    act(() => {
      result.current.delete('a')
    })

    expect(result.current.data.size).toBe(1)
    expect(result.current.has('a')).toBe(false)
  })

  it('clears all entries', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    )

    act(() => {
      result.current.clear()
    })

    expect(result.current.data.size).toBe(0)
  })

  it('checks if key exists', () => {
    const { result } = renderHook(() =>
      useMap([['existing', 'value']])
    )

    expect(result.current.has('existing')).toBe(true)
    expect(result.current.has('nonexistent')).toBe(false)
  })

  it('returns entries iterator', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ])
    )

    const entries = Array.from(result.current.entries())
    expect(entries).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  it('returns keys iterator', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ])
    )

    const keys = Array.from(result.current.keys())
    expect(keys).toEqual(['a', 'b'])
  })

  it('returns values iterator', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ])
    )

    const values = Array.from(result.current.values())
    expect(values).toEqual([1, 2])
  })

  it('overwrites existing keys', () => {
    const { result } = renderHook(() =>
      useMap<string, number>([['key', 1]])
    )

    act(() => {
      result.current.set('key', 2)
    })

    expect(result.current.get('key')).toBe(2)
    expect(result.current.data.size).toBe(1)
  })

  it('works with various key types', () => {
    const key1 = 'string'
    const key2 = 123
    const { result } = renderHook(() =>
      useMap<string | number, string>([
        [key1, 'value1'],
        [key2, 'value2'],
      ])
    )

    expect(result.current.get(key1)).toBe('value1')
    expect(result.current.get(key2)).toBe('value2')
  })

  it('works with object values', () => {
    const obj1 = { id: 1, name: 'Item 1' }
    const obj2 = { id: 2, name: 'Item 2' }
    const { result } = renderHook(() =>
      useMap<string, typeof obj1>([
        ['item1', obj1],
        ['item2', obj2],
      ])
    )

    expect(result.current.get('item1')).toEqual(obj1)
    expect(result.current.get('item2')).toEqual(obj2)
  })

  it('performs multiple operations sequentially', () => {
    const { result } = renderHook(() => useMap<string, number>())

    act(() => {
      result.current.set('a', 1)
      result.current.set('b', 2)
      result.current.set('c', 3)
      result.current.delete('b')
      result.current.set('d', 4)
    })

    expect(result.current.data.size).toBe(3)
    expect(result.current.has('a')).toBe(true)
    expect(result.current.has('b')).toBe(false)
    expect(result.current.has('d')).toBe(true)
  })
})
