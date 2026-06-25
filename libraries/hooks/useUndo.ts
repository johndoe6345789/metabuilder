/**
 * useUndo Hook
 * Simplified undo/redo wrapper for any state value
 *
 * Features:
 * - Generic typing for any value type
 * - Simple undo/redo operations with boundary checks
 * - Reset to initial or specific value
 * - Query undo/redo availability
 * - Lightweight and performant
 * - Useful as alternative to useStateWithHistory for simpler use cases
 *
 * @example
 * const { value, undo, redo, reset, canUndo, canRedo } = useUndo('initial value')
 *
 * const handleChange = (newValue: string) => {
 *   // Setting a new value automatically enables undo
 *   setValue(newValue)
 * }
 *
 * <div>
 *   <p>Current: {value}</p>
 *   <Button onClick={() => handleChange('changed')}>Change</Button>
 *   <Button onClick={undo} disabled={!canUndo}>Undo</Button>
 *   <Button onClick={redo} disabled={!canRedo}>Redo</Button>
 *   <Button onClick={() => reset()}>Reset</Button>
 * </div>
 *
 * @example
 * // With text editor
 * const { value: text, undo, redo, canUndo, canRedo } = useUndo('')
 *
 * return (
 *   <div>
 *     <Editor
 *       value={text}
 *       onChange={(newText) => setValue(newText)}
 *     />
 *     <Toolbar>
 *       <Button onClick={undo} disabled={!canUndo} icon="undo" />
 *       <Button onClick={redo} disabled={!canRedo} icon="redo" />
 *     </Toolbar>
 *   </div>
 * )
 *
 * @example
 * // Track both past and future for undo/redo
 * const { value, undo, redo } = useUndo({ x: 0, y: 0 })
 * // Modify canUndo/canRedo based on history tracking
 */

import { useState, useCallback } from 'react'

export interface UseUndoReturn<T> {
  /** Current value */
  value: T
  /** Set new value (stores current value for undo) */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Undo to previous value */
  undo: () => void
  /** Redo to next value */
  redo: () => void
  /** Reset to initial value */
  reset: (value?: T) => void
  /** Check if undo is available */
  canUndo: boolean
  /** Check if redo is available */
  canRedo: boolean
}

/**
 * Hook for managing undo/redo operations on any value
 * @template T - The type of the value
 * @param initialValue - Initial value
 * @returns Object containing value and undo/redo operations
 */
export function useUndo<T>(initialValue: T): UseUndoReturn<T> {
  // past[past.length - 1] is the value before current
  // future[0] is the value after current
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initialValue)
  const [future, setFuture] = useState<T[]>([])

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const valueToStore = newValue instanceof Function ? newValue(present) : newValue

    setPast((prevPast) => [...prevPast, present])
    setPresent(valueToStore)
    setFuture([])
  }, [present])

  const undo = useCallback(() => {
    if (past.length === 0) return

    setPast((prevPast) => {
      const newPast = [...prevPast]
      const previousValue = newPast.pop()

      if (previousValue !== undefined) {
        setFuture((prevFuture) => [present, ...prevFuture])
        setPresent(previousValue)
      }

      return newPast
    })
  }, [present])

  const redo = useCallback(() => {
    if (future.length === 0) return

    const nextValue = future[0]
    setPast((prevPast) => [...prevPast, present])
    setFuture((prevFuture) => prevFuture.slice(1))
    setPresent(nextValue)
  }, [present, future])

  const reset = useCallback((value: T = initialValue) => {
    setPast([])
    setPresent(value)
    setFuture([])
  }, [initialValue])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  return {
    value: present,
    setValue,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  }
}
