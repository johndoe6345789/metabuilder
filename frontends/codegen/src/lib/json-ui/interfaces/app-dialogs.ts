import type {
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

export interface AppDialogsProps {
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  shortcutsOpen: boolean
  onShortcutsOpenChange: (open: boolean) => void
  previewOpen: boolean
  onPreviewOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: DbModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (page: string) => void
  onFileSelect: (fileId: string) => void
}
