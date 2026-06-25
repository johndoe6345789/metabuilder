/**
 * useEditorZoom - Zoom actions from Redux editor slice
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { editorSlice } from '@metabuilder/redux-slices';

const { setZoom, zoomIn, zoomOut, resetZoom } =
  editorSlice.actions;

export function useEditorZoom() {
  const dispatch = useDispatch();
  const zoom = useSelector((s: RootState) => s.editor.zoom);

  return {
    zoom,
    setZoom: useCallback(
      (v: number) => dispatch(setZoom(v)),
      [dispatch]
    ),
    zoomIn: useCallback(() => dispatch(zoomIn()), [dispatch]),
    zoomOut: useCallback(() => dispatch(zoomOut()), [dispatch]),
    resetZoom: useCallback(
      () => dispatch(resetZoom()),
      [dispatch]
    ),
  };
}
