'use client'

import { useCallback } from 'react'
import type { RefObject } from 'react'
import type { Position, Workflow } from '@/workflow-editor'
import type { DragState } from './types'

export interface UseDragStartArgs {
  dragRef: RefObject<DragState | null>
  canvasRef: RefObject<HTMLDivElement | null>
  canvasOffset: Position
  setIsPanning: (v: boolean) => void
  workflow: Workflow
}

/** Begins either drag mode by recording where it started. */
export function useDragStart(args: UseDragStartArgs) {
  const { dragRef, canvasRef, canvasOffset, setIsPanning, workflow } = args

  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target !== canvasRef.current &&
        !(e.target as HTMLElement).dataset.canvas
      )
        return
      dragRef.current = {
        kind: 'pan',
        sx: e.clientX,
        sy: e.clientY,
        ox: canvasOffset.x,
        oy: canvasOffset.y,
      }
      setIsPanning(true)
    },
    [canvasRef, canvasOffset, setIsPanning, dragRef]
  )

  const onNodeDragStart = useCallback(
    (e: React.MouseEvent, id: string) => {
      const n = workflow.nodes.find(x => x.id === id)
      if (!n) return
      dragRef.current = {
        kind: 'node',
        id,
        sx: e.clientX,
        sy: e.clientY,
        ox: n.position.x,
        oy: n.position.y,
      }
    },
    [workflow, dragRef]
  )

  return { onCanvasMouseDown, onNodeDragStart }
}
