'use client'

/** Loads the full record for whichever execution is selected. */

import { useEffect, useState } from 'react'
import type { ExecutionRecord } from '@metabuilder/workflow'

export function useExecutionDetail(
  tenant: string,
  selectedExecutionId: string | undefined
) {
  const [currentExecution, setCurrentExecution] =
    useState<ExecutionRecord | null>(null)
  const [loading, setLoading] = useState(false)

  // Load selected execution details
  useEffect(() => {
    const loadExecution = async () => {
      if (selectedExecutionId === undefined) return

      setLoading(true)
      try {
        const response = await fetch(
          `/api/v1/${tenant}/workflows/executions/${selectedExecutionId}`
        )
        if (response.ok) {
          const data = (await response.json()) as ExecutionRecord
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

  return { currentExecution, loading }
}
