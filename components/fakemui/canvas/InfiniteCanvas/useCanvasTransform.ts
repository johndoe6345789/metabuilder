/**
 * useCanvasTransform Hook
 * Manages zoom and pan interaction logic
 * Handles wheel zoom, shift+drag panning, and arrow key navigation
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useProjectCanvas } from '@metabuilder/hooks-canvas';

interface PanDelta {
  x: number;
  y: number;
}

interface UseCanvasTransformReturn {
  isPanning: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleArrowPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  bindWheelListener: (element: HTMLDivElement | null) => () => void;
}

export function useCanvasTransform(
  onCanvasPan?: (pan: PanDelta) => void,
  onCanvasZoom?: (zoom: number) => void
): UseCanvasTransformReturn {
  const { zoom, pan, pan_canvas, zoom_in, zoom_out } = useProjectCanvas();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Bind wheel zoom listener
  const bindWheelListener = useCallback(
    (element: HTMLDivElement | null) => {
      const handleWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom * delta));

        if (onCanvasZoom) {
          onCanvasZoom(newZoom);
        }
      };

      if (element) {
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => element.removeEventListener('wheel', handleWheel);
      }

      return () => {};
    },
    [zoom, onCanvasZoom]
  );

  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (e.shiftKey) {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    },
    []
  );

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;

      const delta = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };

      pan_canvas(delta);
      setPanStart({ x: e.clientX, y: e.clientY });

      if (onCanvasPan) {
        onCanvasPan({ x: pan.x + delta.x, y: pan.y + delta.y });
      }
    },
    [isPanning, panStart, pan_canvas, pan, onCanvasPan]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Bind document-level mouse move/up listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle arrow key panning
  const handleArrowPan = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      const panAmount = 100;
      const panDeltas: Record<string, PanDelta> = {
        up: { x: 0, y: panAmount },
        down: { x: 0, y: -panAmount },
        left: { x: panAmount, y: 0 },
        right: { x: -panAmount, y: 0 }
      };

      pan_canvas(panDeltas[direction]);
    },
    [pan_canvas]
  );

  return {
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleArrowPan,
    bindWheelListener
  };
}

export default useCanvasTransform;
