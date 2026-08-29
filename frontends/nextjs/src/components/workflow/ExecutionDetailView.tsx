'use client'

/** Everything shown for the execution currently selected. */

import type { ExecutionRecord } from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'
import { ExecutionHeader } from './execution-detail-panels'
import { NodeExecutionItem } from './execution-node-item'
import { MetricsGrid } from './execution-metrics'
import { LogViewer } from './execution-log-viewer'
import { ErrorDetails } from './execution-error-details'

export function ExecutionDetailView({
  execution,
  loading,
  expandedNodeId,
  onToggleNode,
}: {
  execution: ExecutionRecord
  loading: boolean
  expandedNodeId: string | null
  onToggleNode: (id: string | null) => void
}) {
  return (
      <div className={styles.executionDetails}>
        <ExecutionHeader execution={execution} loading={loading} />

        {/* Node Execution Timeline */}
        <div className={styles.section}>
          <h4>Node Execution Status</h4>
          <div className={styles.nodeTimeline}>
            {Object.entries(execution.state).map(
              ([nodeId, result]) => (
                <NodeExecutionItem
                  key={nodeId}
                  nodeId={nodeId}
                  result={result}
                  isExpanded={expandedNodeId === nodeId}
                  onToggle={() => {
                    onToggleNode(
                      expandedNodeId === nodeId ? null : nodeId
                    )
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className={styles.section}>
          <h4>Metrics</h4>
          <MetricsGrid metrics={execution.metrics} />
        </div>

        {/* Logs */}
        {execution.logs.length > 0 && (
          <div className={styles.section}>
            <h4>Execution Logs</h4>
            <LogViewer logs={execution.logs} />
          </div>
        )}

        {/* Error Details */}
        {execution.error !== undefined && (
          <div className={styles.section}>
            <h4>Error Details</h4>
            <ErrorDetails error={execution.error} />
          </div>
        )}
      </div>
  )
}
