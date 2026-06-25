import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  MagnifyingGlass, 
  Copy, 
  Check, 
  BookOpen, 
  Tag,
  ArrowRight,
  Code
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  LUA_SNIPPET_CATEGORIES, 
  getSnippetsByCategory, 
  searchSnippets,
  type LuaSnippet 
} from '@/lib/lua-snippets'

interface LuaSnippetLibraryProps {
  onInsertSnippet?: (code: string) => void
}

export function LuaSnippetLibrary({ onInsertSnippet }: LuaSnippetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSnippet, setSelectedSnippet] = useState<LuaSnippet | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const displayedSnippets = searchQuery 
    ? searchSnippets(searchQuery)
    : getSnippetsByCategory(selectedCategory)

  const handleCopySnippet = (snippet: LuaSnippet) => {
    navigator.clipboard.writeText(snippet.code)
    setCopiedId(snippet.id)
    toast.success('Code copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInsertSnippet = (snippet: LuaSnippet) => {
    if (onInsertSnippet) {
      onInsertSnippet(snippet.code)
      toast.success('Snippet inserted')
    } else {
      handleCopySnippet(snippet)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} className="text-primary" />
          <h2 className="text-2xl font-bold">Lua Snippet Library</h2>
        </div>
        <p className="text-muted-foreground">
          Pre-built code templates for common patterns and operations
        </p>
      </div>

      <div className="relative">
        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search snippets by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-auto">
            {LUA_SNIPPET_CATEGORIES.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {LUA_SNIPPET_CATEGORIES.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedSnippets.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Code size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No snippets found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">Try a different search term</p>
                  )}
                </div>
              ) : (
                displayedSnippets.map((snippet) => (
                  <Card 
                    key={snippet.id} 
                    className="hover:border-primary transition-colors cursor-pointer group"
                    onClick={() => setSelectedSnippet(snippet)}
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
                        {snippet.tags.slice(0, 3).map((tag) => (
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopySnippet(snippet)
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsertSnippet(snippet)
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
      </Tabs>

      <Dialog open={!!selectedSnippet} onOpenChange={() => setSelectedSnippet(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">{selectedSnippet?.name}</DialogTitle>
                <DialogDescription>{selectedSnippet?.description}</DialogDescription>
              </div>
              <Badge variant="outline">{selectedSnippet?.category}</Badge>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-4">
            {selectedSnippet?.tags && selectedSnippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSnippet.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {selectedSnippet?.parameters && selectedSnippet.parameters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code size={16} />
                  Parameters
                </h4>
                <div className="space-y-2">
                  {selectedSnippet.parameters.map((param) => (
                    <div key={param.name} className="bg-muted/50 rounded-lg p-3 border">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold text-primary">
                          {param.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Code</h4>
              <div className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed">
                  <code>{selectedSnippet?.code}</code>
                </pre>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => selectedSnippet && handleCopySnippet(selectedSnippet)}
              >
                {copiedId === selectedSnippet?.id ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              {onInsertSnippet && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    if (selectedSnippet) {
                      handleInsertSnippet(selectedSnippet)
                      setSelectedSnippet(null)
                    }
                  }}
                >
                  <ArrowRight size={16} className="mr-2" />
                  Insert into Editor
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
