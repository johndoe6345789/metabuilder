/**
 * Editor Hooks Index
 * Exports all editor-related hooks
 * Provides backward-compatible interface with original useEditor
 */

export { useEditor, type UseEditorReturn } from './useEditor';
export { useEditorZoom, type UseEditorZoomReturn } from './useEditorZoom';
export { useEditorPan, type UseEditorPanReturn } from './useEditorPan';
export { useEditorNodes, type UseEditorNodesReturn } from './useEditorNodes';
export { useEditorEdges, type UseEditorEdgesReturn } from './useEditorEdges';
export { useEditorSelection, type UseEditorSelectionReturn } from './useEditorSelection';
export { useEditorClipboard, type UseEditorClipboardReturn, type ClipboardData } from './useEditorClipboard';
export { useEditorHistory, type UseEditorHistoryReturn } from './useEditorHistory';
