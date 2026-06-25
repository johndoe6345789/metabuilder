/**
 * useCanvasKeyboardActions - Keyboard shortcut handlers for the canvas
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteCanvasItems,
  duplicateCanvasItems,
  selectCanvasItems,
  selectSelectedItemIds,
  setSelection,
} from '@metabuilder/redux-slices';
import { useCanvasKeyboard } from './useCanvasKeyboard';
import type { RootState } from '../store/store';

export function useCanvasKeyboardActions() {
  const dispatch = useDispatch();
  const selectedItemIds = useSelector(
    (state: RootState) => selectSelectedItemIds(state)
  );
  const canvasItems = useSelector(
    (state: RootState) => selectCanvasItems(state)
  );

  const handleSelectAll = useCallback(() => {
    const allItemIds = canvasItems.map((item) => item.id);
    dispatch(setSelection(new Set(allItemIds)));
  }, [canvasItems, dispatch]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedItemIds.size > 0) {
      const itemsToDelete = Array.from(selectedItemIds);
      dispatch(deleteCanvasItems(itemsToDelete));
    }
  }, [selectedItemIds, dispatch]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedItemIds.size > 0) {
      const itemsToDuplicate = Array.from(selectedItemIds);
      dispatch(duplicateCanvasItems(itemsToDuplicate));
    }
  }, [selectedItemIds, dispatch]);

  const handleSearch = useCallback(() => {
    // TODO Phase 4: Integrate with search dialog
    console.log('Search triggered - Phase 4 integration pending');
  }, []);

  useCanvasKeyboard({
    onSelectAll: handleSelectAll,
    onDeleteSelected: handleDeleteSelected,
    onDuplicateSelected: handleDuplicateSelected,
    onSearch: handleSearch,
  });
}
