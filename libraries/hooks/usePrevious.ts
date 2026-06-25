/**
 * usePrevious Hook
 * Track the previous value of any state or prop
 *
 * Features:
 * - Generic typing for any value type
 * - Tracks previous value across renders
 * - Updated on every render with new value
 * - Useful for comparing current vs previous values
 * - Works with any data type (primitives, objects, arrays)
 *
 * @example
 * const [count, setCount] = useState(0)
 * const prevCount = usePrevious(count)
 *
 * <div>
 *   <p>Current: {count}</p>
 *   <p>Previous: {prevCount ?? 'N/A'}</p>
 *   <Button onClick={() => setCount(count + 1)}>Increment</Button>
 * </div>
 *
 * @example
 * // With objects
 * const [user, setUser] = useState({ name: '', age: 0 })
 * const prevUser = usePrevious(user)
 *
 * // Detect if user changed
 * useEffect(() => {
 *   if (prevUser?.name !== user.name) {
 *     console.log('Name changed!')
 *   }
 * }, [user, prevUser])
 *
 * @example
 * // With form inputs - detect if value was actually changed
 * const [email, setEmail] = useState('')
 * const prevEmail = usePrevious(email)
 *
 * const hasChanged = prevEmail !== undefined && email !== prevEmail
 */

import { useEffect, useRef } from 'react'

/**
 * Hook to track the previous value of any state or prop
 * @template T - The type of the value being tracked
 * @param value - Current value to track
 * @returns Previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
