'use client'

import { useCallback, useRef, useState } from 'react'
import type { Position } from '@/workflow-editor'
import { MAX_ZOOM, MIN_ZOOM } from './types'

/** Pan/zoom viewport state for the canvas -- offset, zoom level, the
 *  canvas DOM ref, and the zoom control callbacks. */
export function useCanvasView() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)

  const onWheel = useCallback((e: React.WheelEvent) => {
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)))
  }, [])
  const zoomIn = useCallback(() => {
    setZoom(z => Math.min(MAX_ZOOM, z + 0.1))
  }, [])
  const zoomOut = useCallback(() => {
    setZoom(z => Math.max(MIN_ZOOM, z - 0.1))
  }, [])
  const zoomReset = useCallback(() => {
    setZoom(1)
    setCanvasOffset({ x: 0, y: 0 })
  }, [])

  return {
    canvasRef,
    canvasOffset,
    setCanvasOffset,
    zoom,
    isPanning,
    setIsPanning,
    onWheel,
    zoomIn,
    zoomOut,
    zoomReset,
  }
}
