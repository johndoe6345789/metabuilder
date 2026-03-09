/**
 * useSearchInput — universal search aggregating navigation, Redux entities, and DBAL
 *
 * Returns categorized results for the inline header search dropdown.
 * Navigation and Redux entities are filtered client-side (instant).
 * DBAL results arrive asynchronously via useDBALSearch (300ms debounce).
 *
 * Returns a `searchResultsContent` React element because JSON definitions
 * can't express render functions for dynamic lists.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { useDBALSearch, type DBALSearchResult } from '@/hooks/use-dbal-search'
import { useTranslation } from '@/hooks/use-translation'
import navigationData from '@/data/global-search.json'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  page: string
}

export interface SearchCategory {
  label: string
  results: SearchResultItem[]
}

interface NavigationMeta {
  id: string
  title: string
  subtitle: string
  category: string
  icon: string
  tab: string
  tags: string[]
}

const NAV_ITEMS = navigationData as NavigationMeta[]

/** Stable empty array — avoids new [] on every selector call triggering re-renders */
const EMPTY_ARRAY: readonly Record<string, unknown>[] = []

const SLICE_TO_PAGE: Record<string, string> = {
  files: 'code',
  models: 'models',
  components: 'components',
  componentTrees: 'component-trees',
  workflows: 'workflows',
  lambdas: 'lambdas',
}

// ── Inline styles ───────────────────────────────────────────────────────────

const categoryHeaderStyle: React.CSSProperties = {
  padding: '6px 12px 4px',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--mat-sys-on-surface-variant)',
}

const resultItemStyle: React.CSSProperties = {
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '12px',
  borderBottom: '1px solid var(--mat-sys-outline-variant)',
  transition: 'background 0.1s',
}

const resultTitleStyle: React.CSSProperties = {
  color: 'var(--mat-sys-on-surface)',
  fontWeight: 500,
}

