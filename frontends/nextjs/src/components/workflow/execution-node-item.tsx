'use client'

/** One node's row inside an execution timeline. */

import React from 'react'
import type {
  NodeResult,
} from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'


/**
 * NodeExecutionItem - Individual node execution status
 */
interface NodeExecutionItemProps {
  nodeId: string
  result: NodeResult
  isExpanded: boolean
  onToggle: () => void
}

export const NodeExecutionItem: React.FC<NodeExecutionItemProps> = ({
  nodeId,
  result,
  isExpanded,
  onToggle,
}) => {
  const getDurationMs = () => {
    return result.duration ?? 0
  }

  return (
    <div className={styles.nodeItem}>
      <div
        className={`${styles.nodeItemHeader} ${styles[`status-${result.status}`]}`}
        onClick={onToggle}
      >
        <span className={styles.nodeItemToggle}>{isExpanded ? '▼' : '▶'}</span>
        <span className={styles.nodeId}>{nodeId}</span>
        <span className={styles.status}>{result.status}</span>
        <span className={styles.duration}>{getDurationMs()}ms</span>
        {result.retries !== undefined && result.retries > 0 && (
          <span className={styles.retries}>Retries: {result.retries}</span>
        )}
      </div>

      {isExpanded && (
        <div className={styles.nodeItemDetails}>
          {result.output !== undefined && (
            <div className={styles.output}>
              <h5>Output</h5>
              <pre>{JSON.stringify(result.output, null, 2)}</pre>
            </div>
          )}

          {result.error !== undefined && (
            <div className={styles.errorDetail}>
              <h5>Error</h5>
              <p>{result.error}</p>
              {result.errorCode !== undefined && (
                <code>{result.errorCode}</code>
              )}
            </div>
          )}

          {result.inputData !== undefined && (
            <div className={styles.inputData}>
              <h5>Input</h5>
              <pre>{JSON.stringify(result.inputData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
