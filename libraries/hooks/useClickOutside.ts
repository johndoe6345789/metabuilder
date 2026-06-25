/**
 * useClickOutside Hook
 * Detect clicks outside a referenced element and manage open state
 *
 * Features:
 * - Track element reference with useRef
 * - Detect clicks outside element
 * - Support for multiple target nodes
 * - Optional callback on outside click
 * - Automatic cleanup
 * - Support for both mouse and touch events
 * - Respects disabled state
 *
 * @example
 * // Basic usage with dialog
 * const { ref, isOpen, setIsOpen } = useClickOutside()
 *
 * return (
 *   <div>
 *     <Button onClick={() => setIsOpen(true)}>Open Menu</Button>
 *     {isOpen && (
 *       <Menu ref={ref}>
 *         <MenuItem>Item 1</MenuItem>
 *         <MenuItem>Item 2</MenuItem>
 *       </Menu>
 *     )}
 *   </div>
 * )
 *
 * @example
 * // With callback
 * const { ref, isOpen, setIsOpen } = useClickOutside({
 *   onClickOutside: () => console.log('Closed from outside click'),
 *   excludeRefs: [triggerButtonRef]
 * })
 *
 * @example
 * // Close dropdown when clicking outside
 * const { ref, isOpen, setIsOpen } = useClickOutside()
 *
 * useEffect(() => {
 *   if (!isOpen) return
 *   const handleClick = () => setIsOpen(false)
 *   // Dropdown closes when clicking outside
 * }, [isOpen])
 */

import { useRef, useState, useCallback, useEffect } from 'react'

export interface UseClickOutsideOptions {
  /** Callback when click occurs outside element */
  onClickOutside?: () => void
  /** Additional refs to exclude from outside click detection */
  excludeRefs?: React.RefObject<HTMLElement>[]
  /** Include touch events in addition to mouse events */
  includeTouch?: boolean
  /** Delay before detecting outside click (ms) */
  delayMs?: number
}

export interface UseClickOutsideReturn<T extends HTMLElement = HTMLDivElement> {
  /** Ref to attach to the target element */
  ref: React.RefObject<T | null>
  /** Whether the element is currently open/visible */
  isOpen: boolean
  /** Set the open state */
  setIsOpen: (open: boolean) => void
  /** Toggle the open state */
  toggle: () => void
}

export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  options: UseClickOutsideOptions = {}
): UseClickOutsideReturn<T> {
  const {
    onClickOutside,
    excludeRefs = [],
    includeTouch = true,
    delayMs = 0,
  } = options

  const ref = useRef<T>(null)
  const [isOpen, setIsOpen] = useState(false)
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Check if click is outside the main ref
      if (ref.current?.contains(event.target as Node)) {
        return
      }

      // Check if click is within any excluded refs
      const isWithinExcluded = excludeRefs.some((excludeRef) =>
        excludeRef.current?.contains(event.target as Node)
      )
      if (isWithinExcluded) {
        return
      }

      // Handle delay
      if (delayMs > 0) {
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current)
        }
        delayTimeoutRef.current = setTimeout(() => {
          setIsOpen(false)
          onClickOutside?.()
        }, delayMs)
      } else {
        setIsOpen(false)
        onClickOutside?.()
      }
    }

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside)
    if (includeTouch) {
      document.addEventListener('touchstart', handleClickOutside)
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (includeTouch) {
        document.removeEventListener('touchstart', handleClickOutside)
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current)
      }
    }
  }, [isOpen, excludeRefs, delayMs, includeTouch, onClickOutside])

  return {
    ref,
    isOpen,
    setIsOpen,
    toggle,
  }
}
