import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKV } from '@/hooks/data/useKV'

const STORAGE_PREFIX = 'mb_kv:'

const setupLocalStorage = (): void => {
  const store = new Map<string, string>()

  const localStorageMock: Storage = {
    get length() {
      return store.size
    },
    clear: vi.fn(() => {
      store.clear()
    }),
    getItem: vi.fn((key: string): string | null => {
      return store.has(key) ? store.get(key)! : null
    }),
    key: vi.fn((index: number): string | null => {
      const keys = Array.from(store.keys())
      return index >= 0 && index < keys.length ? keys[index] : null
    }),
    removeItem: vi.fn((key: string): void => {
      store.delete(key)
    }),
    setItem: vi.fn((key: string, value: string): void => {
      store.set(key, value)
    }),
  }

  vi.stubGlobal('localStorage', localStorageMock)
}

describe('useKV validation', () => {
  beforeEach(() => {
    setupLocalStorage()
  })

  it.each([
    { key: 'user_name', defaultValue: 'John', description: 'string value' },
    { key: 'user_count', defaultValue: 0, description: 'number value' },
    { key: 'is_active', defaultValue: true, description: 'boolean value' },
    { key: 'user_data', defaultValue: { id: 1, name: 'John' }, description: 'object value' },
  ])('initializes with $description', ({ key, defaultValue }) => {
    const { result } = renderHook(() => useKV(key, defaultValue))
    const [value] = result.current

    expect(value).toBe(defaultValue)
  })

  it('initializes with undefined when no default value provided', () => {
    const { result } = renderHook(() => useKV('empty_key'))
    const [value] = result.current

    expect(value).toBeUndefined()
  })

  it.each([
    { initialValue: null, key: 'falsy_key_null', description: 'null value' },
    { initialValue: false, key: 'falsy_key_false', description: 'false boolean' },
    { initialValue: 0, key: 'falsy_key_zero', description: 'zero number' },
    { initialValue: '', key: 'falsy_key_empty', description: 'empty string' },
  ])('handles $description correctly', ({ initialValue, key }) => {
    const { result } = renderHook(() => useKV(key, initialValue))
    const [value] = result.current

    expect(value).toBe(initialValue)
  })

  it('loads value from localStorage when available', () => {
    localStorage.setItem(`${STORAGE_PREFIX}stored_key`, JSON.stringify('stored'))

    const { result } = renderHook(() => useKV('stored_key', 'default'))
    const [value] = result.current

    expect(value).toBe('stored')
  })
})
