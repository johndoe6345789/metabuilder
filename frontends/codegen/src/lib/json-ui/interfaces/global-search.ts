import {
  ComponentNode,
  ComponentTree,
  Lambda,
  PlaywrightTest,
  DbModel,
  ProjectFile,
  StorybookStory,
  UnitTest,
  Workflow,
} from '@/types/project'

/**
 * GlobalSearchProps - JSON definition interface
 * Global search dialog
 */
export interface GlobalSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  recentSearches?: any[]
  groupedResults?: any[]
  clearHistory?: () => void
  removeHistoryItem?: (item: any) => void
  handleSelect?: (item: any) => void
  handleHistorySelect?: (item: any) => void
  files?: ProjectFile[]
  models?: DbModel[]
  components?: ComponentNode[]
  componentTrees?: ComponentTree[]
  workflows?: Workflow[]
  lambdas?: Lambda[]
  playwrightTests?: PlaywrightTest[]
  storybookStories?: StorybookStory[]
  unitTests?: UnitTest[]
  onNavigate?: (tab: string, itemId?: string) => void
  onFileSelect?: (fileId: string) => void
}
