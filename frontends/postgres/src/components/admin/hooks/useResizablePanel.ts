'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setColumnPanelWidth,
  setIndexPanelWidth,
  setConstraintPanelWidth,
} from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

const MIN_WIDTH = 160;
const MAX_WIDTH = 480;

type PanelKey = 'column' | 'index' | 'constraint';

const selectors: Record<PanelKey, (s: RootState) => number> = {
  column: s => s.ui.columnPanelWidth,
  index: s => s.ui.indexPanelWidth,
  constraint: s => s.ui.constraintPanelWidth,
};

const actions = {
  column: setColumnPanelWidth,
  index: setIndexPanelWidth,
  constraint: setConstraintPanelWidth,
};

export function useResizablePanel(panel: PanelKey = 'column') {
  const dispatch = useAppDispatch();
  const width = useAppSelector(selectors[panel]);
  const widthRef = useRef(width);
  widthRef.current = width;
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = widthRef.current;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH,
        startWidth.current + (e.clientX - startX.current)));
      dispatch(actions[panel](next));
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dispatch, panel]);

  return { width, onMouseDown };
}
