import { Suspense } from 'react'

import { AppHeader } from '@/lib/json-ui/json-components'
import { PWARegistry } from '@/lib/component-registry'
import { RouterProvider } from '@/router'
import type { FeatureToggles, Project } from '@/types/project'

const { PWAUpdatePrompt, PWAStatusBar } = PWARegistry

interface AppMainPanelProps {
  currentPage: string
  navigateToPage: (page: string) => void
  featureToggles: FeatureToggles
  errorCount: number
  lastSaved: number | null
  currentProject: Project
  onProjectLoad: (project: Project) => void
  onSearch: () => void
  onShowShortcuts: () => void
  onGenerateAI: () => void
  onExport: () => void
  onPreview: () => void
  onShowErrors: () => void
  stateContext: any
  actionContext: any
}

export default function AppMainPanel({
  currentPage,
  navigateToPage,
  featureToggles,
  errorCount,
  lastSaved,
  currentProject,
  onProjectLoad,
  onSearch,
  onShowShortcuts,
  onGenerateAI,
  onExport,
  onPreview,
  onShowErrors,
  stateContext,
  actionContext,
}: AppMainPanelProps) {
  return (
    <>
      <Suspense fallback={<div className="h-1 bg-primary animate-pulse" />}>
        <PWAStatusBar />
      </Suspense>
      <Suspense fallback={null}>
        <PWAUpdatePrompt />
      </Suspense>
      <AppHeader
        activeTab={currentPage}
        onTabChange={navigateToPage}
        featureToggles={featureToggles}
        errorCount={errorCount}
        lastSaved={lastSaved}
        currentProject={currentProject}
        onProjectLoad={onProjectLoad}
        onSearch={onSearch}
        onShowShortcuts={onShowShortcuts}
        onGenerateAI={onGenerateAI}
        onExport={onExport}
        onPreview={onPreview}
        onShowErrors={onShowErrors}
      />
      <div className="flex-1 overflow-hidden">
        <RouterProvider
          featureToggles={featureToggles}
          stateContext={stateContext}
          actionContext={actionContext}
        />
      </div>
    </>
  )
}
