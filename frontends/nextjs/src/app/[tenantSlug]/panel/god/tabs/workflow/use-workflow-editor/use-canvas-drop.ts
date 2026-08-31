'use client'

import { useCallback } from 'react'
import {
  generateNodeId,
  type NodeType,
  type Position,
  type Workflow,
  type WorkflowNode,
} from '@/workflow-editor'

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
      const node: WorkflowNode = {
        id: generateNodeId(),
        type: nt.type,
        name: nt.name,
        position,
        config: { ...nt.defaultConfig },
        inputs: nt.inputs,
        outputs: nt.outputs,
      }
      commit({ ...workflow, nodes: [...workflow.nodes, node] })
    },
    [workflow, canvasOffset, zoom, getNodeType, commit, canvasRef]
  )

  return { onPaletteDragStart, onCanvasDragOver, onCanvasDrop }
}
