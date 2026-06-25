/**
 * useEditorPan - Pan actions from Redux editor slice
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { editorSlice } from '@metabuilder/redux-slices';

const { setPan, panBy, resetPan } = editorSlice.actions;

export function useEditorPan() {
  const dispatch = useDispatch();
  const pan = useSelector((s: RootState) => s.editor.pan);

  return {
    pan,
    setPan: useCallback(
      (x: number, y: number) => dispatch(setPan({ x, y })),
      [dispatch]
    ),
    panBy: useCallback(
      (dx: number, dy: number) =>
        dispatch(panBy({ dx, dy })),
      [dispatch]
    ),
    resetPan: useCallback(
      () => dispatch(resetPan()),
      [dispatch]
    ),
  };
}
