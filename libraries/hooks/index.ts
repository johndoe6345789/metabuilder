// Core hooks
export { useDragResize } from './useDragResize'
export type { DragResizeItem, UseDragResizeParams, UseDragResizeReturn } from './useDragResize'
export { useLoginLogic } from './useLoginLogic'
export { useRegisterLogic } from './useRegisterLogic'
export { usePasswordValidation } from './usePasswordValidation'
export { useAuthForm } from './useAuthForm'
export { useDashboardLogic } from './useDashboardLogic'
export { useResponsiveSidebar } from './useResponsiveSidebar'
export { useHeaderLogic } from './useHeaderLogic'
export type { UseHeaderLogicReturn } from './useHeaderLogic'
export { useProjectSidebarLogic } from './useProjectSidebarLogic'
export { useStorageSettingsHandlers } from './useStorageSettingsHandlers'
export { useStorageDataHandlers } from './useStorageDataHandlers'
export type { ToastNotifier } from './useStorageDataHandlers'
export { useStorageSwitchHandlers } from './useStorageSwitchHandlers'
export type { ToastNotifierWithInfo } from './useStorageSwitchHandlers'
export { downloadJson, createJsonFileInput, formatStorageError } from './storageSettingsUtils'
export { storageSettingsCopy } from './storageSettingsConfig'
export type { StorageBackendKey } from './storageSettingsConfig'
export {
  useUnifiedStorage,
  useStorageBackend,
  configureStorageAdapter,
  getStorageAdapter,
} from './use-unified-storage'
export type { StorageBackendType, StorageBackendAdapter } from './use-unified-storage'

// Accessibility hooks
export {
  useAccessible,
  useKeyboardNavigation,
  useFocusManagement,
  useLiveRegion,
  useFocusTrap,
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
} from './useAccessible'
export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from './useAccessible'

// Toast hooks
export { ToastProvider, useToast } from './useToast'
export type { ToastSeverity, ToastOptions, ToastContextValue, ToastProviderProps } from './useToast'

// Data structure hooks
export { useSet } from './useSet'
export { useMap } from './useMap'
export { useArray } from './useArray'
export { useStack } from './useStack'
export { useQueue } from './useQueue'

// State mutation hooks
export { useToggle } from './useToggle'
export type { UseToggleReturn } from './useToggle'
export { usePrevious } from './usePrevious'
export { useStateWithHistory } from './useStateWithHistory'
export { useAsync } from './useAsync'
export { useUndo } from './useUndo'

// Form & validation hooks
export { useValidation } from './useValidation'
export { useInput } from './useInput'
export { useCheckbox } from './useCheckbox'
export { useSelect } from './useSelect'
export { useFieldArray } from './useFieldArray'

// DOM & event hooks
export { useWindowSize } from './useWindowSize'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery } from './useMediaQuery'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'
export { useClickOutside } from './useClickOutside'
export { useHotkeys } from './useHotkeys'
export { useEventListener } from './useEventListener'

// Pagination & data hooks
export { usePagination } from './usePagination'
export { useSortable } from './useSortable'
export { useFilter } from './useFilter'
export { useSearch } from './useSearch'
export { useSort } from './useSort'

// Utility hooks
export { useCounter } from './useCounter'
export { useDebugInfo } from './useDebugInfo'
export { useMountEffect } from './useMountEffect'
export { useMountEffect as useUnmountEffect } from './useMountEffect'
export { useTimeout } from './useTimeout'
export { useInterval } from './useInterval'
export { useNotification } from './useNotification'
export { useGeolocation } from './useGeolocation'
export { useClipboard } from './useClipboard'
export { useLocalStorageState } from './useLocalStorageState'
export { useSessionStorageState } from './useSessionStorageState'
export { useOrientation } from './useOrientation'
export { useFocus } from './useFocus'
export { useHover } from './useHover'
export { useActive } from './useActive'
export { useFetch } from './useFetch'
export { useRefresh } from './useRefresh'
export { useRender } from './useRender'
export { useMounted } from './useMounted'
export { useScrollPosition } from './useScrollPosition'
export { useScroll } from './useScroll'
export { usePreviousValue } from './usePreviousValue'
export { usePromise } from './usePromise'
export { useValueRef } from './useValueRef'
export { useUpdateEffect } from './useUpdateEffect'
export { useDifferent } from './useDifferent'
export { useChange } from './useChange'
export { useDefaults } from './useDefaults'
export { useFirstEffect } from './useFirstEffect'
export { useEventCallback } from './useEventCallback'
export { useId } from './useId'
export { usePatch } from './usePatch'
export { useDeepComparison } from './useDeepComparison'
export { useForceUpdate } from './useForceUpdate'
export { useDecrement } from './useDecrement'
export { useIncrement } from './useIncrement'
export { useAsyncCallback } from './useAsyncCallback'

