import { ClockCounterClockwise, X } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command'
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
      <CommandGroup
        heading={
          <div className="flex items-center justify-between w-full pr-2">
            <span>Recent Searches</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        }
      >
        {recentSearches.map(({ historyItem, result }) => (
          <CommandItem
            key={historyItem.id}
            value={historyItem.id}
            onSelect={() => onSelect(historyItem, result)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer group"
          >
            <div className="flex-shrink-0 text-muted-foreground">
              <ClockCounterClockwise size={18} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              {result ? (
                <>
                  <div className="font-medium truncate">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Searched: {historyItem.query}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium truncate">{historyItem.query}</div>
                  <div className="text-xs text-muted-foreground">Search again</div>
                </>
              )}
            </div>
            {result && (
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {result.category}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
              onClick={(event) => {
                event.stopPropagation()
                onRemove(historyItem.id)
              }}
            >
              <X size={14} />
            </Button>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  )
}
