/**
 * useEditorKeyboard - Keyboard shortcuts for the editor
 */

'use client';

import { useEffect } from 'react';

interface EditorKeyboardParams {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  setDrawingConnection: (c: null) => void;
  setPropertiesDialogOpen: (open: boolean) => void;
  handleDeleteNode: (id: string) => void;
}

export function useEditorKeyboard({
  selectedNodeId,
  setSelectedNodeId,
  setDrawingConnection,
  setPropertiesDialogOpen,
  handleDeleteNode,
}: EditorKeyboardParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedNodeId &&
        tag !== 'INPUT'
      ) {
        handleDeleteNode(selectedNodeId);
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setDrawingConnection(null);
        setPropertiesDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    setSelectedNodeId,
    setDrawingConnection,
    setPropertiesDialogOpen,
    handleDeleteNode,
  ]);
}
