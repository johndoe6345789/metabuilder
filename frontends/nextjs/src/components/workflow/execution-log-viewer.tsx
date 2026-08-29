'use client'

/** The filterable log list for one execution. */

import React, { useState } from 'react'
import type { LogEntry } from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'


/**
 * LogViewer - Display execution logs
 */
interface LogViewerProps {
  logs: LogEntry[]
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')

  const filteredLogs = logs.filter(
    log => filter === 'all' || log.level === filter
  )

  return (
    <div className={styles.logViewer}>
      <div className={styles.logFilter}>
        {(['all', 'error', 'warn', 'info'] as const).map(level => (
          <button
            key={level}
            className={`${styles.filterButton} ${filter === level ? styles.active : ''}`}
            onClick={() => {
              setFilter(level)
            }}
          >
            {level}
          </button>
        ))}
      </div>

      <div className={styles.logEntries}>
        {filteredLogs.map((log, index) => (
          <div
            key={index}
            className={`${styles.logEntry} ${styles[`level-${log.level}`]}`}
          >
            <span className={styles.timestamp}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={styles.level}>[{log.level.toUpperCase()}]</span>
            {log.nodeId !== undefined && (
              <span className={styles.nodeRef}>{log.nodeId}</span>
            )}
            <span className={styles.message}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
