'use client'

/** The metrics grid and the log viewer for one execution. */

export { LogViewer } from './execution-log-viewer'
import React from 'react'
import type { ExecutionMetrics } from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'

/**
 * MetricsGrid - Display execution metrics
 */
interface MetricsGridProps {
  metrics: ExecutionMetrics
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className={styles.metricsGrid}>
      <MetricCard label="Executed" value={metrics.nodesExecuted} />
      <MetricCard label="Successful" value={metrics.successNodes} />
      <MetricCard label="Failed" value={metrics.failedNodes} />
      <MetricCard label="Retried" value={metrics.retriedNodes} />
      <MetricCard label="Total Retries" value={metrics.totalRetries} />
      <MetricCard label="Peak Memory" value={`${metrics.peakMemory} MB`} />
      <MetricCard
        label="Validation Failures"
        value={metrics.validationFailures}
      />
      <MetricCard label="Recovery Attempts" value={metrics.recoveryAttempts} />
      <MetricCard
        label="Recovery Successes"
        value={metrics.recoverySuccesses}
      />
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => (
  <div className={styles.metricCard}>
    <span className={styles.metricLabel}>{label}</span>
    <span className={styles.metricValue}>{value}</span>
  </div>
)
