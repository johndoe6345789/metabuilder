/**
 * useFaviconCanvas
 *
 * Extracted from useFaviconDesigner — handles all
 * freehand drawing / erase mouse events on the
 * overlay canvas.
 */

import { useState, useCallback } from 'react'
import { drawCanvas } from '../canvasUtils'
import type {
  BrushEffect,
  FaviconDesign,
  FaviconElement,
} from '../types'

interface UseFaviconCanvasArgs {
  canvasRef: React.RefObject<HTMLCanvasElement>
  drawingCanvasRef: React.RefObject<HTMLCanvasElement>
  activeDesign: FaviconDesign
  drawMode: 'select' | 'draw' | 'erase'
  brushColor: string
  brushSize: number
  brushEffect: BrushEffect
  gradientColor: string
  glowIntensity: number
  activeDesignId: string
  onAddElement: (element: FaviconElement) => void
  onFilterElements: (
    predicate: (e: FaviconElement) => boolean
  ) => void
}

export function useFaviconCanvas({
  canvasRef,
  drawingCanvasRef,
  activeDesign,
  drawMode,
  brushColor,
  brushSize,
  brushEffect,
  gradientColor,
  glowIntensity,
  activeDesignId,
  onAddElement,
  onFilterElements,
}: UseFaviconCanvasArgs) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<
    Array<{ x: number; y: number }>
  >([])

  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = activeDesign.size / rect.width
    const scaleY = activeDesign.size / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (drawMode === 'select') return
      setIsDrawing(true)
      setCurrentPath([getCoords(e)])
    },
    [drawMode, getCoords]
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || drawMode === 'select') return
      const coords = getCoords(e)
      setCurrentPath((prev) => [...prev, coords])

      const canvas = drawingCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (drawMode === 'draw') {
        if (brushEffect === 'glow') {
          ctx.shadowColor = brushColor
          ctx.shadowBlur = glowIntensity
        }

        setCurrentPath((path) => {
          if (path.length === 0) return path
          const prevPoint = path[path.length - 1]

          if (brushEffect === 'gradient') {
            const gradient =
              ctx.createLinearGradient(
                path[0].x,
                path[0].y,
                coords.x,
                coords.y
              )
            gradient.addColorStop(0, brushColor)
            gradient.addColorStop(1, gradientColor)
            ctx.strokeStyle = gradient
          } else {
            ctx.strokeStyle = brushColor
          }

          ctx.lineWidth = brushSize
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          if (brushEffect === 'spray') {
            for (let i = 0; i < 5; i++) {
              const ox =
                (Math.random() - 0.5) * brushSize * 2
              const oy =
                (Math.random() - 0.5) * brushSize * 2
              ctx.fillStyle = brushColor
              ctx.beginPath()
              ctx.arc(
                coords.x + ox,
                coords.y + oy,
                brushSize / 3,
                0,
                Math.PI * 2
              )
              ctx.fill()
            }
          } else {
            ctx.beginPath()
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()
          }

          ctx.shadowBlur = 0
          return [...path, coords]
        })
      } else if (drawMode === 'erase') {
        ctx.globalCompositeOperation =
          'destination-out'
        ctx.lineWidth = brushSize * 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        setCurrentPath((path) => {
          if (path.length > 0) {
            const prev = path[path.length - 1]
            ctx.beginPath()
            ctx.moveTo(prev.x, prev.y)
            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()
          }
          ctx.globalCompositeOperation =
            'source-over'
          return [...path, coords]
        })
      }
    },
    [
      isDrawing,
      drawMode,
      brushColor,
      brushSize,
      brushEffect,
      gradientColor,
      glowIntensity,
      getCoords,
    ]
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing || drawMode === 'select') return
    setIsDrawing(false)

    if (drawMode === 'draw' && currentPath.length > 1) {
      const newElement: FaviconElement = {
        id: `element-${Date.now()}`,
        type: 'freehand',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: brushColor,
        rotation: 0,
        paths: currentPath,
        strokeWidth: brushSize,
        brushEffect,
        gradientColor:
          brushEffect === 'gradient'
            ? gradientColor
            : undefined,
        glowIntensity:
          brushEffect === 'glow'
            ? glowIntensity
            : undefined,
      }
      onAddElement(newElement)
    } else if (drawMode === 'erase') {
      onFilterElements((element) => {
        if (
          element.type !== 'freehand' ||
          !element.paths
        )
          return true
        return !element.paths.some((point) =>
          currentPath.some((ep) => {
            const dist = Math.sqrt(
              Math.pow(point.x - ep.x, 2) +
              Math.pow(point.y - ep.y, 2)
            )
            return dist < brushSize * 2
          })
        )
      })
    }

    setCurrentPath([])
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas, activeDesign)
  }, [
    isDrawing,
    drawMode,
    currentPath,
    brushColor,
    brushSize,
    brushEffect,
    gradientColor,
    glowIntensity,
    canvasRef,
    activeDesign,
    onAddElement,
    onFilterElements,
  ])

  const handleCanvasMouseLeave = useCallback(() => {
    if (isDrawing) handleCanvasMouseUp()
  }, [isDrawing, handleCanvasMouseUp])

  return {
    isDrawing,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
  }
}
