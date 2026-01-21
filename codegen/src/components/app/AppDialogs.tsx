import { Suspense } from 'react'

import { DialogRegistry, PWARegistry } from '@/lib/component-registry'
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

const { GlobalSearch, KeyboardShortcutsDialog, PreviewDialog } = DialogRegistry
const { PWAInstallPrompt } = PWARegistry

interface AppDialogsProps {
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

export default function AppDialogs({
  searchOpen,
  onSearchOpenChange,
  shortcutsOpen,
  onShortcutsOpenChange,
  previewOpen,
  onPreviewOpenChange,
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
}: AppDialogsProps) {
  return (
    <>
      <Suspense fallback={null}>
        <GlobalSearch
          open={searchOpen}
          onOpenChange={onSearchOpenChange}
          files={files}
          models={models}
          components={components}
          componentTrees={componentTrees}
          workflows={workflows}
          lambdas={lambdas}
          playwrightTests={playwrightTests}
          storybookStories={storybookStories}
          unitTests={unitTests}
          onNavigate={onNavigate}
          onFileSelect={onFileSelect}
        />
      </Suspense>

      <Suspense fallback={null}>
        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={onShortcutsOpenChange} />
      </Suspense>
      <Suspense fallback={null}>
        <PreviewDialog open={previewOpen} onOpenChange={onPreviewOpenChange} />
      </Suspense>
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>
    </>
  )
}
