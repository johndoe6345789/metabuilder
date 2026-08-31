'use client'

import { useCallback, useState } from 'react'
import {
  generateConnectionId,
  type Connection,
  type Position,
  type Workflow,
} from '@/workflow-editor'
import type { DrawingConnection } from './types'

export interface UseConnectionsArgs {
  workflow: Workflow
  commit: (wf: Workflow) => void
}

/** In-progress connection drawing: click an output, drag, click an input. */
export function useConnections(args: UseConnectionsArgs) {
  const { workflow, commit } = args
  const [drawing, setDrawing] = useState<DrawingConnection | null>(null)

  const onConnectionStart = useCallback(
    (nodeId: string, output: string, position: Position) => {
      setDrawing({ sourceNodeId: nodeId, sourceOutput: output, position })
    },
    []
  )

  const onConnectionEnd = useCallback(
    (nodeId: string, input: string) => {
      setDrawing(d => {
        if (d != null && d.sourceNodeId !== nodeId) {
          const conn: Connection = {
            id: generateConnectionId(),
            sourceNodeId: d.sourceNodeId,
            sourceOutput: d.sourceOutput,
            targetNodeId: nodeId,
            targetInput: input,
          }
          commit({
            ...workflow,
            connections: [...workflow.connections, conn],
          })
        }
        return null
      })
    },
    [workflow, commit]
  )

  return { drawing, onConnectionStart, onConnectionEnd }
}
