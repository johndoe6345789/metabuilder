/** useCanvasPan - Handles canvas panning and connection tracking */

'use client';

import {
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
} from 'react';
import type { UseCanvasPanInput } from '../editorTypes';

function calcConnectionPos(
  e: MouseEvent,
  rect: DOMRect,
  offset: { x: number; y: number },
  zoom: number
) {
  return {
    x: (e.clientX - rect.left - offset.x) / zoom,
    y: (e.clientY - rect.top - offset.y) / zoom,
  };
}

export function useCanvasPan({
  canvasOffset, setCanvasOffset, zoom,
  drawingConnection, setDrawingConnection, canvasRef,
}: UseCanvasPanInput) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleCanvasMouseDown = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    const el = e.target as HTMLElement;
    if (e.target === e.currentTarget || el.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setCanvasOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
      if (drawingConnection) {
        const rect =
          canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pos = calcConnectionPos(
          e, rect, canvasOffset, zoom
        );
        setDrawingConnection((prev) =>
          prev ? { ...prev, currentPosition: pos } : null
        );
      }
    },
    [isPanning, panStart, drawingConnection,
      canvasRef, canvasOffset, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false);
    if (drawingConnection) setDrawingConnection(null);
  }, [isPanning, drawingConnection]);

  useEffect(() => {
    if (!isPanning && !drawingConnection) return;
    const onMove = (e: globalThis.MouseEvent) =>
      handleMouseMove(e as unknown as MouseEvent);
    const onUp = () => handleMouseUp();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning, drawingConnection,
    handleMouseMove, handleMouseUp]);

  return { isPanning, handleCanvasMouseDown,
    handleMouseMove, handleMouseUp };
}
