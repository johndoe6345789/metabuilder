'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setViewColumnWidths } from '@/store/slices/uiSlice';

const MIN_WIDTH = 60;

type DragState = {
  idx: number;
  startX: number;
  startWidth: number;
};

export function usePersistedResizableColumns(
  key: string,
  initialWidths: number[],
) {
  const dispatch = useAppDispatch();
  const stored = useAppSelector(
    s => s.ui.columnWidths?.[key] ?? null,
  );

  const resolve = (s: number[] | null, init: number[]) =>
    s && s.length === init.length ? s : init;

  const [widths, setWidths] = useState(() => resolve(stored, initialWidths));
  const widthsRef = useRef(widths);
  widthsRef.current = widths;
  const drag = useRef<DragState | null>(null);

  // Reset when column count changes (e.g. switching tables in data grid)
  useEffect(() => {
    const next = resolve(stored, initialWidths);
    setWidths(next);
  }, [initialWidths.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hydrate from Redux on first mount (after persist rehydration)
  useEffect(() => {
    if (stored && stored.length === initialWidths.length) {
      setWidths(stored);
    }
  }, [stored]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(
    (w: number[]) => dispatch(setViewColumnWidths({ key, widths: w })),
    [dispatch, key],
  );

  const onMouseDown = useCallback(
    (idx: number) => (e: React.MouseEvent) => {
      drag.current = {
        idx,
        startX: e.clientX,
        startWidth: widthsRef.current[idx]!,
      };
      e.preventDefault();
    },
    [],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current) return;
      const { idx, startX, startWidth } = drag.current;
      const next = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
      setWidths(w => {
        const updated = w.map((v, i) => (i === idx ? next : v));
        return updated;
      });
    };
    const onUp = () => {
      if (drag.current) persist(widthsRef.current);
      drag.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [persist]);

  return { widths, onMouseDown };
}