const resultSubtitleStyle: React.CSSProperties = {
  color: 'var(--mat-sys-on-surface-variant)',
  fontSize: '11px',
  marginTop: '1px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

interface UseSearchInputArgs {
  onNavigate: (page: string) => void
  /** Optional external i18n translate function (falls back to internal useTranslation) */
  t?: (key: string, fallback?: string) => string
}

export function useSearchInput({ onNavigate, t: externalT }: UseSearchInputArgs) {
  const [query, setQueryState] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Internal i18n — used when no external t() is provided
  const { t: internalT } = useTranslation()
  const t = externalT || internalT

  // DBAL async results
  const { results: dbalResults, loading: dbalLoading } = useDBALSearch(query)

  // Redux entities for client-side search
  // Property names match slice initialState (e.g. filesSlice.files, modelsSlice.models)
  const files = useAppSelector((s) => s.files?.files ?? EMPTY_ARRAY)
  const models = useAppSelector((s) => s.models?.models ?? EMPTY_ARRAY)
  const components = useAppSelector((s) => s.components?.components ?? EMPTY_ARRAY)
  const workflows = useAppSelector((s) => s.workflows?.workflows ?? EMPTY_ARRAY)
  const lambdas = useAppSelector((s) => s.lambdas?.lambdas ?? EMPTY_ARRAY)

  // ── Client-side search (instant) ────────────────────────────────────────
  const localCategories = useMemo<SearchCategory[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []

    const categories: SearchCategory[] = []

    // Navigation items
    const navResults = NAV_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchSubtitle = item.subtitle.toLowerCase().includes(q)
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q))
      // Also match translated label if t() is available
      const translatedTitle = t ? t(`navigation.${item.tab}`, item.title) : ''
      const matchTranslated = translatedTitle ? translatedTitle.toLowerCase().includes(q) : false
      return matchTitle || matchSubtitle || matchTags || matchTranslated
    }).slice(0, 5)

    if (navResults.length > 0) {
      categories.push({
        label: 'Navigation',
        results: navResults.map((item) => ({
          id: item.id,
          title: t ? t(`navigation.${item.tab}`, item.title) : item.title,
          subtitle: item.subtitle,
          page: item.tab,
        })),
      })
    }

    // Redux entity search helper
    const searchEntities = (
      items: Array<Record<string, unknown>>,
      label: string,
      page: string
    ): SearchResultItem[] => {
      return items
        .filter((item) => {
          const name = String(item.name ?? item.title ?? '').toLowerCase()
          return name.includes(q)
        })
        .slice(0, 5)
        .map((item) => ({
          id: `${label.toLowerCase()}-${item.id}`,
          title: String(item.name ?? item.title ?? 'Untitled'),
          subtitle: String(item.path ?? item.description ?? item.type ?? label),
          page,
        }))
    }

    const fileResults = searchEntities(files as Record<string, unknown>[], 'Files', 'code')
    if (fileResults.length > 0) categories.push({ label: 'Files', results: fileResults })

    const modelResults = searchEntities(models as Record<string, unknown>[], 'Models', 'models')
    if (modelResults.length > 0) categories.push({ label: 'Models', results: modelResults })

    const componentResults = searchEntities(components as Record<string, unknown>[], 'Components', 'components')
    if (componentResults.length > 0) categories.push({ label: 'Components', results: componentResults })

    const workflowResults = searchEntities(workflows as Record<string, unknown>[], 'Workflows', 'workflows')
    if (workflowResults.length > 0) categories.push({ label: 'Workflows', results: workflowResults })

    const lambdaResults = searchEntities(lambdas as Record<string, unknown>[], 'Lambdas', 'lambdas')
    if (lambdaResults.length > 0) categories.push({ label: 'Lambdas', results: lambdaResults })

    return categories
  }, [query, files, models, components, workflows, lambdas, t])

  // ── DBAL remote results ─────────────────────────────────────────────────
  const dbalCategory = useMemo<SearchCategory | null>(() => {
    if (dbalResults.length === 0) return null
    return {
      label: 'Database',
      results: dbalResults.map((r: DBALSearchResult) => ({
        id: r.id,
        title: r.title,
        subtitle: `${r.entityType} — ${r.subtitle}`,
        page: SLICE_TO_PAGE[r.sliceName] || 'database',
      })),
    }
  }, [dbalResults])

  // ── Merged categories ───────────────────────────────────────────────────
  const categories = useMemo<SearchCategory[]>(() => {
    const merged = [...localCategories]
    if (dbalCategory) merged.push(dbalCategory)
    return merged
  }, [localCategories, dbalCategory])

  const totalResults = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.results.length, 0)
  }, [categories])

  // Pre-computed booleans for JSON condition bindings
  const showResults = dropdownOpen && totalResults > 0
  const showEmpty = dropdownOpen && query.length >= 2 && totalResults === 0 && !dbalLoading
  const loading = dbalLoading

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (result: SearchResultItem) => {
      onNavigate(result.page)
      setQueryState('')
      setDropdownOpen(false)
    },
    [onNavigate]
  )

  /** Accepts either a raw string OR a React ChangeEvent (from <input onChange>) */
  const handleQueryChange = useCallback((valueOrEvent: string | { target: { value: string } }) => {
    const value = typeof valueOrEvent === 'string'
      ? valueOrEvent
      : valueOrEvent?.target?.value ?? ''
    setQueryState(value)
    setDropdownOpen(value.length >= 1)
  }, [])

  const handleBlur = useCallback(() => {
    setTimeout(() => setDropdownOpen(false), 200)
  }, [])

  const handleFocus = useCallback(() => {
    if (query.length >= 1 && totalResults > 0) {
      setDropdownOpen(true)
    }
  }, [query, totalResults])

  // ── React element for search results (JSON can't render dynamic lists) ─
  const searchResultsContent = useMemo(() => {
    if (categories.length === 0) return null

    return React.createElement(
      React.Fragment,
      null,
      categories.map((cat) =>
        React.createElement(
          'div',
          { key: cat.label },
          // Category header
          React.createElement('div', { style: categoryHeaderStyle }, cat.label),
          // Result items
          ...cat.results.map((result) =>
            React.createElement(
              'div',
              {
                key: result.id,
                style: resultItemStyle,
                onMouseDown: (e: React.MouseEvent) => {
                  e.preventDefault()
                  handleSelect(result)
                },
                onMouseEnter: (e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--mat-sys-surface-container-highest)'
                },
                onMouseLeave: (e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                },
              },
              React.createElement('div', { style: resultTitleStyle }, result.title),
              React.createElement('div', { style: resultSubtitleStyle }, result.subtitle)
            )
          )
        )
      )
    )
  }, [categories, handleSelect])

  return {
    query,
    setQuery: handleQueryChange,
    categories,
    totalResults,
    loading,
    showResults,
    showEmpty,
    handleSelect,
    handleBlur,
    handleFocus,
    searchResultsContent,
  }
}
