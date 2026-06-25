/**
 * useSearchHistory
 *
 * Manages search history state: add, clear, and
 * remove individual history items via useUIState.
 */

import { useUIState } from '@/hooks/use-ui-state'
import type {
  SearchHistoryItem,
  SearchResult,
} from '../types'

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] =
    useUIState<SearchHistoryItem[]>(
      'search-history',
      []
    )

  const addToHistory = (
    query: string,
    result?: SearchResult
  ) => {
    if (!query.trim()) return

    const historyItem: SearchHistoryItem = {
      id: `history-${Date.now()}`,
      query: query.trim(),
      timestamp: Date.now(),
      resultId: result?.id,
      resultTitle: result?.title,
      resultCategory: result?.category,
    }

    setSearchHistory((currentHistory) => {
      const filtered = (currentHistory || []).filter(
        (item) =>
          item.query.toLowerCase() !==
          query.toLowerCase()
      )
      return [historyItem, ...filtered].slice(0, 20)
    })
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  const removeHistoryItem = (id: string) => {
    setSearchHistory((currentHistory) =>
      (currentHistory || []).filter(
        (item) => item.id !== id
      )
    )
  }

  return {
    searchHistory: searchHistory || [],
    addToHistory,
    clearHistory,
    removeHistoryItem,
  }
}
