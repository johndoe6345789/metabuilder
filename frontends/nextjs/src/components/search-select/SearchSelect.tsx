'use client'

/**
 * Search-driven dropdown, backed by DBAL's Elasticsearch-mirrored `_search`
 * endpoint (GET /{tenant}/{package}/{entity}/_search?q=&limit=) rather than
 * a plain <select> loading every row up front. Meant to replace manual ID
 * entry anywhere a form needs to reference another entity (workflows, pages,
 * users, ...) -- built for the God Panel package composer first, but not
 * package-specific.
 *
 * Falls back to a plain list (GET /{tenant}/{package}/{entity}?limit=) when
 * the query is empty, so opening the dropdown with nothing typed still shows
 * something to browse rather than an empty panel -- search augments
 * browsing here, it doesn't replace it.
 */

import { useCallback, useEffect, useState } from 'react'
import { useClickOutside, useDebouncedSave } from '@metabuilder/hooks'
import { TextField, Typography } from '@/m3'
import s from './SearchSelect.module.scss'
import { readList } from '@/lib/dbal/read-list'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface SearchSelectItem {
  id: string
  label: string
}

interface SearchSelectProps {
  tenant?: string
  packageName: string
  entity: string
  placeholder?: string
  /** Extracts the display label from a raw DBAL record. */
  getLabel: (record: Record<string, unknown>) => string
  onSelect: (item: SearchSelectItem) => void
}

export function SearchSelect({
  tenant = 'system',
  packageName,
  entity,
  placeholder = 'Search…',
  getLabel,
  onSelect,
}: SearchSelectProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchSelectItem[]>([])
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const { ref, isOpen, setIsOpen } = useClickOutside<HTMLDivElement>()

  useDebouncedSave(query, setDebouncedQuery, 300)

  const fetchResults = useCallback(
    async (q: string) => {
      setLoading(true)
      try {
        const base = `${DBAL}/${tenant}/${packageName}/${entity}`
        const url =
          q.trim().length > 0
            ? `${base}/_search?${new URLSearchParams({ q, limit: '10' }).toString()}`
            : `${base}?${new URLSearchParams({ limit: '10' }).toString()}`
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
        if (!res.ok) {
          setResults([])
          return
        }
        const rows = readList<Record<string, unknown>>(await res.json())
        setResults(
          rows
            .filter(r => typeof r.id === 'string')
            .map(r => ({ id: r.id as string, label: getLabel(r) }))
        )
        setHighlighted(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [tenant, packageName, entity, getLabel]
  )

  useEffect(() => {
    if (!isOpen) return
    void fetchResults(debouncedQuery)
  }, [debouncedQuery, isOpen, fetchResults])

  const handleFocus = () => {
    setIsOpen(true)
    if (results.length === 0) void fetchResults(query)
  }

  const choose = (item: SearchSelectItem) => {
    onSelect(item)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted(i => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted(i => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = results[highlighted]
      if (item !== undefined) choose(item)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={s.root} ref={ref}>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={query}
        onFocus={handleFocus}
        onChange={event => {
          setQuery(event.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <div className={s.panel}>
          {loading && (
            <Typography
              variant="body2"
              color="text.secondary"
              className={s.status}
            >
              Searching…
            </Typography>
          )}
          {!loading && results.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              className={s.status}
            >
              No matches
            </Typography>
          )}
          {!loading &&
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`${s.item} ${index === highlighted ? s.itemHighlighted : ''}`}
                onMouseEnter={() => {
                  setHighlighted(index)
                }}
                onClick={() => {
                  choose(item)
                }}
              >
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
