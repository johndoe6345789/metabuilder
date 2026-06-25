/**
 * useCanvasTransform - Zoom, pan, and arrow-key canvas navigation
 */

import { useCallback, useState } from 'react';
import { useProjectCanvas } from '../../../hooks/canvas';
import { useWheelZoom } from './useWheelZoom';
import { useDocumentMouseEvents } from './useDocumentMouseEvents';

interface PanDelta {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const ARROW_DELTAS: Record<Direction, PanDelta> = {
  up: { x: 0, y: 100 },
  down: { x: 0, y: -100 },
  left: { x: 100, y: 0 },
  right: { x: -100, y: 0 },
};

interface UseCanvasTransformReturn {
  isPanning: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleArrowPan: (direction: Direction) => void;
  bindWheelListener: (
    element: HTMLDivElement | null
  ) => () => void;
}

export function useCanvasTransform(
  onCanvasPan?: (pan: PanDelta) => void,
  onCanvasZoom?: (zoom: number) => void
): UseCanvasTransformReturn {
  const { zoom, pan, pan_canvas } = useProjectCanvas();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const { bindWheelListener } = useWheelZoom({
    zoom,
    onCanvasZoom,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !e.shiftKey) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const delta = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      };
      pan_canvas(delta);
      setPanStart({ x: e.clientX, y: e.clientY });
      onCanvasPan?.({ x: pan.x + delta.x, y: pan.y + delta.y });
    },
    [isPanning, panStart, pan_canvas, pan, onCanvasPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useDocumentMouseEvents({
    onMouseMove: handleMouseMove as any,
    onMouseUp: handleMouseUp,
    enabled: true,
  });

  const handleArrowPan = useCallback(
    (direction: Direction) => {
      pan_canvas(ARROW_DELTAS[direction]);
    },
    [pan_canvas]
  );

  return {
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleArrowPan,
    bindWheelListener,
  };
}

export default useCanvasTransform;
