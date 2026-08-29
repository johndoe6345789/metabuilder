'use client'

/** The execution history list, with its refresh control. */

import type { ExecutionRecord } from '@metabuilder/workflow'
import styles from './ExecutionMonitor.module.css'
import { ExecutionListItem } from './ExecutionListItem'

export function ExecutionListPanel({
  executions,
  selectedExecutionId,
  listError,
  loading,
  onSelect,
  onRefresh,
}: {
  executions: ExecutionRecord[]
  selectedExecutionId: string | undefined
  listError: Error | null
  loading: boolean
  onSelect: (id: string) => void
  onRefresh: () => void
}) {
  return (
    <div className={styles.executionList}>
      <div className={styles.listHeader}>
        <h3>Execution History</h3>
        <button
          className={styles.refreshButton}
          onClick={() => {
            onRefresh()
          }}
          disabled={loading}
        >
          ⟳ Refresh
        </button>
      </div>

      {listError != null && (
        <div className={styles.error}>
          <p>Error loading executions: {listError.message}</p>
        </div>
      )}

      <div className={styles.listItems}>
        {executions.map(execution => (
          <ExecutionListItem
            key={execution.id}
            execution={execution}
            isSelected={selectedExecutionId === execution.id}
            onClick={() => {
              onSelect(execution.id)
            }}
          />
        ))}

        {executions.length === 0 && listError == null && (
          <p className={styles.noResults}>No executions yet</p>
        )}
      </div>
    </div>
  )
}
