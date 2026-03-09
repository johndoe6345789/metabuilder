/**
 * useUIState — typed hook for generic UI state backed by uiStateSlice
 *
 * Use this for ephemeral or page-level state that needs Redux persistence
 * but doesn't warrant a dedicated slice (e.g., layout preferences,
 * page configs, demo data, search history).
 *
 * For domain entities (files, models, components, workflows, etc.),
 * use the dedicated slice hooks instead.
 */
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUIState, deleteUIState } from '@/store/slices/uiStateSlice'

export function useUIState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const dispatch = useAppDispatch()
  const stored = useAppSelector((state) => state.uiState.data[key])
  const value = (stored !== undefined ? stored : defaultValue) as T

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      const current = (stored !== undefined ? stored : defaultValue) as T
      const next = (newValue as (prev: T) => T)(current)
      dispatch(setUIState({ key, value: next }))
    } else {
      dispatch(setUIState({ key, value: newValue }))
    }
  }, [dispatch, key, stored, defaultValue])

  const deleteValue = useCallback(() => {
    dispatch(deleteUIState(key))
  }, [dispatch, key])

  return [value, setValue, deleteValue]
}
