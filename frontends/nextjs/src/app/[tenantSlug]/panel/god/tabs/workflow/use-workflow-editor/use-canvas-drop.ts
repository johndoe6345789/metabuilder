'use client'

import { useCallback } from 'react'
import {
  type NodeType,
  type Position,
  type Workflow,
} from '@/workflow-editor'
import { makeNode, nextStepPosition } from './make-node'

export interface UseCanvasDropArgs {
  canvasRef: React.RefObject<HTMLDivElement | null>
  canvasOffset: Position
  zoom: number
  workflow: Workflow
  getNodeType: (type: string) => NodeType | undefined
  commit: (wf: Workflow) => void
}

/** Drag a node type from the palette and drop it onto the canvas. */
export function useCanvasDrop(args: UseCanvasDropArgs) {
  const { canvasRef, canvasOffset, zoom, workflow, getNodeType, commit } = args

  const onPaletteDragStart = useCallback(
    (e: React.DragEvent, nt: NodeType) => {
      e.dataTransfer.setData('application/node-type', nt.type)
      e.dataTransfer.effectAllowed = 'copy'
    },
    []
  )

  const onCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/node-type')
      const nt = getNodeType(type)
      if (nt == null || canvasRef.current == null) return
      const rect = canvasRef.current.getBoundingClientRect()
      const position: Position = {
        x: (e.clientX - rect.left - canvasOffset.x) / zoom - 90,
        y: (e.clientY - rect.top - canvasOffset.y) / zoom - 30,
      }
      const node = makeNode(nt, position)
      commit({ ...workflow, nodes: [...workflow.nodes, node] })
    },
    [workflow, canvasOffset, zoom, getNodeType, commit, canvasRef]
  )

  /**
   * Add a step without a pointer.
   *
   * The palette is drag-only -- PaletteNode takes an onDragStart and
   * nothing else -- so until this existed, a workflow could not be built
   * at all without a mouse, and a drag is the one gesture that is hardest
   * to make accessible. It also could not be exercised by anything that
   * does not synthesise HTML5 drag events, which is most things.
   */
  const addStep = useCallback(
    (nt: NodeType) => {
      const node = makeNode(nt, nextStepPosition(workflow.nodes.length))
      commit({ ...workflow, nodes: [...workflow.nodes, node] })
    },
    [workflow, commit]
  )

  return { onPaletteDragStart, onCanvasDragOver, onCanvasDrop, addStep }
}
