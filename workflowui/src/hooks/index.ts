/**
 * Hooks Export Index
 * Central export for all custom React hooks
 */

// Existing hooks
export { useWorkflow } from './useWorkflow';
export { useExecution } from './useExecution';
export { useUI } from './ui'; // Now imports from modular UI hooks
export { useEditor } from './editor'; // Now imports from modular editor hooks

// New auth and form hooks
export { useAuthForm } from './useAuthForm';
export { usePasswordValidation } from './usePasswordValidation';
export { useLoginLogic } from './useLoginLogic';
export { useRegisterLogic } from './useRegisterLogic';
export { useHeaderLogic } from './useHeaderLogic';
export { useResponsiveSidebar } from './useResponsiveSidebar';
export { useProjectSidebarLogic } from './useProjectSidebarLogic';
export { useDashboardLogic } from './useDashboardLogic';

// New hooks from project canvas plan
export { useWorkspace } from './useWorkspace';
export { useProject } from './useProject';
export { useRealtimeService } from './useRealtimeService'; // Phase 3: Re-enabled for Phase 4 integration
export { useCanvasKeyboard } from './useCanvasKeyboard'; // Phase 3: Integrated into InfiniteCanvas
export { useCanvasVirtualization } from './useCanvasVirtualization';

// Canvas hooks - modular version
export { useProjectCanvas } from './canvas';
export {
  useCanvasZoom,
  useCanvasPan,
  useCanvasSelection,
  useCanvasItems,
  useCanvasSettings
} from './canvas';

// Editor hooks - modular version (new)
export {
  useEditorZoom,
  useEditorPan,
  useEditorNodes,
  useEditorEdges,
  useEditorSelection,
  useEditorClipboard,
  useEditorHistory
} from './editor';

// UI hooks - modular version (new)
export {
  useUIModals,
  useUINotifications,
  useUILoading,
  useUITheme,
  useUISidebar
} from './ui';
