'use client'

import { useEffect, useRef } from 'react'
import type { Position, Workflow } from '@/workflow-editor'
import type { DragState } from './types'
import { draggedNodePosition } from './dragged-node-position'
import { useDragStart } from './use-drag-start'

export interface UseNodeDragArgs {
  canvasRef: React.RefObject<HTMLDivElement | null>
  canvasOffset: Position
  setCanvasOffset: (p: Position) => void
  zoom: number
  setIsPanning: (v: boolean) => void
  workflow: Workflow
  setWorkflow: (updater: (wf: Workflow) => Workflow) => void
  onChange: (wf: Workflow) => void
}

/** Pan-the-canvas and drag-a-node share one drag ref and one pair of
 *  window listeners, so they live together rather than split further. */
export function useNodeDrag(args: UseNodeDragArgs) {
  const {
    canvasRef,
    canvasOffset,
    setCanvasOffset,
    zoom,
    setIsPanning,
    workflow,
    setWorkflow,
    onChange,
  } = args
  const dragRef = useRef<DragState | null>(null)
  const { onCanvasMouseDown, onNodeDragStart } = useDragStart({
    dragRef,
    canvasRef,
    canvasOffset,
    setIsPanning,
    workflow,
  })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = dragRef.current
      if (d === null) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      if (d.kind === 'pan') {
        setCanvasOffset({ x: d.ox + dx, y: d.oy + dy })
      } else if (d.id !== undefined) {
        const origin = { x: d.ox, y: d.oy }
        const position = draggedNodePosition(origin, dx, dy, zoom)
        setWorkflow(wf => ({
          ...wf,
          nodes: wf.nodes.map(n => (n.id === d.id ? { ...n, position } : n)),
        }))
      }
    }
    const up = () => {
      if (dragRef.current?.kind === 'node') onChange(workflow)
      dragRef.current = null
      setIsPanning(false)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [zoom, workflow, onChange, setCanvasOffset, setWorkflow, setIsPanning])

  return { onCanvasMouseDown, onNodeDragStart }
}
