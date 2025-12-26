import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useKV } from '@/hooks/useKV'

describe('useKV', () => {
  const STORAGE_PREFIX = 'mb_kv:'
  let store: Record<string, string>

  beforeEach(() => {
    // Mock localStorage
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
      length: 0,
      key: vi.fn(() => null),
    })
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

  it('should load value from localStorage when available', async () => {
    localStorage.setItem(`${STORAGE_PREFIX}stored_key`, JSON.stringify('stored'))

    const { result } = renderHook(() => useKV('stored_key', 'default'))

    await waitFor(() => {
      expect(result.current[0]).toBe('stored')
    })
  })

  it('should migrate legacy localStorage entries to namespaced keys', () => {
    localStorage.setItem('legacy_key', JSON.stringify('legacy'))

    const { result } = renderHook(() => useKV('legacy_key', 'default'))

    expect(result.current[0]).toBe('legacy')
    expect(localStorage.getItem(`${STORAGE_PREFIX}legacy_key`)).toBe(JSON.stringify('legacy'))
    expect(localStorage.getItem('legacy_key')).toBeNull()
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

  it('should sync updates across mounted hooks with same key', async () => {
    const { result: firstHook } = renderHook(() => useKV('sync_key', 'initial'))
    const { result: secondHook } = renderHook(() => useKV('sync_key', 'initial'))

    await act(async () => {
      await firstHook.current[1]('synced')
    })

    await waitFor(() => {
      expect(secondHook.current[0]).toBe('synced')
    })
  })

  it.each([
    { initialValue: null, key: 'falsy_key_null', description: 'null value' },
    { initialValue: false, key: 'falsy_key_false', description: 'false boolean' },
    { initialValue: 0, key: 'falsy_key_zero', description: 'zero number' },
    { initialValue: '', key: 'falsy_key_empty', description: 'empty string' },
  ])('should handle falsy $description correctly', ({ initialValue, key }) => {
    const { result } = renderHook(() => useKV(key, initialValue))
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

  it('should persist updates to localStorage', async () => {
    const { result } = renderHook(() => useKV('persist_key', 'initial'))
    const [, updateValue] = result.current

    await act(async () => {
      await updateValue('next')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(`${STORAGE_PREFIX}persist_key`, JSON.stringify('next'))
  })
})
