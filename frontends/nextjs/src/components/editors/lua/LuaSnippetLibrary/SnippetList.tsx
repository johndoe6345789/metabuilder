import { ArrowRight, Check, Code, Copy, Tag } from '@/fakemui/icons'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TabsContent,
} from '@/components/ui'
import { LUA_SNIPPET_CATEGORIES, type LuaSnippet } from '@/lib/lua-snippets'

interface SnippetListProps {
  snippets: LuaSnippet[]
  searchQuery: string
  selectedCategory: string
  onSelectSnippet: (snippet: LuaSnippet) => void
  onCopySnippet: (snippet: LuaSnippet) => void
  onInsertSnippet?: (snippet: LuaSnippet) => void
  copiedId: string | null
}

export function SnippetList({
  snippets,
  searchQuery,
  selectedCategory,
  onSelectSnippet,
  onCopySnippet,
  onInsertSnippet,
  copiedId,
}: SnippetListProps) {
  return (
    <>
      {LUA_SNIPPET_CATEGORIES.map(category => (
        <TabsContent key={category} value={category} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snippets.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Code size={48} className="mx-auto mb-4 opacity-50" />
                <p>No snippets found</p>
                {searchQuery && <p className="text-sm mt-2">Try a different search term</p>}
              </div>
            ) : (
              snippets.map(snippet => (
                <Card
                  key={`${selectedCategory}-${snippet.id}`}
                  className="hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => onSelectSnippet(snippet)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                          {snippet.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {snippet.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {snippet.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {snippet.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {snippet.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{snippet.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={e => {
                          e.stopPropagation()
                          onCopySnippet(snippet)
                        }}
                      >
                        {copiedId === snippet.id ? (
                          <>
                            <Check size={14} className="mr-1.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="mr-1.5" />
                            Copy
                          </>
                        )}
                      </Button>
                      {onInsertSnippet && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={e => {
                            e.stopPropagation()
                            onInsertSnippet(snippet)
                          }}
                        >
                          <ArrowRight size={14} className="mr-1.5" />
                          Insert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      ))}
    </>
  )
}
