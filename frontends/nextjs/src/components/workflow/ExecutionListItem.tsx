/** One row in the execution history list. */

import React from 'react'
import type {
  ExecutionRecord,
} from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'

export /**
 * ExecutionListItem - Single execution in history list
 */
interface ExecutionListItemProps {
  execution: ExecutionRecord
  isSelected: boolean
  onClick: () => void
}

export const ExecutionListItem: React.FC<ExecutionListItemProps> = ({
  execution,
  isSelected,
  onClick,
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString()
  }

  return (
    <div
      className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.listItemHeader}>
        <span
          className={`${styles.status} ${styles[`status-${execution.status}`]}`}
        >
          {execution.status.toUpperCase()}
        </span>
        <span className={styles.time}>{formatTime(execution.startTime)}</span>
      </div>
      <div className={styles.listItemDetails}>
        <p>Duration: {execution.duration}ms</p>
        <p>Nodes: {execution.metrics.nodesExecuted}</p>
      </div>
    </div>
  )
}
