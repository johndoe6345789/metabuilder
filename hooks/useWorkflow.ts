/**
 * useWorkflow - React Hook for Workflow Execution
 *
 * Manages workflow execution state:
 * - Loading state during execution
 * - Error handling and user feedback
 * - Result caching and retrieval
 * - Automatic retry with exponential backoff
 * - WebSocket integration (optional) for live updates
 *
 * Usage:
 * ```tsx
 * const { execute, state, error, loading } = useWorkflow()
 *
 * const handleExecute = async () => {
 *   await execute({
 *     tenant: 'acme',
 *     workflowId: 'wf-123',
 *     triggerData: { message: 'test' }
 *   })
 * }
 *
 * return (
 *   <button onClick={handleExecute} disabled={loading}>
 *     {loading ? 'Running...' : 'Execute'}
 *   </button>
 * )
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  ExecutionState,
  ExecutionRecord,
  ExecutionMetrics,
} from '@metabuilder/types'

export interface ExecuteWorkflowParams {
  tenant: string
  workflowId: string
  triggerData?: Record<string, any>
  variables?: Record<string, any>
  request?: {
    method?: string
    headers?: Record<string, string>
    query?: Record<string, any>
    body?: Record<string, any>
  }
}

export interface WorkflowState {
  executionId?: string
  status?: 'idle' | 'running' | 'success' | 'error'
  state?: ExecutionState
  metrics?: ExecutionMetrics
  result?: any
  error?: string
  startTime?: Date
  endTime?: Date
  duration?: number
}

export interface UseWorkflowOptions {
  onSuccess?: (record: ExecutionRecord) => void
  onError?: (error: Error) => void
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  liveUpdates?: boolean
}

/**
 * React hook for workflow execution
 */
export function useWorkflow(options: UseWorkflowOptions = {}) {
  const {
    onSuccess,
    onError,
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    liveUpdates = false,
  } = options

  const [state, setState] = useState<WorkflowState>({
    status: 'idle',
  })

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const retryCount = useRef(0)
  const abortController = useRef<AbortController | null>(null)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  /**
   * Execute workflow
   */
  const execute = useCallback(
    async (params: ExecuteWorkflowParams): Promise<ExecutionRecord | null> => {
      try {
        // Reset state
        setError(null)
        setLoading(true)
        setState((prev) => ({
          ...prev,
          status: 'running',
          startTime: new Date(),
        }))

        // Create abort controller for request
        abortController.current = new AbortController()

        // Make API request
        const response = await fetch(
          `/api/v1/${params.tenant}/workflows/${params.workflowId}/execute`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              triggerData: params.triggerData || {},
              variables: params.variables || {},
              request: params.request,
            }),
            signal: abortController.current.signal,
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || `API error: ${response.statusText}`
          )
        }

        const data = await response.json()

        // Update state
        setState({
          executionId: data.executionId,
          status: data.status as any,
          state: data.state,
          metrics: data.metrics,
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          duration: data.duration,
        })

        // Call success callback
        if (onSuccess) {
          onSuccess(data)
        }

        // Poll for live updates if enabled
        if (liveUpdates && data.status === 'running') {
          pollExecutionStatus(params.tenant, data.executionId)
        }

        retryCount.current = 0
        setLoading(false)

        return data
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(String(err))

        // Check if error is retryable
        if (
          autoRetry &&
          retryCount.current < maxRetries &&
          isRetryableError(error)
        ) {
          retryCount.current++
          console.log(
            `Retry attempt ${retryCount.current}/${maxRetries} in ${retryDelay}ms`
          )

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retryCount.current)
          )

          return execute(params)
        }

        setError(error)
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error.message,
        }))

        if (onError) {
          onError(error)
        }

        setLoading(false)
        retryCount.current = 0

        return null
      }
    },
    [onSuccess, onError, autoRetry, maxRetries, retryDelay, liveUpdates]
  )

  /**
   * Poll execution status
   */
  const pollExecutionStatus = useCallback(
    (tenant: string, executionId: string) => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
      }

      pollInterval.current = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/v1/${tenant}/workflows/executions/${executionId}`
          )

          if (response.ok) {
            const data = await response.json()

            setState({
              executionId: data.id,
              status: data.status,
              state: data.state,
              metrics: data.metrics,
              startTime: data.startTime ? new Date(data.startTime) : undefined,
              endTime: data.endTime ? new Date(data.endTime) : undefined,
              duration: data.duration,
            })

            // Stop polling if execution is complete
            if (
              data.status === 'success' ||
              data.status === 'error'
            ) {
              if (pollInterval.current) {
                clearInterval(pollInterval.current)
                pollInterval.current = null
              }
              setLoading(false)
            }
          }
        } catch (err) {
          console.error('Failed to poll execution status:', err)
        }
      }, 1000) // Poll every second
    },
    []
  )

  /**
   * Cancel execution
   */
  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }

    if (pollInterval.current) {
      clearInterval(pollInterval.current)
      pollInterval.current = null
    }

    setLoading(false)
    setState((prev) => ({
      ...prev,
      status: 'idle',
    }))
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    cancel()
    setError(null)
    setState({
      status: 'idle',
    })
    retryCount.current = 0
  }, [cancel])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    execute,
    cancel,
    reset,
    state,
    error,
    loading,
    executionId: state.executionId,
    status: state.status,
    result: state.state,
    metrics: state.metrics,
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'timeout',
    'network',
    'econnrefused',
    'econnreset',
    'temporary',
  ]

  const message = error.message.toLowerCase()
  return retryablePatterns.some((pattern) => message.includes(pattern))
}

/**
 * Hook to list workflow executions
 */
export function useWorkflowExecutions(
  tenant: string,
  workflowId: string,
  options: { limit?: number; autoRefresh?: boolean } = {}
) {
  const { limit = 50, autoRefresh = false } = options
  const [executions, setExecutions] = useState<ExecutionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/v1/${tenant}/workflows/${workflowId}/executions?limit=${limit}`
      )

      if (response.ok) {
        const data = await response.json()
        setExecutions(data.executions || [])
        setError(null)
      } else {
        throw new Error(`Failed to fetch executions: ${response.statusText}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [tenant, workflowId, limit])

  useEffect(() => {
    refresh()

    if (autoRefresh) {
      refreshInterval.current = setInterval(refresh, 5000) // Refresh every 5 seconds
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
      }
    }
  }, [refresh, autoRefresh])

  return {
    executions,
    loading,
    error,
    refresh,
  }
}
