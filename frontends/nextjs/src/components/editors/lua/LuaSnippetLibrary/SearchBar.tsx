import { Input, ScrollArea, TabsList, TabsTrigger } from '@/components/ui'
import { MagnifyingGlass } from '@/fakemui/icons'
import { LUA_SNIPPET_CATEGORIES } from '@/lib/lua-snippets'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search snippets by name, description, or tags..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="inline-flex w-auto">
          {LUA_SNIPPET_CATEGORIES.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
    </div>
  )
}