// API hooks
export { useApiCall } from './useApiCall'
export type { ApiCallState, ApiCallOptions, UseApiCallReturn } from './useApiCall'
export { useMobile } from './use-mobile'
export { useAsyncData } from './useAsyncData'
export { useAutoRefresh } from './useAutoRefresh'
export { useCodeEditor } from './useCodeEditor'
// useFileTree excluded from barrel export — it imports Node.js 'fs' module
// which breaks client-side bundles. Import directly: import { useFileTree } from '@metabuilder/hooks/useFileTree'
export { useGitHubFetcher } from './useGitHubFetcher'
export { useWorkflow, useWorkflowExecutions } from './useWorkflow'

// Canvas hooks
export * from './canvas';

// Editor hooks
export * from './editor';

// UI hooks
export * from './ui';

// Workflow hooks
export { useCanvasKeyboard } from './useCanvasKeyboard';
export { useCanvasVirtualization } from './useCanvasVirtualization';
export { useDocumentation } from './useDocumentation';
export { useExecution } from './useExecution';
export { useProject } from './useProject';
export { useProjectWorkflows } from './useProjectWorkflows';
export type { ProjectWorkflow } from './useProjectWorkflows';
export { useRealtimeService } from './useRealtimeService';
export { useWorkspace } from './useWorkspace';
export { useWorkflows } from './useWorkflows';

// UI Component hooks
export { useDialog } from './useDialog'
export type { UseDialogReturn } from './useDialog'
export { useConfirmDialog } from './useConfirmDialog'
export type { ConfirmDialogOptions, ConfirmDialogState, UseConfirmDialogReturn } from './useConfirmDialog'
export { useTabs } from './useTabs'
export type { UseTabsReturn } from './useTabs'
export { useDragDrop } from './useDragDrop'
export type { DragItem, DropPosition, UseDragDropReturn } from './useDragDrop'
export { useListOperations } from './useListOperations'
export type { ListOperationsOptions, UseListOperationsReturn } from './useListOperations'
export { useFileUpload } from './useFileUpload'
export type { UseFileUploadReturn } from './useFileUpload'
export { useAccordion } from './useAccordion'
export type { UseAccordionReturn } from './useAccordion'
export { useFormField, useForm } from './useFormField'
export type { ValidationRule, FieldConfig, UseFormFieldReturn, FormConfig, UseFormReturn } from './useFormField'
export { useDebouncedSave } from './useDebouncedSave'
export { useLastSaved } from './useLastSaved'

// DBAL REST API hooks
export { useBlobStorage } from './src/useBlobStorage'
export type { UseBlobStorageReturn } from './src/useBlobStorage'
export { useKVStore } from './src/useKVStore'
export type { UseKVStoreReturn } from './src/useKVStore'
export { DBALError, DBALErrorCode } from './src/types'
export type {
  EntityId,
  BaseEntity,
  SoftDeletableEntity,
  TenantScopedEntity,
  ListOptions as DBALListOptions,
  ListResult as DBALListResult,
  BulkCreateResult,
  BulkUpdateResult,
  BulkDeleteResult,
  ApiResponse as DBALApiResponse,
  BlobMetadata,
  BlobListResult as DBALBlobListResult,
  BlobListOptions as DBALBlobListOptions,
  BlobUploadOptions,
  StorableValue,
  KVEntry,
  KVListOptions as DBALKVListOptions,
  KVListResult as DBALKVListResult,
  AsyncState,
  DBALClientConfig,
} from './src/types'
