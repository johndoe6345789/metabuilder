/**
 * useEditor Hook (Backward Compatibility Wrapper)
 * Re-exports the modular useEditor hook from ./editor/useEditor
 *
 * REFACTORED: The original monolithic hook has been split into focused hooks
 * located in src/hooks/editor/:
 *   - useEditorZoom.ts      (zoom management)
 *   - useEditorPan.ts       (pan/translate management)
 *   - useEditorNodes.ts     (node selection)
 *   - useEditorEdges.ts     (edge selection)
 *   - useEditorSelection.ts (unified selection + drawing)
 *   - useEditorClipboard.ts (copy/paste operations)
 *   - useEditorHistory.ts   (undo/redo functionality)
 *   - useEditor.ts          (composition hook)
 *
 * This file provides backward compatibility - all existing code using
 * `import { useEditor } from './hooks/useEditor'` will continue to work.
 *
 * New code should import from the modular structure:
 *   import { useEditor, useEditorZoom, useEditorNodes } from './hooks/editor'
 */

export { useEditor, type UseEditorReturn } from './editor/useEditor';
export type {
  UseEditorZoomReturn,
  UseEditorPanReturn,
  UseEditorNodesReturn,
  UseEditorEdgesReturn,
  UseEditorSelectionReturn,
  UseEditorClipboardReturn,
  UseEditorHistoryReturn
} from './editor';
