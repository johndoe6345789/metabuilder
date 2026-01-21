import { CommandDialog, CommandInput, CommandList } from '@/components/ui/command'
import { EmptyState } from '@/components/global-search/EmptyState'
import { RecentSearches } from '@/components/global-search/RecentSearches'
import { SearchResults } from '@/components/global-search/SearchResults'
import { useGlobalSearchData } from '@/components/global-search/useGlobalSearchData'
import {
  ComponentNode,
  ComponentTree,
  Lambda,
  PlaywrightTest,
  PrismaModel,
  ProjectFile,
  StorybookStory,
  UnitTest,
  Workflow,
} from '@/types/project'

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: PrismaModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (tab: string, itemId?: string) => void
  onFileSelect: (fileId: string) => void
}

export function GlobalSearch({
  open,
  onOpenChange,
  files,
  models,
  components,
  componentTrees,
  workflows,
  lambdas,
  playwrightTests,
  storybookStories,
  unitTests,
  onNavigate,
  onFileSelect,
}: GlobalSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    groupedResults,
    clearHistory,
    removeHistoryItem,
    handleSelect,
    handleHistorySelect,
  } = useGlobalSearchData({
    open,
    onOpenChange,
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    onNavigate,
    onFileSelect,
  })

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search features, files, models, components..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <EmptyState />
        {!searchQuery.trim() && (
          <RecentSearches
            recentSearches={recentSearches}
            onClear={clearHistory}
            onSelect={handleHistorySelect}
            onRemove={removeHistoryItem}
          />
        )}
        <SearchResults groupedResults={groupedResults} onSelect={handleSelect} />
      </CommandList>
    </CommandDialog>
  )
}
