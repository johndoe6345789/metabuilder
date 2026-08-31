import type { SearchSelectItem } from './search-select-types'

export interface UseSearchSelectKeyDownArgs {
  isOpen: boolean
  results: SearchSelectItem[]
  highlighted: number
  setHighlighted: (updater: (i: number) => number) => void
  choose: (item: SearchSelectItem) => void
  close: () => void
}

/** Arrow-key highlight, Enter to choose, Escape to close -- split out of
 *  useSearchSelect since it's a self-contained slice of behaviour. */
export function useSearchSelectKeyDown({
  isOpen,
  results,
  highlighted,
  setHighlighted,
  choose,
  close,
}: UseSearchSelectKeyDownArgs) {
  return (event: React.KeyboardEvent) => {
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
      close()
    }
  }
}
