/**
 * useWheelZoom - Binds a wheel listener for zoom on a canvas element
 */

import { useCallback } from 'react';

interface UseWheelZoomParams {
  zoom: number;
  onCanvasZoom?: (zoom: number) => void;
}

export function useWheelZoom({
  zoom,
  onCanvasZoom,
}: UseWheelZoomParams) {
  const bindWheelListener = useCallback(
    (element: HTMLDivElement | null) => {
      const handleWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(
          0.1,
          Math.min(3, zoom * delta)
        );
        if (onCanvasZoom) onCanvasZoom(newZoom);
      };

      if (element) {
        element.addEventListener('wheel', handleWheel, {
          passive: false,
        });
        return () =>
          element.removeEventListener('wheel', handleWheel);
      }
      return () => {};
    },
    [zoom, onCanvasZoom]
  );

  return { bindWheelListener };
}
