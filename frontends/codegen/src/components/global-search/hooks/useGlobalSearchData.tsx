import { useEffect, useMemo, useState } from 'react'
import { Database } from '@metabuilder/m3/icons'
import { useDBALSearch } from '@/hooks/use-dbal-search'
import type {
  ComponentNode,
  ComponentTree,
  Lambda,
  PlaywrightTest,
  DbModel,
  ProjectFile,
  StorybookStory,
  UnitTest,
  Workflow,
} from '@/types/project'
import type {
  SearchHistoryItem,
  SearchResult,
} from '../types'
import { useSearchHistory } from './useSearchHistory'
import { useSearchAllResults } from './useSearchAllResults'
import { scoreSearchResult } from '../scoreSearchResult'

const DBAL_SLICE_TO_PAGE: Record<string, string> = {
  files: 'code',
  models: 'models',
  components: 'components',
  componentTrees: 'component-trees',
  workflows: 'workflows',
  lambdas: 'lambdas',
}

interface UseGlobalSearchDataProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: DbModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (tab: string, itemId?: string) => void
  onFileSelect: (fileId: string) => void
}

export function useGlobalSearchData({
  open,
  onOpenChange,
  files,
  models,
  components,
  componentTrees,
  workflows,
  lambdas,
  playwrightTests,
  storybookStories,
  unitTests,
  onNavigate,
  onFileSelect,
}: UseGlobalSearchDataProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { results: dbalResults } =
    useDBALSearch(searchQuery)
  const {
    searchHistory,
    addToHistory,
    clearHistory,
    removeHistoryItem,
  } = useSearchHistory()

  useEffect(() => {
    if (!open) setSearchQuery('')
  }, [open])

  const allResults = useSearchAllResults({
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    onNavigate,
    onFileSelect,
  })

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()
    return allResults
      .map((r) => ({
        result: r,
        score: scoreSearchResult(r, query),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(({ result }) => result)
  }, [allResults, searchQuery])

  const dbalSearchResults = useMemo<
    SearchResult[]
  >(() => {
    if (!searchQuery.trim() || searchQuery.length < 2)
      return []
    return dbalResults.map((r) => ({
      id: r.id,
      title: r.title,
      subtitle: `${r.entityType} — ${r.subtitle}`,
      category: 'DBAL',
      icon: (
        <Database size={18} weight="duotone" />
      ),
      action: () =>
        onNavigate(
          DBAL_SLICE_TO_PAGE[r.sliceName] ||
            'database'
        ),
      tags: ['dbal', r.entityType, r.sliceName],
    }))
  }, [dbalResults, searchQuery, onNavigate])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    if (dbalSearchResults.length > 0) {
      groups['DBAL'] = dbalSearchResults
    }
    return groups
  }, [filteredResults, dbalSearchResults])

  const recentSearches = useMemo(
    () =>
      searchHistory.slice(0, 10).map((item) => ({
        historyItem: item,
        result: allResults.find(
          (r) => r.id === item.resultId
        ),
      })),
    [searchHistory, allResults]
  )

  const handleSelect = (result: SearchResult) => {
    addToHistory(searchQuery, result)
    result.action()
    onOpenChange(false)
  }

  const handleHistorySelect = (
    historyItem: SearchHistoryItem,
    result?: SearchResult
  ) => {
    if (result) {
      result.action()
      onOpenChange(false)
    } else {
      setSearchQuery(historyItem.query)
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    recentSearches,
    groupedResults,
    clearHistory,
    removeHistoryItem,
    handleSelect,
    handleHistorySelect,
  }
}
