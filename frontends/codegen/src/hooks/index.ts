// Core hooks (codegen-specific)
export * from './core/use-debounced-save'
export * from './core/use-clipboard'
export * from './core/use-library-loader'
export * from './use-ui-state'

// UI hooks - re-exports from @metabuilder/hooks + codegen-specific
export * from './ui'
export * from './ui/use-selection'
export * from './ui/use-confirmation'

// Config hooks
export * from './config/use-page-config'
export * from './config/use-layout-state'
export * from './config/use-feature-flags'

// AI hooks
export * from './ai/use-ai-generation'

// Data hooks - re-exports from @metabuilder/hooks + codegen-specific
export { useKVDataSource, useComputedDataSource, useStaticDataSource, useMultipleDataSources } from './data/use-data-source'
export { useCRUD } from './data/use-crud'
export { useSearchFilter } from './data/use-search-filter'
export { useSelection as useDataSelection } from './data/use-selection'
// Re-export from centralized hooks
export { useSort, usePagination, useFilter, useSearch } from '@metabuilder/hooks'

// Form hooks - re-export from centralized package
export { useFormField, useForm } from '@metabuilder/hooks'

export * from './use-route-preload'
export * from './use-navigation-history'
export * from './use-theme-config'
// Generic UI hooks — re-exported from shared package
export {
  useFocusState,
  useCopyState,
  usePasswordVisibility,
  useImageState,
  usePopoverState,
  useAccordion,
  useFormatValue,
  useDialogState,
  useMultipleDialogs,
  useIsMobile,
  useTabNavigation,
  useLastSaved,
  useActiveSelection,
} from '@metabuilder/hooks'
export * from './use-menu-state'
export * from './use-file-upload'
export * from './use-binding-editor'
export * from './use-repeat-wrapper'
export { useAppLayout } from './use-app-layout'
export { useAppRouterLayout } from './use-app-router-layout'
export { useNavigationMenu } from './use-navigation-menu'
export { useDataSourceManagerState } from './use-data-source-manager-state'
export { useConflictResolution } from './use-conflict-resolution'
export { useConflictCard } from './use-conflict-card'
export { useConflictDetailsDialog } from './use-conflict-details-dialog'
export { useConflictResolutionPage } from './use-conflict-resolution-page'
export { useConflictResolutionDemo } from './use-conflict-resolution-demo'
export { useDocumentationView } from './use-documentation-view'
export { useDockerBuildDebugger } from './use-docker-build-debugger'
export { useDataBindingDesigner } from './use-data-binding-designer'
export { useErrorPanelMain } from './use-error-panel-main'
export { usePersistenceDashboardView } from './use-persistence-dashboard-view'
export { useProjectSettingsView } from './use-project-settings-view'
export { useTranslation } from './use-translation'
export { useTranslationEditor } from './use-translation-editor'
export { useFeatureToggleSettings } from './use-feature-toggle-settings'
