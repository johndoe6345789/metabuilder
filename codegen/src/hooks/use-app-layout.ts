import { useState } from 'react'
import useAppNavigation from './use-app-navigation'
import useAppProject from './use-app-project'
import useAppShortcuts from './use-app-shortcuts'

export function useAppLayout() {
  const { currentPage, navigateToPage } = useAppNavigation()
  const {
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    featureToggles,
    fileOps,
    currentProject,
    handleProjectLoad,
    stateContext,
    actionContext,
  } = useAppProject()
  const { searchOpen, setSearchOpen, shortcutsOpen, setShortcutsOpen, previewOpen, setPreviewOpen } =
    useAppShortcuts({ featureToggles, navigateToPage })
  const [lastSaved] = useState<number | null>(() => Date.now())
  const [errorCount] = useState(0)

  // Create inline callback handlers for JSON binding
  const onGenerateAI = () => {
    // This will be defined via toast.info from appStrings
  }
  const onExport = () => {
    // This will be defined via toast.info from appStrings
  }
  const onFileSelect = (fileId: string) => {
    fileOps.setActiveFileId(fileId)
    navigateToPage('code')
  }

  return {
    currentPage,
    navigateToPage,
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    featureToggles,
    fileOps,
    currentProject,
    handleProjectLoad,
    stateContext,
    actionContext,
    searchOpen,
    setSearchOpen,
    shortcutsOpen,
    setShortcutsOpen,
    previewOpen,
    setPreviewOpen,
    lastSaved,
    errorCount,
    onGenerateAI,
    onExport,
    onFileSelect,
  }
}
