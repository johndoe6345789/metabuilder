import { ClockCounterClockwise, X } from '@metabuilder/fakemui/icons'
import { Chip } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Separator } from '@metabuilder/fakemui/data-display'
import type { SearchHistoryItem, SearchResult } from './types'

interface RecentSearchesProps {
  recentSearches: Array<{ historyItem: SearchHistoryItem; result?: SearchResult }>
  onClear: () => void
  onSelect: (historyItem: SearchHistoryItem, result?: SearchResult) => void
  onRemove: (id: string) => void
}

export function RecentSearches({
  recentSearches,
  onClear,
  onSelect,
  onRemove,
}: RecentSearchesProps) {
  if (recentSearches.length === 0) {
    return null
  }

  return (
    <>
      <div role="group">
        <div>
          <span>Recent Searches</span>
          <Button
            variant="text"
            size="small"
            onClick={onClear}
          >
            Clear All
          </Button>
        </div>
        {recentSearches.map(({ historyItem, result }) => (
          <div
            key={historyItem.id}
            role="option"
            aria-selected={false}
            onClick={() => onSelect(historyItem, result)}
          >
            <div>
              <ClockCounterClockwise size={18} weight="duotone" />
            </div>
            <div>
              {result ? (
                <>
                  <div>{result.title}</div>
                  <div>
                    Searched: {historyItem.query}
                  </div>
                </>
              ) : (
                <>
                  <div>{historyItem.query}</div>
                  <div>Search again</div>
                </>
              )}
            </div>
            {result && (
              <Chip variant="outlined" size="small" label={result.category} />
            )}
            <Button
              variant="text"
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(historyItem.id)
              }}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
      <Separator />
    </>
  )
}
