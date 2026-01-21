import type { FeatureToggles, Project } from '@/types/project'

export interface AppHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  featureToggles: FeatureToggles
  errorCount: number
  lastSaved: number | null
  currentProject: Project
  onProjectLoad: (project: Project) => void
  onSearch: () => void
  onShowShortcuts: () => void
  onGenerateAI: () => void
  onExport: () => void
  onPreview?: () => void
  onShowErrors: () => void
}
