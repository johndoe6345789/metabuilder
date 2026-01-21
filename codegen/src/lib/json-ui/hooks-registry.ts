/**
 * Hook Registry for JSON Components
 * Allows JSON components to use custom React hooks
 */
import { useSaveIndicator } from '@/hooks/use-save-indicator'
import { useComponentTree } from '@/hooks/use-component-tree'
import { useStorageBackendInfo } from '@/hooks/use-storage-backend-info'
import { useD3BarChart } from '@/hooks/use-d3-bar-chart'
import { useFocusState } from '@/hooks/use-focus-state'
import { useCopyState } from '@/hooks/use-copy-state'
import { usePasswordVisibility } from '@/hooks/use-password-visibility'
import { useImageState } from '@/hooks/use-image-state'
import { usePopoverState } from '@/hooks/use-popover-state'
import { useMenuState } from '@/hooks/use-menu-state'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useAccordion } from '@/hooks/use-accordion'
import { useBindingEditor } from '@/hooks/use-binding-editor'
import { useRepeatWrapper } from '@/hooks/use-repeat-wrapper'
import { useAppLayout } from '@/hooks/use-app-layout'
import { useAppRouterLayout } from '@/hooks/use-app-router-layout'
import { useNavigationMenu } from '@/hooks/use-navigation-menu'
import { useDataSourceManagerState } from '@/hooks/use-data-source-manager-state'
import { useFormatValue } from '@/hooks/use-format-value'
import { useConflictResolution } from '@/hooks/use-conflict-resolution'
import { useConflictCard } from '@/hooks/use-conflict-card'
import { useConflictDetailsDialog } from '@/hooks/use-conflict-details-dialog'
import { useConflictResolutionDemo } from '@/hooks/use-conflict-resolution-demo'
import { useDocumentationView } from '@/hooks/use-documentation-view'
import { useDockerBuildDebugger } from '@/hooks/use-docker-build-debugger'
import { useDataBindingDesigner } from '@/hooks/use-data-binding-designer'
import { useErrorPanelMain } from '@/hooks/use-error-panel-main'

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
  // Add more hooks here as needed
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
