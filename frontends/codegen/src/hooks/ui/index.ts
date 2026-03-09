// Codegen-specific UI hooks
export { useDashboardMetrics } from './use-dashboard-metrics'
export { useDashboardTips } from './use-dashboard-tips'

// Re-export from centralized @metabuilder/hooks package
export { useToggle, useDialog } from '@metabuilder/hooks'
export type { UseToggleReturn as UseToggleOptions, UseDialogReturn } from '@metabuilder/hooks'
