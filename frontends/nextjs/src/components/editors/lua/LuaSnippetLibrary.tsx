import { useMemo, useState } from 'react'
import { Tabs } from '@/components/ui'
import { BookOpen } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getSnippetsByCategory, searchSnippets, type LuaSnippet } from '@/lib/lua-snippets'
import { SearchBar } from './LuaSnippetLibrary/SearchBar'
import { SnippetDialog } from './LuaSnippetLibrary/SnippetDialog'
import { SnippetList } from './LuaSnippetLibrary/SnippetList'

interface LuaSnippetLibraryProps {
  onInsertSnippet?: (code: string) => void
}

export function LuaSnippetLibrary({ onInsertSnippet }: LuaSnippetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSnippet, setSelectedSnippet] = useState<LuaSnippet | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const displayedSnippets = useMemo(
    () => (searchQuery ? searchSnippets(searchQuery) : getSnippetsByCategory(selectedCategory)),
    [searchQuery, selectedCategory]
  )

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

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <SnippetList
          snippets={displayedSnippets}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectSnippet={setSelectedSnippet}
          onCopySnippet={handleCopySnippet}
          onInsertSnippet={onInsertSnippet ? handleInsertSnippet : undefined}
          copiedId={copiedId}
        />
      </Tabs>

      <SnippetDialog
        snippet={selectedSnippet}
        copiedId={copiedId}
        onCopy={handleCopySnippet}
        onInsert={
          onInsertSnippet
            ? snippet => {
                handleInsertSnippet(snippet)
                setSelectedSnippet(null)
              }
            : undefined
        }
        onClose={() => setSelectedSnippet(null)}
      />
    </div>
  )
}
