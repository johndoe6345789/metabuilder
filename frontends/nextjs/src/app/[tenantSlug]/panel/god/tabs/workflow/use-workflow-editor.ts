'use client'

import { useCallback, useState } from 'react'
import { NODE_TYPES, type NodeType, type Workflow } from '@/workflow-editor'
import { useCanvasView } from './use-workflow-editor/use-canvas-view'
import { useNodeDrag } from './use-workflow-editor/use-node-drag'
import { useCanvasDrop } from './use-workflow-editor/use-canvas-drop'
import { useConnections } from './use-workflow-editor/use-connections'
import { useNodeActions } from './use-workflow-editor/use-node-actions'

/** All n8n-editor interaction state for a single workflow. */
export function useWorkflowEditor(
  initial: Workflow,
  onChange: (wf: Workflow) => void
) {
  const [workflow, setWorkflow] = useState<Workflow>(initial)

  const commit = useCallback(
    (wf: Workflow) => {
      const next = { ...wf, updatedAt: new Date().toISOString() }
      setWorkflow(next)
      onChange(next)
    },
    [onChange]
  )

  const getNodeType = useCallback(
    (type: string): NodeType | undefined =>
      NODE_TYPES.find(n => n.type === type),
    []
  )

  const view = useCanvasView()
  const drag = useNodeDrag({
    canvasRef: view.canvasRef,
    canvasOffset: view.canvasOffset,
    setCanvasOffset: view.setCanvasOffset,
    zoom: view.zoom,
    setIsPanning: view.setIsPanning,
    workflow,
    setWorkflow,
    onChange,
  })
  const drop = useCanvasDrop({
    canvasRef: view.canvasRef,
    canvasOffset: view.canvasOffset,
    zoom: view.zoom,
    workflow,
    getNodeType,
    commit,
  })
  const connections = useConnections({ workflow, commit })
  const nodeActions = useNodeActions({ workflow, commit })

  const setName = useCallback(
    (name: string) => {
      commit({ ...workflow, name })
    },
    [workflow, commit]
  )

  return {
    workflow,
    canvasRef: view.canvasRef,
    canvasOffset: view.canvasOffset,
    zoom: view.zoom,
    isPanning: view.isPanning,
    onWheel: view.onWheel,
    zoomIn: view.zoomIn,
    zoomOut: view.zoomOut,
    zoomReset: view.zoomReset,
    getNodeType,
    setName,
    ...drag,
    ...drop,
    ...connections,
    ...nodeActions,
  }
}
