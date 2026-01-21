import { Badge } from '@/components/ui/badge'
import { CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command'
import type { SearchResult } from './types'

interface SearchResultsProps {
  groupedResults: Record<string, SearchResult[]>
  onSelect: (result: SearchResult) => void
}

export function SearchResults({ groupedResults, onSelect }: SearchResultsProps) {
  return (
    <>
      {Object.entries(groupedResults).map(([category, results], index) => (
        <div key={category}>
          {index > 0 && <CommandSeparator />}
          <CommandGroup heading={category}>
            {results.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => onSelect(result)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <div className="flex-shrink-0 text-muted-foreground">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.title}</div>
                  {result.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {category}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </div>
      ))}
    </>
  )
}
