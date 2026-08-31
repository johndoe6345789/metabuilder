'use client'

import { useCallback, useState } from 'react'
import type { Workflow } from '@/workflow-editor'

export interface UseNodeActionsArgs {
  workflow: Workflow
  commit: (wf: Workflow) => void
}

/** Which node is selected/open in the properties panel, and the node-level
 *  edits (config, name, delete) that operate on the current workflow. */
export function useNodeActions(args: UseNodeActionsArgs) {
  const { workflow, commit } = args
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [propertiesOpen, setPropertiesOpen] = useState(false)

  const selectNode = useCallback((id: string) => {
    setSelectedNodeId(id)
  }, [])
  const openProps = useCallback((id: string) => {
    setSelectedNodeId(id)
    setPropertiesOpen(true)
  }, [])

  const updateConfig = useCallback(
    (id: string, config: Record<string, unknown>) => {
      commit({
        ...workflow,
        nodes: workflow.nodes.map(n => (n.id === id ? { ...n, config } : n)),
      })
    },
    [workflow, commit]
  )

  const updateName = useCallback(
    (id: string, name: string) => {
      commit({
        ...workflow,
        nodes: workflow.nodes.map(n => (n.id === id ? { ...n, name } : n)),
      })
    },
    [workflow, commit]
  )

  const deleteNode = useCallback(
    (id: string) => {
      commit({
        ...workflow,
        nodes: workflow.nodes.filter(n => n.id !== id),
        connections: workflow.connections.filter(
          c => c.sourceNodeId !== id && c.targetNodeId !== id
        ),
      })
      setPropertiesOpen(false)
      setSelectedNodeId(null)
    },
    [workflow, commit]
  )

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId) ?? null

  return {
    selectedNodeId,
    selectedNode,
    propertiesOpen,
    setPropertiesOpen,
    selectNode,
    openProps,
    updateConfig,
    updateName,
    deleteNode,
  }
}
