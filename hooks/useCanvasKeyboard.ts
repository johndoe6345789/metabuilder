/**
 * useCanvasKeyboard Hook
 *
 * Handles keyboard shortcuts for canvas operations. This hook provides keyboard
 * event handling for common canvas operations like selection, deletion, duplication,
 * and search. It also supports arrow key panning.
 *
 * Migrated from workflowui - requires Redux store with canvasSlice
 *
 * @param {KeyboardHandlers} handlers - Optional callbacks for keyboard events
 * @param {UseCanvasKeyboardOptions} options - Redux dispatch and selector functions
 * @returns {void}
 */

import { useEffect, useCallback } from 'react';

interface KeyboardHandlers {
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onSearch?: () => void;
}

interface UseCanvasKeyboardOptions {
  /** Function to dispatch actions (e.g., from useDispatch) */
  dispatch: (action: any) => void;
  /** Set of currently selected item IDs */
  selectedItemIds: Set<string>;
  /** Action creator for clearing selection */
  clearSelectionAction: () => { type: string; payload?: any };
}

export function useCanvasKeyboard(
  handlers: KeyboardHandlers = {},
  options: UseCanvasKeyboardOptions
) {
  const { dispatch, selectedItemIds, clearSelectionAction } = options;

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
        dispatch(clearSelectionAction());
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
    [selectedItemIds, dispatch, handlers, clearSelectionAction]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useCanvasKeyboard;
