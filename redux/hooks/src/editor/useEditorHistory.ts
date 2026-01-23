/**
 * useEditorHistory Hook
 * Manages undo/redo functionality for editor state changes
 * NOTE: Currently placeholder for future Redux-integrated implementation
 * This will integrate with Redux history middleware or Redux-undo
 */

import { useCallback, useState } from 'react';

export interface HistoryState {
  past: any[];
  present: any;
  future: any[];
}

export interface UseEditorHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  pushState: (state: any) => void;
}

export function useEditorHistory(): UseEditorHistoryReturn {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: null,
    future: []
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setHistory((prev) => {
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((prev) => {
      const newPast = [...prev.past, prev.present];
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, [canRedo]);

  const pushState = useCallback((state: any) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: state,
      future: []
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      present: null,
      future: []
    });
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    pushState
  };
}

export default useEditorHistory;
