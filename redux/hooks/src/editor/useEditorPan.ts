/**
 * useEditorPan Hook
 * Manages editor pan (translate) state and pan-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  setPan,
  panBy,
  resetPan
} from '@metabuilder/redux-slices/editorSlice';

export interface UseEditorPanReturn {
  pan: { x: number; y: number };
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;
}

export function useEditorPan(): UseEditorPanReturn {
  const dispatch = useDispatch();
  const pan = useSelector((state: RootState) => state.editor.pan);

  const setPanPosition = useCallback(
    (x: number, y: number) => {
      dispatch(setPan({ x, y }));
    },
    [dispatch]
  );

  const panCanvas = useCallback(
    (dx: number, dy: number) => {
      dispatch(panBy({ dx, dy }));
    },
    [dispatch]
  );

  const resetPanAction = useCallback(() => {
    dispatch(resetPan());
  }, [dispatch]);

  return {
    pan,
    setPan: setPanPosition,
    panBy: panCanvas,
    resetPan: resetPanAction
  };
}

export default useEditorPan;
