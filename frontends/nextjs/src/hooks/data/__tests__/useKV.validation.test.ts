import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
