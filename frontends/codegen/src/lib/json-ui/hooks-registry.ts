/**
 * Hook Registry for JSON Components
 * Allows JSON components to use custom React hooks
 */
import { useSaveIndicator } from '@/hooks/use-save-indicator'
import { useComponentTree } from '@/hooks/use-component-tree'
import { useStorageBackendInfo } from '@/hooks/use-storage-backend-info'
import { useD3BarChart } from '@/hooks/use-d3-bar-chart'
import { useFocusState, useCopyState, usePasswordVisibility, useImageState, usePopoverState, useAccordion } from '@metabuilder/hooks'
import { useMenuState } from '@/hooks/use-menu-state'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useBindingEditor } from '@/hooks/use-binding-editor'
import { useRepeatWrapper } from '@/hooks/use-repeat-wrapper'
import { useAppLayout } from '@/hooks/use-app-layout'
import { useAppRouterLayout } from '@/hooks/use-app-router-layout'
import { useNavigationMenu } from '@/hooks/use-navigation-menu'
import { useDataSourceManagerState } from '@/hooks/use-data-source-manager-state'
import { useFormatValue } from '@metabuilder/hooks'
import { useConflictResolution } from '@/hooks/use-conflict-resolution'
import { useConflictCard } from '@/hooks/use-conflict-card'
import { useConflictDetailsDialog } from '@/hooks/use-conflict-details-dialog'
import { useConflictResolutionDemo } from '@/hooks/use-conflict-resolution-demo'
import { useDocumentationView } from '@/hooks/use-documentation-view'
import { useDockerBuildDebugger } from '@/hooks/use-docker-build-debugger'
import { useDataBindingDesigner } from '@/hooks/use-data-binding-designer'
import { useErrorPanelMain } from '@/hooks/use-error-panel-main'
import { useFaviconDesigner } from '@/components/FaviconDesigner/useFaviconDesigner'
import { useFeatureIdeaCloud } from '@/hooks/use-feature-idea-cloud'
import { usePersistenceDashboardView } from '@/hooks/use-persistence-dashboard-view'
import { useComponentTreeBuilder } from '@/hooks/use-component-tree-builder'
import { useCodeEditor } from '@/hooks/use-code-editor'
import { usePlaywrightDesigner } from '@/hooks/use-playwright-designer'
import { useUnitTestDesigner } from '@/hooks/use-unit-test-designer'
import { useStorybookDesigner } from '@/hooks/use-storybook-designer'
import { usePWASettings } from '@/hooks/use-pwa-settings'
import { useTemplateSelector } from '@/hooks/use-template-selector'
import { usePersistenceExample } from '@/hooks/use-persistence-example'
import { useProjectSettingsView } from '@/hooks/use-project-settings-view'
import { useAtomicLibraryShowcase } from '@/hooks/use-atomic-library-showcase'
import { useProjectManagerDropdown } from '@/hooks/use-project-manager-dropdown'
import { useDBALSearchInput } from '@/hooks/use-dbal-search-input'
import { useQuickSeed } from '@/hooks/use-quick-seed'
import { useSearchInput } from '@/hooks/use-search-input'
import { useTranslation } from '@/hooks/use-translation'
import { useTranslationEditor } from '@/hooks/use-translation-editor'
import { useFeatureToggleSettings } from '@/hooks/use-feature-toggle-settings'

export interface HookRegistry {
  [key: string]: (...args: any[]) => any
}

/**
 * Registry of all custom hooks available to JSON components
 */
export const hooksRegistry: HookRegistry = {
  useSaveIndicator,
  useComponentTree,
  useStorageBackendInfo,
  useD3BarChart,
  useFocusState,
  useCopyState,
  usePasswordVisibility,
  useImageState,
  usePopoverState,
  useMenuState,
  useFileUpload,
  useAccordion,
  useBindingEditor,
  useRepeatWrapper,
  useAppLayout,
  useAppRouterLayout,
  useNavigationMenu,
  useDataSourceManagerState,
  useFormatValue,
  useConflictResolution,
  useConflictCard,
  useConflictDetailsDialog,
  useConflictResolutionDemo,
  useDocumentationView,
  useDockerBuildDebugger,
  useDataBindingDesigner,
  useErrorPanelMain,
  useFaviconDesigner,
  useFeatureIdeaCloud,
  usePersistenceDashboardView,
  useComponentTreeBuilder,
  useCodeEditor,
  usePlaywrightDesigner,
  useUnitTestDesigner,
  useStorybookDesigner,
  usePWASettings,
  useTemplateSelector,
  usePersistenceExample,
  useProjectSettingsView,
  useAtomicLibraryShowcase,
  useProjectManagerDropdown,
  useDBALSearchInput,
  useQuickSeed,
  useSearchInput,
  useTranslation,
  useTranslationEditor,
  useFeatureToggleSettings,
}

/**
 * Get a hook from the registry by name
 */
export function getHook(hookName: string) {
  return hooksRegistry[hookName]
}

/**
 * Register a new hook
 */
export function registerHook(name: string, hook: (...args: any[]) => any) {
  hooksRegistry[name] = hook
}
