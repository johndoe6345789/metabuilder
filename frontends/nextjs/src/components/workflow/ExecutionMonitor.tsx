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

import React, { useState, useEffect } from 'react'
import type {
  ExecutionRecord,
  NodeResult,
  LogEntry,
} from '@metabuilder/workflow'
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
  const [selectedExecutionId, setSelectedExecutionId] = useState(
    initialExecutionId
  )
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
  const [currentExecution, setCurrentExecution] = useState<ExecutionRecord | null>(
    null
  )
  const [loading, setLoading] = useState(false)

  const { executions, refresh, error: listError } = useWorkflowExecutions(
    tenant,
    workflowId,
    {
      limit: 20,
      autoRefresh: true,
    }
  )

  // Load selected execution details
  useEffect(() => {
    const loadExecution = async () => {
      if (!selectedExecutionId) return

      setLoading(true)
      try {
        const response = await fetch(
          `/api/v1/${tenant}/workflows/executions/${selectedExecutionId}`
        )
        if (response.ok) {
          const data = await response.json()
          setCurrentExecution(data)
        }
      } catch (err) {
        console.error('Failed to load execution:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadExecution()
  }, [selectedExecutionId, tenant])

  const handleExecutionSelect = (id: string) => {
    setSelectedExecutionId(id)
    setExpandedNodeId(null)
    if (onExecutionSelect) {
      onExecutionSelect(id)
    }
  }

  return (
    <div className={styles.container}>
      {/* Execution List */}
      <div className={styles.executionList}>
        <div className={styles.listHeader}>
          <h3>Execution History</h3>
          <button
            className={styles.refreshButton}
            onClick={() => { void refresh() }}
            disabled={loading}
          >
            ⟳ Refresh
          </button>
        </div>

        {listError && (
          <div className={styles.error}>
            <p>Error loading executions: {listError.message}</p>
          </div>
        )}

        <div className={styles.listItems}>
          {executions.map((execution) => (
            <ExecutionListItem
              key={execution.id}
              execution={execution}
              isSelected={selectedExecutionId === execution.id}
              onClick={() => handleExecutionSelect(execution.id)}
            />
          ))}

          {executions.length === 0 && !listError && (
            <p className={styles.noResults}>No executions yet</p>
          )}
        </div>
      </div>

      {/* Execution Details */}
      {currentExecution && (
        <div className={styles.executionDetails}>
          <ExecutionHeader execution={currentExecution} loading={loading} />

          {/* Node Execution Timeline */}
          <div className={styles.section}>
            <h4>Node Execution Status</h4>
            <div className={styles.nodeTimeline}>
              {Object.entries(currentExecution.state).map(([nodeId, result]) => (
                <NodeExecutionItem
                  key={nodeId}
                  nodeId={nodeId}
                  result={result}
                  isExpanded={expandedNodeId === nodeId}
                  onToggle={() =>
                    setExpandedNodeId(
                      expandedNodeId === nodeId ? null : nodeId
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className={styles.section}>
            <h4>Metrics</h4>
            <MetricsGrid metrics={currentExecution.metrics} />
          </div>

          {/* Logs */}
          {currentExecution.logs && currentExecution.logs.length > 0 && (
            <div className={styles.section}>
              <h4>Execution Logs</h4>
              <LogViewer logs={currentExecution.logs} />
            </div>
          )}

          {/* Error Details */}
          {currentExecution.error && (
            <div className={styles.section}>
              <h4>Error Details</h4>
              <ErrorDetails error={currentExecution.error} />
            </div>
          )}
        </div>
      )}

      {!currentExecution && !loading && selectedExecutionId && (
        <div className={styles.noSelection}>
          <p>No execution data available</p>
        </div>
      )}

      {!selectedExecutionId && (
        <div className={styles.noSelection}>
          <p>Select an execution to view details</p>
        </div>
      )}
    </div>
  )
}

/**
 * ExecutionListItem - Single execution in history list
 */
interface ExecutionListItemProps {
  execution: ExecutionRecord
  isSelected: boolean
  onClick: () => void
}

const ExecutionListItem: React.FC<ExecutionListItemProps> = ({
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
        <span className={`${styles.status} ${styles[`status-${execution.status}`]}`}>
          {execution.status.toUpperCase()}
        </span>
        <span className={styles.time}>
          {formatTime(execution.startTime)}
        </span>
      </div>
      <div className={styles.listItemDetails}>
        <p>Duration: {execution.duration}ms</p>
        <p>Nodes: {execution.metrics.nodesExecuted}</p>
      </div>
    </div>
  )
}

/**
 * ExecutionHeader - Header with status and overall metrics
 */
interface ExecutionHeaderProps {
  execution: ExecutionRecord
  loading: boolean
}

const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({
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
          <h3>{execution.status === 'running' ? 'Executing...' : execution.status}</h3>
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
          <span className={styles.value}>{execution.metrics.nodesExecuted}</span>
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

/**
 * NodeExecutionItem - Individual node execution status
 */
interface NodeExecutionItemProps {
  nodeId: string
  result: NodeResult
  isExpanded: boolean
  onToggle: () => void
}

const NodeExecutionItem: React.FC<NodeExecutionItemProps> = ({
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
        <span className={styles.nodeItemToggle}>
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className={styles.nodeId}>{nodeId}</span>
        <span className={styles.status}>{result.status}</span>
        <span className={styles.duration}>{getDurationMs()}ms</span>
        {result.retries && result.retries > 0 && (
          <span className={styles.retries}>
            Retries: {result.retries}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className={styles.nodeItemDetails}>
          {result.output && (
            <div className={styles.output}>
              <h5>Output</h5>
              <pre>{JSON.stringify(result.output, null, 2)}</pre>
            </div>
          )}

          {result.error && (
            <div className={styles.errorDetail}>
              <h5>Error</h5>
              <p>{result.error}</p>
              {result.errorCode && <code>{result.errorCode}</code>}
            </div>
          )}

          {result.inputData && (
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

/**
 * MetricsGrid - Display execution metrics
 */
interface MetricsGridProps {
  metrics: any
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className={styles.metricsGrid}>
      <MetricCard label="Executed" value={metrics.nodesExecuted} />
      <MetricCard label="Successful" value={metrics.successNodes} />
      <MetricCard label="Failed" value={metrics.failedNodes} />
      <MetricCard label="Retried" value={metrics.retriedNodes} />
      <MetricCard label="Total Retries" value={metrics.totalRetries} />
      <MetricCard label="Peak Memory" value={`${metrics.peakMemory} MB`} />
      <MetricCard label="Data Processed" value={`${metrics.dataProcessed} KB`} />
      <MetricCard label="API Calls" value={metrics.apiCallsMade} />
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => (
  <div className={styles.metricCard}>
    <span className={styles.metricLabel}>{label}</span>
    <span className={styles.metricValue}>{value}</span>
  </div>
)

/**
 * LogViewer - Display execution logs
 */
interface LogViewerProps {
  logs: LogEntry[]
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')

  const filteredLogs = logs.filter(
    (log) => filter === 'all' || log.level === filter
  )

  return (
    <div className={styles.logViewer}>
      <div className={styles.logFilter}>
        {(['all', 'error', 'warn', 'info'] as const).map((level) => (
          <button
            key={level}
            className={`${styles.filterButton} ${filter === level ? styles.active : ''}`}
            onClick={() => setFilter(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className={styles.logEntries}>
        {filteredLogs.map((log, index) => (
          <div key={index} className={`${styles.logEntry} ${styles[`level-${log.level}`]}`}>
            <span className={styles.timestamp}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={styles.level}>[{log.level.toUpperCase()}]</span>
            {log.nodeId && (
              <span className={styles.nodeRef}>{log.nodeId}</span>
            )}
            <span className={styles.message}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ErrorDetails - Display error information
 */
interface ErrorDetailsProps {
  error: {
    message: string
    code: string
    nodeId?: string
  }
}

const ErrorDetails: React.FC<ErrorDetailsProps> = ({ error }) => (
  <div className={styles.errorDetails}>
    <p>
      <strong>Error Code:</strong> {error.code}
    </p>
    <p>
      <strong>Message:</strong> {error.message}
    </p>
    {error.nodeId && (
      <p>
        <strong>Node:</strong> {error.nodeId}
      </p>
    )}
  </div>
)

export default ExecutionMonitor
