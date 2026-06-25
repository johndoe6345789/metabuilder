/**
 * useStateWithHistory Hook
 * State management with full undo/redo history tracking
 *
 * Features:
 * - Track complete value history
 * - Undo and redo operations with boundary checks
 * - Query undo/redo availability
 * - Access full history array
 * - Efficient history management with configurable max size
 * - Type-safe generic typing for any value
 *
 * @example
 * const { value, setValue, undo, redo, canUndo, canRedo, history } = useStateWithHistory('initial')
 *
 * <div>
 *   <p>Current: {value}</p>
 *   <p>History: {history.length} states</p>
 *   <Button onClick={() => setValue('new value')}>Update</Button>
 *   <Button onClick={undo} disabled={!canUndo}>Undo</Button>
 *   <Button onClick={redo} disabled={!canRedo}>Redo</Button>
 * </div>
 *
 * @example
 * // With objects - form history
 * const initialForm = { name: '', email: '', age: 0 }
 * const { value: form, setValue: setForm, undo, canUndo } = useStateWithHistory(initialForm)
 *
 * <form>
 *   <input
 *     value={form.name}
 *     onChange={(e) => setForm({ ...form, name: e.target.value })}
 *   />
 *   <button type="button" onClick={undo} disabled={!canUndo}>
 *     Undo Changes
 *   </button>
 * </form>
 *
 * @example
 * // With canvas drawing history
 * const { value: drawingState, setValue, undo, redo } = useStateWithHistory(
 *   initialDrawing,
 *   { maxHistory: 50 }
 * )
 */

import { useState, useCallback } from 'react'

export interface UseStateWithHistoryOptions {
  /** Maximum history size (default: 100) */
  maxHistory?: number
}

export interface UseStateWithHistoryReturn<T> {
  /** Current value */
  value: T
  /** Set new value and add to history */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Undo to previous state */
  undo: () => void
  /** Redo to next state */
  redo: () => void
  /** Check if undo is available */
  canUndo: boolean
  /** Check if redo is available */
  canRedo: boolean
  /** Full history array (current and all previous states) */
  history: T[]
}

/**
 * Hook for managing state with undo/redo capability
 * @template T - The type of the state value
 * @param initialValue - Initial state value
 * @param options - Configuration options
 * @returns Object containing state and history operations
 */
export function useStateWithHistory<T>(
  initialValue: T,
  options: UseStateWithHistoryOptions = {}
): UseStateWithHistoryReturn<T> {
  const { maxHistory = 100 } = options

  // History is array of all states, currentIndex points to current state
  const [history, setHistory] = useState<T[]>([initialValue])
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const value = history[currentIndex]

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const valueToStore = newValue instanceof Function ? newValue(prevHistory[currentIndex]) : newValue

      // If we're not at the end, remove "future" history
      const newHistory = prevHistory.slice(0, currentIndex + 1)

      // Add new state
      newHistory.push(valueToStore)

      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift()
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      } else {
        setCurrentIndex(newHistory.length - 1)
      }

      return newHistory
    })
  }, [currentIndex, maxHistory])

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const redo = useCallback(() => {
    setHistory((prevHistory) => {
      const nextIndex = Math.min(currentIndex + 1, prevHistory.length - 1)
      setCurrentIndex(nextIndex)
      return prevHistory
    })
  }, [currentIndex])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    value,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
  }
}
