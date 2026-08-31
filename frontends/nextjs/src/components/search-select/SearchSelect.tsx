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

import { TextField } from '@/m3'
import type { SearchSelectProps } from './search-select-types'
import { useSearchSelect } from './use-search-select'
import { SearchSelectResults } from './SearchSelectResults'
import s from './SearchSelect.module.scss'

export type { SearchSelectItem, SearchSelectProps } from './search-select-types'

export function SearchSelect({
  tenant = 'system',
  packageName,
  entity,
  placeholder = 'Search…',
  getLabel,
  onSelect,
}: SearchSelectProps) {
  const {
    query,
    setQuery,
    results,
    loading,
    highlighted,
    setHighlighted,
    ref,
    isOpen,
    handleFocus,
    choose,
    handleKeyDown,
  } = useSearchSelect({ tenant, packageName, entity, getLabel, onSelect })

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
        <SearchSelectResults
          loading={loading}
          results={results}
          highlighted={highlighted}
          onHighlight={setHighlighted}
          onChoose={choose}
        />
      )}
    </div>
  )
}
