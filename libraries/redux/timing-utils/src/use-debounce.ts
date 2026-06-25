import { useState, useEffect } from 'react'

/**
 * Debounces a value by delaying updates for a specified duration.
 * Useful for debouncing search inputs, form values, or other frequently-changing data.
 *
 * @example
 * function SearchUsers() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *
 *   useEffect(() => {
 *     // This only runs after searchTerm hasn't changed for 500ms
 *     if (debouncedSearchTerm) {
 *       fetchUsers(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 *
 *   return (
 *     <>
 *       <input
 *         value={searchTerm}
 *         onChange={(e) => setSearchTerm(e.target.value)}
 *         placeholder="Search users..."
 *       />
 *     </>
 *   )
 * }
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
