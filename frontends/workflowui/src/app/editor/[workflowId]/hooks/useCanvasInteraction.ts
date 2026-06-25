/**
 * useCanvasInteraction - Canvas mouse/drag/zoom/pan state
 */

'use client';

import {
  useState,
  type RefObject,
} from 'react';
import { useDrawingConnection } from './useDrawingConnection';
import { useCanvasPan } from './useCanvasPan';

export type { DrawingConnection } from './useDrawingConnection';

export function useCanvasInteraction(
  canvasRef: RefObject<HTMLDivElement>
) {
  const [canvasOffset, setCanvasOffset] = useState({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [draggingNodeId, setDraggingNodeId] = useState<
    string | null
  >(null);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });
  const { drawingConnection, setDrawingConnection } =
    useDrawingConnection();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) =>
      Math.min(2, Math.max(0.25, prev + delta))
    );
  };

  const pan = useCanvasPan({
    canvasOffset,
    setCanvasOffset,
    zoom,
    drawingConnection,
    setDrawingConnection,
    canvasRef,
  });

  return {
    canvasOffset,
    setCanvasOffset,
    zoom,
    setZoom,
    isPanning: pan.isPanning,
    draggingNodeId,
    setDraggingNodeId,
    dragOffset,
    setDragOffset,
    drawingConnection,
    setDrawingConnection,
    handleCanvasMouseDown: pan.handleCanvasMouseDown,
    handleWheel,
    handleMouseMove: pan.handleMouseMove,
    handleMouseUp: pan.handleMouseUp,
  };
}
