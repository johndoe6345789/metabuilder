/**
 * ExecutionMonitor Component
 *
 * Real-time monitoring dashboard for workflow execution
 * Displays:
 * - Node execution progress (pending, running, success, error)
 * - Execution timeline and metrics
 * - Live logs and error traces
 * - Performance indicators (duration, memory, API calls)
 *
 * Features:
 * - Auto-refreshing execution state
 * - Color-coded status indicators
 * - Expandable error details
 * - Performance metrics visualization
 * - Historical execution list
 */

'use client'

import { ExecutionListPanel } from './ExecutionListPanel'
import { ExecutionEmptyStates } from './ExecutionEmptyStates'
import { useExecutionDetail } from './use-execution-detail'
import { ExecutionDetailView } from './ExecutionDetailView'
import React, { useState } from 'react'
import { useWorkflowExecutions } from '@metabuilder/hooks'
import styles from './ExecutionMonitor.module.css'

export interface ExecutionMonitorProps {
  tenant: string
  workflowId: string
  executionId?: string
  onExecutionSelect?: (executionId: string) => void
}

/**
 * ExecutionMonitor Component
 */
export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  tenant,
  workflowId,
  executionId: initialExecutionId,
  onExecutionSelect,
}) => {
  const [selectedExecutionId, setSelectedExecutionId] =
    useState(initialExecutionId)
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
  const { currentExecution, loading } = useExecutionDetail(
    tenant,
    selectedExecutionId
  )

  const {
    executions,
    refresh,
    error: listError,
  } = useWorkflowExecutions(tenant, workflowId, {
    limit: 20,
    autoRefresh: true,
  })


  const handleExecutionSelect = (id: string) => {
    setSelectedExecutionId(id)
    setExpandedNodeId(null)
    if (onExecutionSelect !== undefined) {
      onExecutionSelect(id)
    }
  }

  return (
    <div className={styles.container}>
      <ExecutionListPanel
        executions={executions}
        selectedExecutionId={selectedExecutionId}
        listError={listError}
        loading={loading}
        onSelect={handleExecutionSelect}
        onRefresh={() => {
          void refresh()
        }}
      />

      {currentExecution !== null && (
        <ExecutionDetailView
          execution={currentExecution}
          loading={loading}
          expandedNodeId={expandedNodeId}
          onToggleNode={setExpandedNodeId}
        />
      )}
      <ExecutionEmptyStates
        hasExecution={currentExecution !== null}
        loading={loading}
        selectedExecutionId={selectedExecutionId}
      />
    </div>
  )
}















export default ExecutionMonitor
