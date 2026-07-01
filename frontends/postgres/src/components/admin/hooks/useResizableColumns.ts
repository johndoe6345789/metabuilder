'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_WIDTH = 60;

type DragState = {
  idx: number;
  startX: number;
  startWidth: number;
};

export function useResizableColumns(initialWidths: number[]) {
  const [widths, setWidths] = useState(initialWidths);
  const widthsRef = useRef(widths);

  useEffect(() => {
    setWidths(initialWidths);
  }, [initialWidths.length]); // eslint-disable-line react-hooks/exhaustive-deps
  widthsRef.current = widths;
  const drag = useRef<DragState | null>(null);

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
      const next = Math.max(
        MIN_WIDTH,
        startWidth + (e.clientX - startX),
      );
      setWidths(w => w.map((v, i) => (i === idx ? next : v)));
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return { widths, onMouseDown };
}
