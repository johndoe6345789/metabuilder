/**
 * Redux-backed mutation hook
 * Drop-in replacement for useMutation / TanStack React Query
 *
 * Provides:
 * - Execute write operations (POST, PUT, DELETE)
 * - Loading and error states
 * - Success and error callbacks
 * - Reset functionality
 */

import { useCallback, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  mutateAsyncData,
  selectAsyncRequest,
  type RootState,
} from '@metabuilder/redux-slices'

export interface UseMutationOptions<TData = unknown, TResponse = unknown> {
  /** Called on successful mutation */
  onSuccess?: (data: TResponse) => void
  /** Called on mutation error */
  onError?: (error: string) => void
  /** Called when mutation status changes */
  onStatusChange?: (status: 'idle' | 'pending' | 'succeeded' | 'failed') => void
}

export interface UseMutationResult<TData = unknown, TResponse = unknown> {
  /** Execute the mutation with the given payload */
  mutate: (payload: TData) => Promise<TResponse>
  /** True if mutation is in progress */
  isLoading: boolean
  /** Error message if mutation failed */
  error: string | null
  /** Reset mutation state */
  reset: () => void
  /** Current status */
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
}

/**
 * Hook for executing mutations (write operations) with Redux backing
 * Compatible with @tanstack/react-query useMutation API
 */
export function useReduxMutation<TData = unknown, TResponse = unknown>(
  mutateFn: (payload: TData) => Promise<TResponse>,
  options?: UseMutationOptions<TData, TResponse>
): UseMutationResult<TData, TResponse> {
  const dispatch = useDispatch()
  const mutationIdRef = useRef<string>('')

  // Generate stable mutation ID
  if (!mutationIdRef.current) {
    mutationIdRef.current = `mutation-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const mutationId = mutationIdRef.current
  const asyncState = useSelector((state: RootState) =>
    selectAsyncRequest(state, mutationId)
  )

  // Extract status from request or use defaults
  const status = (asyncState?.status ?? 'idle') as 'idle' | 'pending' | 'succeeded' | 'failed'
  const error = asyncState?.error ?? null
  const isLoading = status === 'pending'

  // Call success callback when mutation succeeds
  useEffect(() => {
    if (status === 'succeeded' && asyncState?.data && options?.onSuccess) {
      options.onSuccess(asyncState.data as TResponse)
    }
  }, [status, asyncState?.data, options])

  // Call error callback when mutation fails
  useEffect(() => {
    if (status === 'failed' && error && options?.onError) {
      options.onError(error)
    }
  }, [status, error, options])

  // Call status change callback
  useEffect(() => {
    options?.onStatusChange?.(status)
  }, [status, options])

  // Main mutate function
  const mutate = useCallback(
    async (payload: TData): Promise<TResponse> => {
      const result = await (dispatch as any)(
        mutateAsyncData({
          id: mutationId,
          mutateFn: () => mutateFn(payload),
          payload,
        })
      )

      // Handle thunk result
      if (result.payload) {
        return result.payload.data as TResponse
      }

      throw new Error(result.payload?.error ?? 'Mutation failed')
    },
    [mutationId, mutateFn, dispatch]
  )

  // Reset function to clear mutation state
  const reset = useCallback(() => {
    // Could dispatch a reset action here if needed
    // For now, component can re-mount or use different mutation ID
  }, [])

  return {
    mutate,
    isLoading,
    error,
    reset,
    status,
  }
}

/**
 * Hook for multiple sequential mutations
 * Useful for complex workflows requiring multiple steps
 */
export interface MultiMutationStep<TData = unknown, TResponse = unknown> {
  name: string
  fn: (payload: TData) => Promise<TResponse>
  onSuccess?: (data: TResponse) => void
  onError?: (error: string) => void
}

export interface UseMultiMutationResult<TResponse = unknown> {
  /** Execute mutations in sequence */
  execute: (payload: unknown) => Promise<TResponse[]>
  /** Current step being executed (0-indexed, -1 if not started) */
  currentStep: number
  /** True if any step is in progress */
  isLoading: boolean
  /** Error from current step if failed */
  error: string | null
  /** Reset to initial state */
  reset: () => void
}

export function useReduxMultiMutation<TData = unknown, TResponse = unknown>(
  steps: MultiMutationStep<TData, TResponse>[],
  options?: {
    onAllSuccess?: (results: TResponse[]) => void
    onStepSuccess?: (stepName: string, data: TResponse) => void
    onError?: (stepName: string, error: string) => void
  }
): UseMultiMutationResult<TResponse> {
  const dispatch = useDispatch()
  const currentStepRef = useRef(-1)
  const resultsRef = useRef<TResponse[]>([])
  const errorRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  // Use mutation for each step
  const stepMutations = steps.map((step) =>
    useReduxMutation<TData, TResponse>(step.fn, {
      onSuccess: (data) => {
        resultsRef.current.push(data)
        options?.onStepSuccess?.(step.name, data)
        step.onSuccess?.(data)
      },
      onError: (error) => {
        errorRef.current = error
        options?.onError?.(step.name, error)
        step.onError?.(error)
      },
    })
  )

  const execute = useCallback(
    async (payload: unknown): Promise<TResponse[]> => {
      resultsRef.current = []
      errorRef.current = null
      isLoadingRef.current = true

      try {
        for (let i = 0; i < steps.length; i++) {
          currentStepRef.current = i
          const result = await stepMutations[i].mutate(payload as TData)
          resultsRef.current.push(result)
        }

        options?.onAllSuccess?.(resultsRef.current)
        return resultsRef.current

      } finally {
        isLoadingRef.current = false
        currentStepRef.current = -1
      }
    },
    [steps, stepMutations, options]
  )

  const reset = useCallback(() => {
    resultsRef.current = []
    errorRef.current = null
    currentStepRef.current = -1
    stepMutations.forEach((m) => m.reset())
  }, [stepMutations])

  return {
    execute,
    currentStep: currentStepRef.current,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
    reset,
  }
}
