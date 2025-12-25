import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKV } from '@/hooks/useKV'

describe('useKV', () => {
  beforeEach(() => {
    // Clear any stored values before each test
    const map = new Map()
    localStorage.clear()
  })

  it.each([
    { key: 'user_name', defaultValue: 'John', description: 'string value' },
    { key: 'user_count', defaultValue: 0, description: 'number value' },
    { key: 'is_active', defaultValue: true, description: 'boolean value' },
    { key: 'user_data', defaultValue: { id: 1, name: 'John' }, description: 'object value' },
  ])('should initialize hook with $description', ({ key, defaultValue }) => {
    const { result } = renderHook(() => useKV(key, defaultValue))
    const [value] = result.current

    expect(value).toBe(defaultValue)
  })

  it('should initialize with undefined when no default value provided', () => {
    const { result } = renderHook(() => useKV('empty_key'))
    const [value] = result.current

    expect(value).toBeUndefined()
  })

  it('should update value when using updater function', async () => {
    const { result } = renderHook(() => useKV('counter', 0))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue((prev: number) => (prev ?? 0) + 1)
    })

    const [newValue] = result.current
    expect(newValue).toBe(1)
  })

  it('should update value when providing direct value', async () => {
    const { result } = renderHook(() => useKV('name', 'John'))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue('Jane')
    })

    const [newValue] = result.current
    expect(newValue).toBe('Jane')
  })

  it('should handle complex object updates', async () => {
    const initialObject = { id: 1, name: 'John', email: 'john@example.com' }
    const { result } = renderHook(() => useKV('user', initialObject))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue(prev => ({
        ...prev,
        name: 'Jane',
      }))
    })

    const [newValue] = result.current
    expect(newValue).toEqual({ id: 1, name: 'Jane', email: 'john@example.com' })
  })

  it('should handle array updates', async () => {
    const initialArray = [1, 2, 3]
    const { result } = renderHook(() => useKV('items', initialArray))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue(prev => [...(prev ?? []), 4])
    })

    const [newValue] = result.current
    expect(newValue).toEqual([1, 2, 3, 4])
  })

  it('should maintain separate state for different keys', async () => {
    const { result: result1 } = renderHook(() => useKV('key1', 'value1'))
    const { result: result2 } = renderHook(() => useKV('key2', 'value2'))

    const [value1] = result1.current
    const [value2] = result2.current

    expect(value1).toBe('value1')
    expect(value2).toBe('value2')
  })

  it('should persist updates across multiple hooks with same key', async () => {
    const { result: firstHook } = renderHook(() => useKV('shared_key', 'initial'))
    const [, updateValue] = firstHook.current

    await act(async () => {
      await updateValue('updated')
    })

    // Create a new hook with the same key
    const { result: secondHook } = renderHook(() => useKV('shared_key', 'initial'))
    const [value] = secondHook.current

    expect(value).toBe('updated')
  })

  it.each([
    { initialValue: null, description: 'null value' },
    { initialValue: false, description: 'false boolean' },
    { initialValue: 0, description: 'zero number' },
    { initialValue: '', description: 'empty string' },
  ])('should handle falsy $description correctly', ({ initialValue }) => {
    const { result } = renderHook(() => useKV('falsy_key', initialValue))
    const [value] = result.current

    expect(value).toBe(initialValue)
  })

  it('should handle rapid updates correctly', async () => {
    const { result } = renderHook(() => useKV('rapid_key', 0))
    const [, updateValue] = result.current

    await act(async () => {
      await Promise.all([
        updateValue(1),
        updateValue(2),
        updateValue(3),
      ])
    })

    const [finalValue] = result.current
    expect(typeof finalValue).toBe('number')
    expect(finalValue).toBeGreaterThanOrEqual(1)
  })
})
