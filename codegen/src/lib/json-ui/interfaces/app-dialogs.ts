import type {
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

export interface AppDialogsProps {
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  shortcutsOpen: boolean
  onShortcutsOpenChange: (open: boolean) => void
  previewOpen: boolean
  onPreviewOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: PrismaModel[]
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
