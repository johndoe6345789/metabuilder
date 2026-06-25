import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { QueryHistoryEntry } from '../types'

// Mock queryUtils so we control localStorage behavior
vi.mock('../queryUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../queryUtils')>()
  return {
    ...actual,
    loadHistory: vi.fn(() => []),
    saveHistory: vi.fn(),
    addToHistory: vi.fn((entry: QueryHistoryEntry, current: QueryHistoryEntry[]) => {
      const updated = [entry, ...current].slice(0, 20)
      return updated
    }),
  }
})

import { useQueryHistory } from './useQueryHistory'
import * as queryUtils from '../queryUtils'

function makeEntry(overrides?: Partial<QueryHistoryEntry>): QueryHistoryEntry {
  return {
    id: 'test-id',
    method: 'GET',
    path: '/pastebin/pastebin/Snippet',
    status: 200,
    statusText: 'OK',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useQueryHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(queryUtils.loadHistory as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(queryUtils.addToHistory as ReturnType<typeof vi.fn>).mockImplementation(
      (entry: QueryHistoryEntry, current: QueryHistoryEntry[]) => [entry, ...current].slice(0, 20)
    )
  })

  describe('initialization', () => {
    it('starts with empty history', () => {
      const { result } = renderHook(() => useQueryHistory())
      expect(result.current.history).toEqual([])
    })

    it('loads history from storage on mount', () => {
      const stored = [makeEntry({ id: 'stored' })]
      ;(queryUtils.loadHistory as ReturnType<typeof vi.fn>).mockReturnValue(stored)
      const { result } = renderHook(() => useQueryHistory())
      expect(result.current.history).toEqual(stored)
    })
  })

  describe('pushEntry', () => {
    it('calls addToHistory and updates state', () => {
      const newEntry = makeEntry({ id: 'new' })
      const { result } = renderHook(() => useQueryHistory())
      act(() => result.current.pushEntry(newEntry))
      expect(queryUtils.addToHistory).toHaveBeenCalledWith(newEntry, [])
      expect(result.current.history).toEqual([newEntry])
    })
  })

  describe('clearHistory', () => {
    it('clears history state and calls saveHistory', () => {
      const { result } = renderHook(() => useQueryHistory())
      act(() => {
        result.current.pushEntry(makeEntry({ id: '1' }))
        result.current.clearHistory()
      })
      expect(result.current.history).toEqual([])
      expect(queryUtils.saveHistory).toHaveBeenCalledWith([])
    })
  })

  describe('restoreFrom — CLI entry', () => {
    it('calls onCli with entry.cli when cli field is set', () => {
      const { result } = renderHook(() => useQueryHistory())
      const entry = makeEntry({ cli: 'dbal list Snippet' })
      const onCli = vi.fn()
      const onGui = vi.fn()
      act(() => result.current.restoreFrom(entry, onCli, onGui))
      expect(onCli).toHaveBeenCalledWith('dbal list Snippet')
      expect(onGui).not.toHaveBeenCalled()
    })
  })

  describe('restoreFrom — GUI entry', () => {
    it('parses path parts and calls onGui', () => {
      const { result } = renderHook(() => useQueryHistory())
      const entry = makeEntry({ path: '/pastebin/pastebin/Snippet/abc', cli: undefined })
      const onCli = vi.fn()
      const onGui = vi.fn()
      act(() => result.current.restoreFrom(entry, onCli, onGui))
      expect(onGui).toHaveBeenCalledWith('GET', 'pastebin', 'pastebin', 'Snippet', 'abc')
      expect(onCli).not.toHaveBeenCalled()
    })

    it('strips query params from path before splitting', () => {
      const { result } = renderHook(() => useQueryHistory())
      const entry = makeEntry({ path: '/pastebin/pastebin/Snippet?limit=10', cli: undefined })
      const onGui = vi.fn()
      act(() => result.current.restoreFrom(entry, vi.fn(), onGui))
      expect(onGui).toHaveBeenCalledWith('GET', 'pastebin', 'pastebin', 'Snippet', '')
    })

    it('provides empty strings for missing path segments', () => {
      const { result } = renderHook(() => useQueryHistory())
      const entry = makeEntry({ path: '/pastebin', cli: undefined })
      const onGui = vi.fn()
      act(() => result.current.restoreFrom(entry, vi.fn(), onGui))
      expect(onGui).toHaveBeenCalledWith('GET', 'pastebin', '', '', '')
    })
  })
})
