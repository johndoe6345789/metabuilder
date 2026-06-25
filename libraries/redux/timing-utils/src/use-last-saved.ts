import { useState, useEffect } from 'react'

/**
 * Tracks the timestamp of the last save operation based on provided dependencies.
 * Updates whenever dependencies change, marking that moment as a "save point".
 *
 * @example
 * function DocumentViewer() {
 *   const [content, setContent] = useState('')
 *   const lastSaved = useLastSaved([content])
 *
 *   return (
 *     <div>
 *       <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 *       {lastSaved && (
 *         <p>Last saved at: {new Date(lastSaved).toLocaleTimeString()}</p>
 *       )}
 *     </div>
 *   )
 * }
 */
export function useLastSaved(dependencies: any[]): number | null {
  const [lastSaved, setLastSaved] = useState<number | null>(Date.now())

  useEffect(() => {
    setLastSaved(Date.now())
  }, dependencies)

  return lastSaved
}
