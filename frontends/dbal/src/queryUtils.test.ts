import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { QueryHistoryEntry } from './types'
import {
  isPlainOutput,
  loadHistory,
  saveHistory,
  addToHistory,
  methodColor,
} from './queryUtils'

// Minimal localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

function makeEntry(overrides?: Partial<QueryHistoryEntry>): QueryHistoryEntry {
  return {
    id: crypto.randomUUID(),
    method: 'GET',
    path: '/pastebin/pastebin/Snippet',
    status: 200,
    statusText: 'OK',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('isPlainOutput', () => {
  it('returns true for objects with a string output field', () => {
    expect(isPlainOutput({ output: 'hello' })).toBe(true)
  })

  it('returns false for objects without output field', () => {
    expect(isPlainOutput({ data: 'hello' })).toBe(false)
  })

  it('returns false when output is not a string', () => {
    expect(isPlainOutput({ output: 42 })).toBe(false)
    expect(isPlainOutput({ output: null })).toBe(false)
    expect(isPlainOutput({ output: [] })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isPlainOutput(null)).toBe(false)
  })

  it('returns false for primitive values', () => {
    expect(isPlainOutput('string')).toBe(false)
    expect(isPlainOutput(42)).toBe(false)
    expect(isPlainOutput(undefined)).toBe(false)
  })
})

describe('loadHistory', () => {
  beforeEach(() => localStorageMock.clear())

  it('returns empty array when nothing stored', () => {
    expect(loadHistory()).toEqual([])
  })

  it('returns parsed history from localStorage', () => {
    const entries = [makeEntry(), makeEntry({ method: 'POST' })]
    localStorageMock.setItem('dbal-query-history', JSON.stringify(entries))
    expect(loadHistory()).toEqual(entries)
  })

  it('returns empty array when stored value is invalid JSON', () => {
    localStorageMock.setItem('dbal-query-history', '{bad json')
    expect(loadHistory()).toEqual([])
  })
})

describe('saveHistory', () => {
  beforeEach(() => localStorageMock.clear())

  it('serializes and stores entries', () => {
    const entries = [makeEntry()]
    saveHistory(entries)
    const stored = localStorageMock.getItem('dbal-query-history')
    expect(JSON.parse(stored!)).toEqual(entries)
  })

  it('does not throw when localStorage throws (quota exceeded simulation)', () => {
    const orig = localStorageMock.setItem
    localStorageMock.setItem = () => { throw new Error('QuotaExceeded') }
    expect(() => saveHistory([makeEntry()])).not.toThrow()
    localStorageMock.setItem = orig
  })
})

describe('addToHistory', () => {
  beforeEach(() => localStorageMock.clear())

  it('prepends new entry to existing history', () => {
    const existing = [makeEntry({ path: '/old' })]
    const newEntry = makeEntry({ path: '/new' })
    const result = addToHistory(newEntry, existing)
    expect(result[0]).toEqual(newEntry)
    expect(result[1]).toEqual(existing[0])
  })

  it('truncates to maxHistory (20)', () => {
    const existing = Array.from({ length: 20 }, () => makeEntry())
    const newEntry = makeEntry({ path: '/new' })
    const result = addToHistory(newEntry, existing)
    expect(result).toHaveLength(20)
    expect(result[0]).toEqual(newEntry)
  })

  it('saves updated history to localStorage', () => {
    const entry = makeEntry()
    addToHistory(entry, [])
    const stored = localStorageMock.getItem('dbal-query-history')
    expect(JSON.parse(stored!)).toEqual([entry])
  })
})

describe('methodColor', () => {
  it('returns green for GET', () => {
    expect(methodColor('GET')).toBe('#4ade80')
  })

  it('returns blue for POST', () => {
    expect(methodColor('POST')).toBe('#60a5fa')
  })

  it('returns yellow for PUT', () => {
    expect(methodColor('PUT')).toBe('#fbbf24')
  })

  it('returns red for DELETE', () => {
    expect(methodColor('DELETE')).toBe('#f87171')
  })
})
