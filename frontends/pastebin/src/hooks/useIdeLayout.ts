import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'

/**
 * IDE chrome controls for the snippet editor:
 *  - `maximized`: hide the site header so the IDE fills the whole window.
 *  - `ideHeight`: an explicit work-area height (px) set by dragging the bottom
 *    edge. `null` means "fill the viewport" (the default). When taller than the
 *    viewport the page scrolls. Drag start height is read from the handle's
 *    previous sibling (the work area) so no ref threading is needed.
 */
export function useIdeLayout() {
  const [maximized, setMaximized] = useState(false)
  const toggleMaximized = useCallback(() => setMaximized(m => !m), [])

  const [ideHeight, setIdeHeight] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startHRef = useRef(0)

  const onIdeHandleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      const prev = (e.currentTarget as HTMLElement).previousElementSibling
      startHRef.current =
        ideHeight ?? (prev instanceof HTMLElement ? prev.clientHeight : 400)
      startYRef.current = e.clientY
      setDragging(true)
    },
    [ideHeight],
  )

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const next = startHRef.current + (e.clientY - startYRef.current)
      setIdeHeight(Math.max(240, next))
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  const resetIdeHeight = useCallback(() => setIdeHeight(null), [])

  return {
    maximized,
    toggleMaximized,
    ideHeight,
    ideDragging: dragging,
    onIdeHandleMouseDown,
    resetIdeHeight,
  }
}
