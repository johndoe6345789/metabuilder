import { useState } from 'react'
import { useClickOutside, useDebouncedSave } from '@metabuilder/hooks'
import type { SearchSelectItem, UseSearchSelectArgs } from './search-select-types'
import { useSearchSelectResults } from './use-search-select-results'
import { useSearchSelectKeyDown } from './use-search-select-keydown'

/** All of SearchSelect's state, debounced fetch, and keyboard handling,
 *  kept out of the component so it only owns layout. */
export function useSearchSelect({
  tenant,
  packageName,
  entity,
  getLabel,
  onSelect,
}: UseSearchSelectArgs) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { ref, isOpen, setIsOpen } = useClickOutside<HTMLDivElement>()

  useDebouncedSave(query, setDebouncedQuery, 300)

  const {
    results,
    setResults,
    loading,
    highlighted,
    setHighlighted,
    fetchResults,
  } = useSearchSelectResults({
    tenant,
    packageName,
    entity,
    getLabel,
    isOpen,
    debouncedQuery,
  })

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

  const handleKeyDown = useSearchSelectKeyDown({
    isOpen,
    results,
    highlighted,
    setHighlighted,
    choose,
    close: () => {
      setIsOpen(false)
    },
  })

  return {
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
  }
}
