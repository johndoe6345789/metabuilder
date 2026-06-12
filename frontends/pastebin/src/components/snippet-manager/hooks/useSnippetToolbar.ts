import { useState, useEffect, useRef } from 'react'

export interface SnippetToolbarState {
  menuAnchor: HTMLElement | null
  inputValue: string
  setMenuAnchor: (el: HTMLElement | null) => void
  handleSearchInput: (value: string) => void
}

export function useSnippetToolbar(
  searchQuery: string,
  onSearchChange: (value: string) => void,
): SnippetToolbarState {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [inputValue, setInputValue] = useState(searchQuery)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(searchQuery)
  }, [searchQuery])

  const handleSearchInput = (value: string) => {
    setInputValue(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => onSearchChange(value), 300)
  }

  return { menuAnchor, inputValue, setMenuAnchor, handleSearchInput }
}
