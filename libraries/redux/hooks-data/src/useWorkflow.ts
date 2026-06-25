/**
 * useWorkflow Hook (Tier 2)
 * Manages workflow state and operations with service adapter injection
 *
 * Features:
 * - Load and create workflows
 * - Manage workflow structure (nodes and connections)
 * - Validate workflows with service adapter
 * - Calculate workflow metrics
 * - Auto-save with debouncing
 * - Redux integration for state management
 */

import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  removeConnection,
  setSaving,
  setDirty,
  selectCurrentWorkflow,
  selectWorkflowNodes,
  selectWorkflowConnections,
  selectWorkflowIsDirty,
  selectWorkflowIsSaving,
} from '@metabuilder/redux-slices'
import type { Workflow, WorkflowNode, WorkflowConnection } from '@metabuilder/types'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

/**
 * useWorkflow Hook
 * Manages workflow operations and editing with service adapter injection
 *
 * @example
 * const { workflow, nodes, connections, validate, getMetrics } = useWorkflow();
 * const validation = await validate();
 * const metrics = await getMetrics();
 */
export function useWorkflow() {
  const dispatch = useDispatch<AppDispatch>()
  const { workflowService } = useServices()
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Selectors
  const workflow = useSelector((state: RootState) => selectCurrentWorkflow(state))
  const nodes = useSelector((state: RootState) => selectWorkflowNodes(state))
  const connections = useSelector((state: RootState) => selectWorkflowConnections(state))
  const isDirty = useSelector((state: RootState) => selectWorkflowIsDirty(state))
  const isSaving = useSelector((state: RootState) => selectWorkflowIsSaving(state))

  /**
   * Auto-save workflow with debouncing
   */
  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (workflow && isDirty && !isSaving) {
        dispatch(setSaving(true))
      }
    }, 2000) // 2 second debounce
  }, [workflow, isDirty, isSaving, dispatch])

  /**
   * Manually trigger save
   */
  const save = useCallback(async () => {
    if (workflow && isDirty) {
      dispatch(setSaving(true))
    }
  }, [workflow, isDirty, dispatch])

  /**
   * Add node to workflow
   */
  const addNodeToWorkflow = useCallback(
    (node: WorkflowNode) => {
      dispatch(addNode(node))
      autoSave()
    },
    [dispatch, autoSave]
  )

  /**
   * Update node parameters
   */
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode>) => {
      dispatch(updateNode({ id: nodeId, data }))
      autoSave()
    },
    [dispatch, autoSave]
  )

  /**
   * Remove node from workflow
   */
  const removeNodeFromWorkflow = useCallback(
    (nodeId: string) => {
      dispatch(deleteNode(nodeId))
      autoSave()
    },
    [dispatch, autoSave]
  )

  /**
   * Add connection between nodes
   */
  const addConnectionToWorkflow = useCallback(
    (connection: WorkflowConnection) => {
      dispatch(addConnection(connection))
      autoSave()
    },
    [dispatch, autoSave]
  )

  /**
   * Remove connection between nodes
   */
  const removeConnectionFromWorkflow = useCallback(
    (source: string, target: string) => {
      dispatch(removeConnection({ source, target }))
      autoSave()
    },
    [dispatch, autoSave]
  )

  /**
   * Validate workflow using service adapter
   */
  const validate = useCallback(async () => {
    if (!workflow) {
      throw new Error('No workflow loaded')
    }

    return workflowService.validateWorkflow(workflow.id, {
      ...workflow,
      nodes,
      connections,
    })
  }, [workflow, nodes, connections, workflowService])

  /**
   * Get workflow metrics using service adapter
   */
  const getMetrics = useCallback(async () => {
    if (!workflow) {
      throw new Error('No workflow loaded')
    }

    return workflowService.getWorkflowMetrics({
      ...workflow,
      nodes,
      connections,
    })
  }, [workflow, nodes, connections, workflowService])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    workflow,
    nodes,
    connections,
    isDirty,
    isSaving,

    // Actions
    save,
    autoSave,
    addNode: addNodeToWorkflow,
    updateNode: updateNodeData,
    removeNode: removeNodeFromWorkflow,
    addConnection: addConnectionToWorkflow,
    removeConnection: removeConnectionFromWorkflow,
    validate,
    getMetrics,
  }
}

export default useWorkflow
