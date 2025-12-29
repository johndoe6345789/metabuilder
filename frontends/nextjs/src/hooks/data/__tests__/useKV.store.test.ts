import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useKV } from '@/hooks/data/useKV'

const STORAGE_PREFIX = 'mb_kv:'
let store: Record<string, string>

const setupLocalStorage = (): void => {
  store = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(k => delete store[k])
    }),
    length: 0,
    key: vi.fn(() => null),
  })
}

describe('useKV storage', () => {
  beforeEach(() => {
    setupLocalStorage()
  })

  it('migrates legacy localStorage entries to namespaced keys', () => {
    localStorage.setItem('legacy_key', JSON.stringify('legacy'))

    const { result } = renderHook(() => useKV('legacy_key', 'default'))

    expect(result.current[0]).toBe('legacy')
    expect(localStorage.getItem(`${STORAGE_PREFIX}legacy_key`)).toBe(JSON.stringify('legacy'))
    expect(localStorage.getItem('legacy_key')).toBeNull()
  })

  it('updates value when using updater function', async () => {
    const { result } = renderHook(() => useKV('counter', 0))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue((prev: number) => (prev ?? 0) + 1)
    })

    const [newValue] = result.current
    expect(newValue).toBe(1)
  })

  it('updates value when providing direct value', async () => {
    const { result } = renderHook(() => useKV('name', 'John'))
    const [, updateValue] = result.current

    await act(async () => {
      await updateValue('Jane')
    })

    const [newValue] = result.current
    expect(newValue).toBe('Jane')
  })

  it('handles complex object updates', async () => {
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

  it('handles array updates', async () => {
    const initialArray = [1, 2, 3]
    const { result } = renderHook(() => useKV('items', initialArray))

    const [, updateValue] = result.current

    await act(async () => {
      await updateValue(prev => [...(prev ?? []), 4])
    })

    const [newValue] = result.current
    expect(newValue).toEqual([1, 2, 3, 4])
  })

  it('maintains separate state for different keys', () => {
    const { result: result1 } = renderHook(() => useKV('key1', 'value1'))
    const { result: result2 } = renderHook(() => useKV('key2', 'value2'))

    const [value1] = result1.current
    const [value2] = result2.current

    expect(value1).toBe('value1')
    expect(value2).toBe('value2')
  })

  it('persists updates across multiple hooks with same key', async () => {
    const { result: firstHook } = renderHook(() => useKV('shared_key', 'initial'))
    const [, updateValue] = firstHook.current

    await act(async () => {
      await updateValue('updated')
    })

    const { result: secondHook } = renderHook(() => useKV('shared_key', 'initial'))
    const [value] = secondHook.current

    expect(value).toBe('updated')
  })

  it('syncs updates across mounted hooks with same key', async () => {
    const { result: firstHook } = renderHook(() => useKV('sync_key', 'initial'))
    const { result: secondHook } = renderHook(() => useKV('sync_key', 'initial'))

    await act(async () => {
      await firstHook.current[1]('synced')
    })

    await waitFor(() => {
      expect(secondHook.current[0]).toBe('synced')
    })
  })

  it('handles rapid updates correctly', async () => {
    const { result } = renderHook(() => useKV('rapid_key', 0))
    const [, updateValue] = result.current

    await act(async () => {
      await Promise.all([updateValue(1), updateValue(2), updateValue(3)])
    })

    const [finalValue] = result.current
    expect(typeof finalValue).toBe('number')
    expect(finalValue).toBeGreaterThanOrEqual(1)
  })

  it('persists updates to localStorage', async () => {
    const { result } = renderHook(() => useKV('persist_key', 'initial'))
    const [, updateValue] = result.current

    await act(async () => {
      await updateValue('next')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      `${STORAGE_PREFIX}persist_key`,
      JSON.stringify('next')
    )
  })
})
