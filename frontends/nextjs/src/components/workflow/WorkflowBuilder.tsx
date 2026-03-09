/**
 * WorkflowBuilder Component
 *
 * Interactive DAG canvas for building and editing workflows
 * Displays workflow nodes as a visual graph with connections
 * Allows parameter configuration and execution
 *
 * Features:
 * - Render DAG nodes as draggable components
 * - Show connections between nodes
 * - Edit node parameters in sidebar
 * - Execute workflow with visual feedback
 * - Real-time execution status updates
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import type { WorkflowDefinition, WorkflowNode } from '@metabuilder/workflow'
import { useWorkflow } from '@metabuilder/hooks'
import styles from './WorkflowBuilder.module.css'

export interface WorkflowBuilderProps {
  workflow: WorkflowDefinition
  tenant: string
  readOnly?: boolean
  onExecute?: (result: any) => void
  onError?: (error: Error) => void
}

export interface NodeUIState {
  nodeId: string
  isSelected: boolean
  isExecuting?: boolean
  status?: 'pending' | 'running' | 'success' | 'error'
}

/**
 * WorkflowBuilder Component
 */
export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  tenant,
  readOnly = false,
  onExecute,
  onError,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nodeUIStates, setNodeUIStates] = useState<Map<string, NodeUIState>>(
    new Map()
  )
  const [triggerData, setTriggerData] = useState<Record<string, any>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { execute, loading, state, error } = useWorkflow({
    onSuccess: (record) => {
      // Update node UI states based on execution results
      const newStates = new Map(nodeUIStates)
      Object.entries(record.state).forEach(([nodeId, result]) => {
        newStates.set(nodeId, {
          nodeId,
          isSelected: selectedNodeId === nodeId,
          status:
            result.status === 'success'
              ? 'success'
              : result.status === 'error'
                ? 'error'
                : 'pending',
        })
      })
      setNodeUIStates(newStates)

      if (onExecute) {
        onExecute(record)
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err)
      }
    },
  })

  const selectedNode = useMemo(
    () => workflow.nodes.find((n) => n.id === selectedNodeId),
    [workflow.nodes, selectedNodeId]
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId)
    },
    []
  )

  const handleExecute = useCallback(async () => {
    await execute({
      tenant,
      workflowId: workflow.id,
      triggerData,
    })
  }, [execute, tenant, workflow.id, triggerData])

  const handleTriggerDataChange = useCallback(
    (key: string, value: any) => {
      setTriggerData((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const handleNodeParameterChange = useCallback(
    (nodeId: string, paramKey: string, value: any) => {
      // This would update the workflow definition
      // Implementation depends on workflow editing capability
      console.log(`Update node ${nodeId} parameter ${paramKey} = ${value}`)
    },
    []
  )

  return (
    <div className={styles.container}>
      {/* Canvas Area */}
      <div className={styles.canvas}>
        <svg
          className={styles.svg}
          width="100%"
          height="100%"
          viewBox="0 0 1000 600"
        >
          {/* Render connections */}
          <g className={styles.connections}>
            {renderConnections(workflow)}
          </g>

          {/* Render nodes */}
          <g className={styles.nodes}>
            {workflow.nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                uiState={nodeUIStates.get(node.id)}
                onClick={() => handleNodeClick(node.id)}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Workflow Builder</h2>
          <p className={styles.workflowName}>{workflow.name}</p>
        </div>

        {/* Trigger Data Section */}
        <div className={styles.section}>
          <h3>Trigger Data</h3>
          <div className={styles.triggerInputs}>
            {Object.entries(workflow.variables).map(([name, variable]) => (
              <div key={name} className={styles.inputField}>
                <label>{variable.name}</label>
                <input
                  type="text"
                  placeholder={variable.description || name}
                  value={triggerData[name] || ''}
                  onChange={(e) =>
                    handleTriggerDataChange(name, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className={styles.section}>
            <h3>Node: {selectedNode.name}</h3>
            <div className={styles.nodeDetails}>
              <p className={styles.nodeType}>
                Type: <code>{selectedNode.nodeType}</code>
              </p>
              {selectedNode.description && (
                <p className={styles.nodeDescription}>
                  {selectedNode.description}
                </p>
              )}

              {/* Node Parameters */}
              {Object.keys(selectedNode.parameters).length > 0 && (
                <div className={styles.parameters}>
                  <h4>Parameters</h4>
                  {Object.entries(selectedNode.parameters).map(
                    ([key, value]) => (
                      <div key={key} className={styles.paramField}>
                        <label>{key}</label>
                        <input
                          type="text"
                          value={JSON.stringify(value)}
                          onChange={(e) =>
                            handleNodeParameterChange(selectedNode.id, key, e.target.value)
                          }
                          disabled={readOnly}
                        />
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Execution Result */}
              {state.state?.[selectedNode.id] && (
                <div className={styles.result}>
                  <h4>Execution Result</h4>
                  <pre>
                    {JSON.stringify(state.state[selectedNode.id], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Execution Controls */}
        <div className={styles.section}>
          <button
            className={styles.executeButton}
            onClick={() => { void handleExecute() }}
            disabled={loading || readOnly}
          >
            {loading ? 'Executing...' : 'Execute Workflow'}
          </button>

          {error && (
            <div className={styles.error}>
              <p>Error: {error.message}</p>
            </div>
          )}

          {state.status === 'success' && (
            <div className={styles.success}>
              <p>✓ Execution successful</p>
              {state.metrics && (
                <div className={styles.metrics}>
                  <p>
                    Duration: {state.duration}ms |
                    Nodes: {state.metrics.nodesExecuted}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className={styles.section}>
          <button
            className={styles.advancedToggle}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>

          {showAdvanced && (
            <div className={styles.advanced}>
              <label>
                <input
                  type="checkbox"
                  defaultChecked={workflow.settings.debugMode}
                />
                Debug Mode
              </label>
              <label>
                Max Concurrent: {workflow.settings.maxConcurrentExecutions}
              </label>
              <label>
                Timeout: {workflow.settings.executionTimeout}ms
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * NodeComponent - Individual workflow node
 */
interface NodeComponentProps {
  node: WorkflowNode
  isSelected: boolean
  uiState?: NodeUIState
  onClick: () => void
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  uiState,
  onClick,
}) => {
  const [x, y] = node.position
  const [width, height] = node.size || [120, 60]

  const statusClass = uiState?.status ? styles[`status-${uiState.status}`] : ''

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        className={`${styles.node} ${isSelected ? styles.selected : ''} ${statusClass}`}
        onClick={onClick}
        rx="4"
      />
      <text x={x + width / 2} y={y + height / 2} className={styles.nodeLabel}>
        {node.name}
      </text>
      {uiState?.status && (
        <circle
          cx={x + width - 10}
          cy={y + 10}
          r="6"
          className={styles[`indicator-${uiState.status}`]}
        />
      )}
    </g>
  )
}

/**
 * Render workflow connections as SVG paths
 */
function renderConnections(workflow: WorkflowDefinition) {
  const paths: React.ReactNode[] = []

  Object.entries(workflow.connections).forEach(([fromNodeId, portMap]) => {
    const fromNode = workflow.nodes.find((n) => n.id === fromNodeId)
    if (!fromNode) return

    Object.entries(portMap).forEach(([_portName, indexMap]) => {
      Object.entries(indexMap).forEach(([_, targets]) => {
        (targets as any[]).forEach((target) => {
          const toNode = workflow.nodes.find((n) => n.id === target.node)
          if (!toNode) return

          const [x1, y1] = fromNode.position
          const [x2, y2] = toNode.position
          const [w1, h1] = fromNode.size || [120, 60]
          const [_w2, h2] = toNode.size || [120, 60]

          const startX = x1 + w1
          const startY = y1 + h1 / 2
          const endX = x2
          const endY = y2 + h2 / 2

          paths.push(
            <line
              key={`${fromNodeId}-${target.node}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              className={styles.connection}
              strokeDasharray={target.conditional ? '5,5' : undefined}
            />
          )
        })
      })
    })
  })

  return paths
}

export default WorkflowBuilder
