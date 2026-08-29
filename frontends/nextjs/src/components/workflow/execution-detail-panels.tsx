/** The panels making up one execution's detail view. */

export { ErrorDetails } from './execution-error-details'
export { NodeExecutionItem } from './execution-node-item'
import React from 'react'
import type {
  ExecutionRecord,
} from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'

/**
 * ExecutionHeader - Header with status and overall metrics
 */
interface ExecutionHeaderProps {
  execution: ExecutionRecord
  loading: boolean
}

export const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({
  execution,
  loading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#22c55e'
      case 'error':
        return '#ef4444'
      case 'running':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerStatus}>
        <div
          className={styles.statusIndicator}
          style={{ backgroundColor: getStatusColor(execution.status) }}
        />
        <div>
          <h3>
            {execution.status === 'running' ? 'Executing...' : execution.status}
          </h3>
          <p>ID: {execution.id}</p>
        </div>
      </div>

      <div className={styles.headerMetrics}>
        <div className={styles.metric}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{execution.duration}ms</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Nodes</span>
          <span className={styles.value}>
            {execution.metrics.nodesExecuted}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Success</span>
          <span className={styles.value}>{execution.metrics.successNodes}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Failed</span>
          <span className={styles.value}>{execution.metrics.failedNodes}</span>
        </div>
      </div>

      {loading && <div className={styles.spinner} />}
    </div>
  )
}
