import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'

interface ResizableDockOptions {
  /** Initial dock height in px. */
  initial?: number
  /** Minimum dock height in px. */
  min?: number
  /** Minimum px kept for the area above the dock (keeps the editor usable). */
  minMain?: number
}

/**
 * Drag-to-resize state for a bottom-docked panel inside a vertical split.
 * Attach `containerRef` to the split container and `onHandleMouseDown` to a
 * grab handle at the top of the dock; apply `height` to the dock element.
 * Dragging the handle up grows the dock, down shrinks it, clamped between
 * `min` and `container height − minMain`.
 */
export function useResizableDock({
  initial = 360,
  min = 170,
  minMain = 140,
}: ResizableDockOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState(initial)
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startHRef = useRef(0)

  const onHandleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      startYRef.current = e.clientY
      startHRef.current = height
      setDragging(true)
    },
    [height],
  )

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const delta = startYRef.current - e.clientY
      const container = containerRef.current
      const max = container
        ? Math.max(min, container.clientHeight - minMain)
        : Number.MAX_SAFE_INTEGER
      setHeight(Math.min(max, Math.max(min, startHRef.current + delta)))
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, min, minMain])

  return { containerRef, height, dragging, onHandleMouseDown }
}
