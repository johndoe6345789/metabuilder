/**
 * @metabuilder/timing-utils
 *
 * Timing and debounce utilities for React applications.
 * Provides zero-dependency hooks for debouncing values, debouncing saves,
 * tracking save timestamps, and displaying save indicators.
 *
 * Works across all frontends and applications.
 *
 * ## Installation
 *
 * ```bash
 * npm install @metabuilder/timing-utils
 * ```
 *
 * ## Usage Examples
 *
 * ### Debounce Search Input
 *
 * ```typescript
 * import { useDebounce } from '@metabuilder/timing-utils'
 *
 * function SearchUsers() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedTerm = useDebounce(searchTerm, 500)
 *
 *   useEffect(() => {
 *     if (debouncedTerm) {
 *       fetchUsers(debouncedTerm)
 *     }
 *   }, [debouncedTerm])
 *
 *   return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 * }
 * ```
 *
 * ### Auto-Save Form Data
 *
 * ```typescript
 * import { useDebouncedSave } from '@metabuilder/timing-utils'
 *
 * function DocumentEditor() {
 *   const [content, setContent] = useState('')
 *
 *   useDebouncedSave(content, async (value) => {
 *     await saveDocument(value)
 *   }, 2000)
 *
 *   return <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 * }
 * ```
 *
 * ### Track and Display Last Save Time
 *
 * ```typescript
 * import { useLastSaved, useSaveIndicator } from '@metabuilder/timing-utils'
 *
 * function DocumentStatus() {
 *   const [content, setContent] = useState('')
 *   const lastSaved = useLastSaved([content])
 *   const { timeAgo, isRecent } = useSaveIndicator(lastSaved)
 *
 *   return (
 *     <div>
 *       {isRecent && <span className="animate-pulse">●</span>}
 *       <span>{timeAgo || 'Not saved'}</span>
 *     </div>
 *   )
 * }
 * ```
 *
 * ## API Reference
 *
 * ### useDebounce(value, delay?)
 * Debounces a value and returns the debounced version.
 * - `value`: The value to debounce
 * - `delay`: Debounce delay in milliseconds (default: 500)
 * - Returns: The debounced value of the same type as input
 *
 * ### useDebouncedSave(value, onSave, delay?)
 * Debounces a save operation triggered by value changes.
 * - `value`: The value to save
 * - `onSave`: Callback function called after debounce period
 * - `delay`: Debounce delay in milliseconds (default: 1000)
 * - Returns: void
 *
 * ### useLastSaved(dependencies)
 * Tracks the timestamp of the last save based on dependencies.
 * - `dependencies`: Array of values to watch (like useEffect dependencies)
 * - Returns: Timestamp in milliseconds or null
 *
 * ### useSaveIndicator(lastSaved, options?)
 * Formats save time and indicates recency.
 * - `lastSaved`: Timestamp from useLastSaved or Date.now()
 * - `options`:
 *   - `intervalMs`: Update interval for formatted time (default: 10000)
 *   - `recentThresholdMs`: Time threshold for "recent" indicator (default: 3000)
 * - Returns: Object with `{ timeAgo: string, isRecent: boolean }`
 *
 * Note: useSaveIndicator optionally uses date-fns for formatting. If not installed,
 * falls back to a simple time calculation.
 *
 * ## Features
 *
 * - ✅ Zero dependencies (React only)
 * - ✅ TypeScript support with full type inference
 * - ✅ Works in all React versions 18+
 * - ✅ Proper cleanup and memory leak prevention
 * - ✅ Configurable delays and thresholds
 * - ✅ Graceful fallback for optional dependencies
 */

export { useDebounce } from './use-debounce'
export { useDebouncedSave } from './use-debounced-save'
export { useLastSaved } from './use-last-saved'
export { useSaveIndicator } from './use-save-indicator'
