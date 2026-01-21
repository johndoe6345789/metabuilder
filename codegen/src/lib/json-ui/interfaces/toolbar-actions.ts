export interface ToolbarActionsProps {
  onSearch: () => void
  onShowShortcuts: () => void
  onGenerateAI: () => void
  onExport: () => void
  onPreview?: () => void
  onShowErrors?: () => void
  errorCount?: number
  showErrorButton?: boolean
}
