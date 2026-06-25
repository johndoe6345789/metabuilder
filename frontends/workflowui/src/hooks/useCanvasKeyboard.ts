/** useCanvasKeyboard - Keyboard shortcuts for canvas operations */

'use client';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSelectedItemIds,
  clearSelection,
} from '@metabuilder/redux-slices';
import type { RootState } from '../store/store';

interface KeyboardHandlers {
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onSearch?: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement as HTMLElement;
  return (
    el?.tagName === 'INPUT' ||
    el?.tagName === 'TEXTAREA' ||
    (el as any)?.contentEditable === 'true'
  );
}

const ARROW_PAN: Record<string, [number, number]> = {
  ArrowUp: [0, 50],
  ArrowDown: [0, -50],
  ArrowLeft: [50, 0],
  ArrowRight: [-50, 0],
};

export function useCanvasKeyboard(
  handlers: KeyboardHandlers = {}
) {
  const dispatch = useDispatch();
  const selectedItemIds = useSelector(
    (state: RootState) => selectSelectedItemIds(state)
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;

      if (isMeta && e.key === 'a') {
        e.preventDefault();
        handlers.onSelectAll?.();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemIds.size > 0) {
          e.preventDefault();
          handlers.onDeleteSelected?.();
        }
      }
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        if (selectedItemIds.size > 0)
          handlers.onDuplicateSelected?.();
      }
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        handlers.onSearch?.();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch(clearSelection());
      }
      if (!isInputFocused() && ARROW_PAN[e.key] && !isMeta) {
        e.preventDefault();
        // Pan via context/redux dispatch
      }
    },
    [selectedItemIds, dispatch, handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useCanvasKeyboard;
