import { useState } from 'react'
import { toast } from 'sonner'

import AppDialogs from '@/components/app/AppDialogs'
import AppMainPanel from '@/components/app/AppMainPanel'
import appStrings from '@/data/app-shortcuts.json'
import useAppNavigation from '@/hooks/use-app-navigation'
import useAppProject from '@/hooks/use-app-project'
import useAppShortcuts from '@/hooks/use-app-shortcuts'

export default function AppRouterLayout() {
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppMainPanel
        currentPage={currentPage}
        navigateToPage={navigateToPage}
        featureToggles={featureToggles}
        errorCount={errorCount}
        lastSaved={lastSaved}
        currentProject={currentProject}
        onProjectLoad={handleProjectLoad}
        onSearch={() => setSearchOpen(true)}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onGenerateAI={() => toast.info(appStrings.messages.aiComingSoon)}
        onExport={() => toast.info(appStrings.messages.exportComingSoon)}
        onPreview={() => setPreviewOpen(true)}
        onShowErrors={() => navigateToPage('errors')}
        stateContext={stateContext}
        actionContext={actionContext}
      />

      <AppDialogs
        searchOpen={searchOpen}
        onSearchOpenChange={setSearchOpen}
        shortcutsOpen={shortcutsOpen}
        onShortcutsOpenChange={setShortcutsOpen}
        previewOpen={previewOpen}
        onPreviewOpenChange={setPreviewOpen}
        files={files}
        models={models}
        components={components}
        componentTrees={componentTrees}
        workflows={workflows}
        lambdas={lambdas}
        playwrightTests={playwrightTests}
        storybookStories={storybookStories}
        unitTests={unitTests}
        onNavigate={navigateToPage}
        onFileSelect={(fileId) => {
          fileOps.setActiveFileId(fileId)
          navigateToPage('code')
        }}
      />
    </div>
  )
}
