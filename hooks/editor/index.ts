/**
 * Editor Hooks Index
 * Exports all editor-related hooks
 * Provides backward-compatible interface with original useEditor
 */

export { useEditor, type UseEditorReturn, type UseEditorOptions, type EditorActions, type EditorState, type RootState } from './useEditor';
export { useEditorZoom, type UseEditorZoomReturn, type UseEditorZoomOptions } from './useEditorZoom';
export { useEditorPan, type UseEditorPanReturn, type UseEditorPanOptions } from './useEditorPan';
export { useEditorNodes, type UseEditorNodesReturn, type UseEditorNodesOptions } from './useEditorNodes';
export { useEditorEdges, type UseEditorEdgesReturn, type UseEditorEdgesOptions } from './useEditorEdges';
export { useEditorSelection, type UseEditorSelectionReturn, type UseEditorSelectionOptions } from './useEditorSelection';
export { useEditorClipboard, type UseEditorClipboardReturn, type ClipboardData } from './useEditorClipboard';
export { useEditorHistory, type UseEditorHistoryReturn } from './useEditorHistory';
