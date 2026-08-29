'use client'

/** What shows when nothing is selected, or the selection has no data. */

import styles from './ExecutionMonitor.module.css'

export function ExecutionEmptyStates({
  hasExecution,
  loading,
  selectedExecutionId,
}: {
  hasExecution: boolean
  loading: boolean
  selectedExecutionId: string | undefined
}) {
  return (
    <>

      {!hasExecution &&
        !loading &&
        selectedExecutionId !== undefined && (
          <div className={styles.noSelection}>
            <p>No execution data available</p>
          </div>
        )}

      {selectedExecutionId === undefined && (
        <div className={styles.noSelection}>
          <p>Select an execution to view details</p>
        </div>
      )}
    </>
  )
}
