/**
 * useWorkflowCanvas Hook
 * Manages canvas transform state: zoom, pan, viewport
 */

import { useState, useCallback, RefObject } from 'react';

export interface CanvasTransform {
  zoom: number;
  pan: { x: number; y: number };
}

export interface UseWorkflowCanvasReturn {
  // State
  zoom: number;
  pan: { x: number; y: number };
  isPanning: boolean;

  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;

  // Pan controls
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;

  // Pan interaction handlers
  startPan: (clientX: number, clientY: number) => void;
  updatePan: (clientX: number, clientY: number) => void;
  endPan: () => void;

  // Combined reset
  resetView: () => void;

  // Screen/canvas coordinate conversion
  screenToCanvas: (screenX: number, screenY: number, canvasRect: DOMRect) => { x: number; y: number };
  canvasToScreen: (canvasX: number, canvasY: number, canvasRect: DOMRect) => { x: number; y: number };
}

export interface UseWorkflowCanvasOptions {
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export function useWorkflowCanvas(options: UseWorkflowCanvasOptions = {}): UseWorkflowCanvasReturn {
  const {
    initialZoom = 1,
    initialPan = { x: 0, y: 0 },
    minZoom = 0.25,
    maxZoom = 2,
    zoomStep = 0.25,
  } = options;

  const [zoom, setZoomState] = useState(initialZoom);
  const [pan, setPanState] = useState(initialPan);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Clamp zoom to valid range
  const clampZoom = useCallback(
    (value: number) => Math.min(maxZoom, Math.max(minZoom, value)),
    [minZoom, maxZoom]
  );

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomState((prev) => clampZoom(prev + zoomStep));
  }, [clampZoom, zoomStep]);

  const zoomOut = useCallback(() => {
    setZoomState((prev) => clampZoom(prev - zoomStep));
  }, [clampZoom, zoomStep]);

  const resetZoom = useCallback(() => {
    setZoomState(1);
  }, []);

  const setZoom = useCallback(
    (value: number) => {
      setZoomState(clampZoom(value));
    },
    [clampZoom]
  );

  // Pan controls
  const setPan = useCallback((x: number, y: number) => {
    setPanState({ x, y });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setPanState((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const resetPan = useCallback(() => {
    setPanState({ x: 0, y: 0 });
  }, []);

  // Pan interaction handlers
  const startPan = useCallback(
    (clientX: number, clientY: number) => {
      setIsPanning(true);
      setPanStart({ x: clientX - pan.x, y: clientY - pan.y });
    },
    [pan]
  );

  const updatePan = useCallback(
    (clientX: number, clientY: number) => {
      if (isPanning) {
        setPanState({ x: clientX - panStart.x, y: clientY - panStart.y });
      }
    },
    [isPanning, panStart]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Combined reset
  const resetView = useCallback(() => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
  }, []);

  // Coordinate conversion
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number, canvasRect: DOMRect) => ({
      x: (screenX - canvasRect.left - pan.x) / zoom,
      y: (screenY - canvasRect.top - pan.y) / zoom,
    }),
    [pan, zoom]
  );

  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number, canvasRect: DOMRect) => ({
      x: canvasX * zoom + pan.x + canvasRect.left,
      y: canvasY * zoom + pan.y + canvasRect.top,
    }),
    [pan, zoom]
  );

  return {
    zoom,
    pan,
    isPanning,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    setPan,
    panBy,
    resetPan,
    startPan,
    updatePan,
    endPan,
    resetView,
    screenToCanvas,
    canvasToScreen,
  };
}
