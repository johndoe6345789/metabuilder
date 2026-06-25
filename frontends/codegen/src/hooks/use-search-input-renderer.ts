/**
 * useSearchInputRenderer
 *
 * Extracted from use-search-input.ts — generates the
 * searchResultsContent React element used by JSON
 * component bindings that can't render dynamic lists.
 */

import React, { useMemo, useCallback } from 'react'
import type { SearchCategory, SearchResultItem } from './use-search-input'

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
  borderBottom:
    '1px solid var(--mat-sys-outline-variant)',
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

interface UseSearchInputRendererArgs {
  categories: SearchCategory[]
  onSelect: (result: SearchResultItem) => void
}

export function useSearchInputRenderer({
  categories,
  onSelect,
}: UseSearchInputRendererArgs) {
  const searchResultsContent = useMemo(() => {
    if (categories.length === 0) return null

    return React.createElement(
      React.Fragment,
      null,
      categories.map((cat) =>
        React.createElement(
          'div',
          { key: cat.label },
          React.createElement(
            'div',
            { style: categoryHeaderStyle },
            cat.label
          ),
          ...cat.results.map((result) =>
            React.createElement(
              'div',
              {
                key: result.id,
                style: resultItemStyle,
                onMouseDown: (
                  e: React.MouseEvent
                ) => {
                  e.preventDefault()
                  onSelect(result)
                },
                onMouseEnter: (
                  e: React.MouseEvent
                ) => {
                  (
                    e.currentTarget as HTMLElement
                  ).style.background =
                    'var(--mat-sys-surface-container-highest)'
                },
                onMouseLeave: (
                  e: React.MouseEvent
                ) => {
                  (
                    e.currentTarget as HTMLElement
                  ).style.background = 'transparent'
                },
              },
              React.createElement(
                'div',
                { style: resultTitleStyle },
                result.title
              ),
              React.createElement(
                'div',
                { style: resultSubtitleStyle },
                result.subtitle
              )
            )
          )
        )
      )
    )
  }, [categories, onSelect])

  return { searchResultsContent }
}
