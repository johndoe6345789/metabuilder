/**
 * useEditorClipboard Hook
 * Manages clipboard operations (copy/paste/cut) for editor nodes and edges
 * NOTE: Currently placeholder for future implementation
 * This hook will manage clipboard state and operations for editor items
 */

import { useCallback, useState } from 'react';

export interface ClipboardData {
  nodes: string[];
  edges: string[];
  timestamp: number;
}

export interface UseEditorClipboardReturn {
  clipboardData: ClipboardData | null;
  hasCopiedData: boolean;
  copyToClipboard: (nodes: string[], edges: string[]) => void;
  cutToClipboard: (nodes: string[], edges: string[]) => void;
  pasteFromClipboard: () => ClipboardData | null;
  clearClipboard: () => void;
}

export function useEditorClipboard(): UseEditorClipboardReturn {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

  const copyToClipboard = useCallback((nodes: string[], edges: string[]) => {
    setClipboardData({
      nodes,
      edges,
      timestamp: Date.now()
    });
  }, []);

  const cutToClipboard = useCallback((nodes: string[], edges: string[]) => {
    // Cut is copy + delete, delete is handled by caller
    setClipboardData({
      nodes,
      edges,
      timestamp: Date.now()
    });
  }, []);

  const pasteFromClipboard = useCallback(() => {
    return clipboardData;
  }, [clipboardData]);

  const clearClipboard = useCallback(() => {
    setClipboardData(null);
  }, []);

  return {
    clipboardData,
    hasCopiedData: clipboardData !== null,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    clearClipboard
  };
}

export default useEditorClipboard;
