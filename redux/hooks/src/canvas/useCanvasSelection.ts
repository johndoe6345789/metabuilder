/**
 * useCanvasSelection Hook
 * Manages canvas item selection state and selection actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@metabuilder/redux-slices';
import {
  selectCanvasItem,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  setSelection,
  clearSelection,
  selectSelectedItemIds
} from '@metabuilder/redux-slices/canvasSlice';
import {
  selectCanvasItems,
  selectCanvasItemsByIds
} from '@metabuilder/redux-slices/canvasItemsSlice';
import { ProjectCanvasItem } from '@metabuilder/redux-slices';

export interface UseCanvasSelectionReturn {
  selectedItemIds: string[];
  selectedItems: ProjectCanvasItem[];
  selectItem: (itemId: string) => void;
  addToSelection: (itemId: string) => void;
  removeFromSelection: (itemId: string) => void;
  toggleSelection: (itemId: string) => void;
  setSelectionIds: (itemIds: string[]) => void;
  clearSelection: () => void;
  selectAllItems: () => void;
}

export function useCanvasSelection(): UseCanvasSelectionReturn {
  const dispatch = useDispatch<AppDispatch>();
  const selectedItemIdsSet = useSelector((state: RootState) => selectSelectedItemIds(state));
  const selectedItemIds = Array.from(selectedItemIdsSet);
  const selectedItems = useSelector((state: RootState) => selectCanvasItemsByIds(state, selectedItemIds));
  const allItems = useSelector((state: RootState) => selectCanvasItems(state));

  const selectItem = useCallback((itemId: string) => {
    dispatch(selectCanvasItem(itemId));
  }, [dispatch]);

  const addToSelectionAction = useCallback((itemId: string) => {
    dispatch(addToSelection(itemId));
  }, [dispatch]);

  const removeFromSelectionAction = useCallback((itemId: string) => {
    dispatch(removeFromSelection(itemId));
  }, [dispatch]);

  const toggleSelectionAction = useCallback((itemId: string) => {
    dispatch(toggleSelection(itemId));
  }, [dispatch]);

  const setSelectionIds = useCallback((itemIds: string[]) => {
    dispatch(setSelection(new Set(itemIds)));
  }, [dispatch]);

  const clearSelectionAction = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const selectAllItems = useCallback(() => {
    const allIds = allItems.map((item) => item.id);
    dispatch(setSelection(new Set(allIds)));
  }, [allItems, dispatch]);

  return {
    selectedItemIds,
    selectedItems,
    selectItem,
    addToSelection: addToSelectionAction,
    removeFromSelection: removeFromSelectionAction,
    toggleSelection: toggleSelectionAction,
    setSelectionIds,
    clearSelection: clearSelectionAction,
    selectAllItems
  };
}

export default useCanvasSelection;
