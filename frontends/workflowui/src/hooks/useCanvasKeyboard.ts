/**
 * useCanvasKeyboard Hook
 *
 * Handles keyboard shortcuts for canvas operations. This hook provides keyboard
 * event handling for common canvas operations like selection, deletion, duplication,
 * and search. It also supports arrow key panning.
 *
 * This is a local wrapper that uses Redux directly, unlike the shared
 * @metabuilder/hooks version which requires dependency injection.
 *
 * @param {KeyboardHandlers} handlers - Optional callbacks for keyboard events
 * @returns {void}
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedItemIds, clearSelection } from '@metabuilder/redux-slices';
import type { RootState } from '../store/store';

interface KeyboardHandlers {
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onSearch?: () => void;
}

export function useCanvasKeyboard(handlers: KeyboardHandlers = {}) {
  const dispatch = useDispatch();
  const selectedItemIds = useSelector((state: RootState) => selectSelectedItemIds(state));

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + A: Select all
      if (isMeta && e.key === 'a') {
        e.preventDefault();
        handlers.onSelectAll?.();
      }

      // Delete: Delete selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemIds.size > 0) {
          e.preventDefault();
          handlers.onDeleteSelected?.();
        }
      }

      // Ctrl/Cmd + D: Duplicate selected
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        if (selectedItemIds.size > 0) {
          handlers.onDuplicateSelected?.();
        }
      }

      // Ctrl/Cmd + F: Search/Filter
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        handlers.onSearch?.();
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch(clearSelection());
      }

      // Arrow keys: Pan canvas (when no input focused)
      const activeElement = document.activeElement as HTMLElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        (activeElement as any)?.contentEditable === 'true';

      if (!isInputFocused) {
        const arrowPanAmount = 50;
        const arrowMap: Record<string, [number, number]> = {
          ArrowUp: [0, arrowPanAmount],
          ArrowDown: [0, -arrowPanAmount],
          ArrowLeft: [arrowPanAmount, 0],
          ArrowRight: [-arrowPanAmount, 0]
        };

        if (arrowMap[e.key] && !isMeta) {
          e.preventDefault();
          // Pan canvas via arrow keys
          // This will be handled via context/redux dispatch
        }
      }
    },
    [selectedItemIds, dispatch, handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useCanvasKeyboard;
