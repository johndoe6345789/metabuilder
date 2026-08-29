/** The error panel for a failed execution. */

import React from 'react'
import styles from './ExecutionMonitor.module.css'

/**
 * ErrorDetails - Display error information
 */
export interface ErrorDetailsProps {
  error: {
    message: string
    code: string
    nodeId?: string
  }
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({ error }) => (
  <div className={styles.errorDetails}>
    <p>
      <strong>Error Code:</strong> {error.code}
    </p>
    <p>
      <strong>Message:</strong> {error.message}
    </p>
    {error.nodeId !== undefined && (
      <p>
        <strong>Node:</strong> {error.nodeId}
      </p>
    )}
  </div>
)
