/**
 * useEventListener Hook
 * Generic reusable event listener hook with proper cleanup
 *
 * Features:
 * - Generic typing for any event type
 * - Support for passive listeners (for scroll/touch performance)
 * - Works with window, document, or element references
 * - Automatic cleanup on unmount or dependency change
 * - Support for capture phase
 * - Type-safe event handlers
 * - Handles SSR environments
 *
 * @example
 * // Listen to window resize
 * const { add, remove, removeAll } = useEventListener()
 *
 * add(window, 'resize', (e: UIEvent) => {
 *   console.log('Window resized')
 * })
 *
 * @example
 * // Listen to element events
 * const { add } = useEventListener()
 * const inputRef = useRef<HTMLInputElement>(null)
 *
 * useEffect(() => {
 *   if (!inputRef.current) return
 *
 *   const remove = add(
 *     inputRef.current,
 *     'input',
 *     (e: Event) => {
 *       const target = e.target as HTMLInputElement
 *       console.log('Input value:', target.value)
 *     }
 *   )
 *
 *   return remove
 * }, [])
 *
 * @example
 * // Passive listener for scroll performance
 * const { add } = useEventListener()
 *
 * add(
 *   window,
 *   'scroll',
 *   (e: Event) => {
 *     console.log('Scrolling')
 *   },
 *   { passive: true }
 * )
 *
 * @example
 * // Document events
 * const { add } = useEventListener()
 *
 * add(document, 'click', (e: MouseEvent) => {
 *   console.log('Clicked at', e.clientX, e.clientY)
 * })
 */

import { useEffect, useRef, useCallback } from 'react'

export interface EventListenerOptions extends AddEventListenerOptions {
  /** Enable passive event listener (better scroll performance) */
  passive?: boolean
  /** Use capture phase instead of bubble phase */
  capture?: boolean
  /** Automatically remove after first trigger */
  once?: boolean
}

export type EventHandler<T extends Event = Event> = (event: T) => void

export interface UseEventListenerReturn {
  /**
   * Add an event listener
   * @param target Element, window, or document to listen on
   * @param event Event name (e.g., 'click', 'scroll', 'resize')
   * @param handler Event handler function
   * @param options Event listener options
   * @returns Function to remove this specific listener
   */
  add: <T extends Event = Event>(
    target: EventTarget | null | undefined,
    event: string,
    handler: EventHandler<T>,
    options?: EventListenerOptions
  ) => () => void

  /**
   * Remove a specific event listener
   * @param target Element to remove listener from
   * @param event Event name
   * @param handler Event handler
   * @param options Event listener options (must match add call)
   */
  remove: (
    target: EventTarget | null | undefined,
    event: string,
    handler: EventHandler,
    options?: EventListenerOptions
  ) => void

  /**
   * Remove all listeners registered through this hook instance
   */
  removeAll: () => void
}

interface ListenerEntry {
  target: EventTarget
  event: string
  handler: EventHandler
  options: EventListenerOptions
}

export function useEventListener(): UseEventListenerReturn {
  const listenersRef = useRef<ListenerEntry[]>([])

  const add = useCallback(
    <T extends Event = Event>(
      target: EventTarget | null | undefined,
      event: string,
      handler: EventHandler<T>,
      options: EventListenerOptions = {}
    ): (() => void) => {
      if (!target) {
        return () => {}
      }

      // Normalize options
      const normalizedOptions: EventListenerOptions = {
        passive: options.passive ?? false,
        capture: options.capture ?? false,
        once: options.once ?? false,
        ...options,
      }

      // Add listener
      target.addEventListener(event, handler as EventListener, normalizedOptions)

      // Track listener for cleanup
      const entry: ListenerEntry = {
        target,
        event,
        handler,
        options: normalizedOptions,
      }
      listenersRef.current.push(entry)

      // Return cleanup function
      return () => {
        target.removeEventListener(event, handler as EventListener, normalizedOptions)
        listenersRef.current = listenersRef.current.filter(
          (l) =>
            !(
              l.target === target &&
              l.event === event &&
              l.handler === handler &&
              l.options.capture === normalizedOptions.capture
            )
        )
      }
    },
    []
  )

  const remove = useCallback(
    (
      target: EventTarget | null | undefined,
      event: string,
      handler: EventHandler,
      options: EventListenerOptions = {}
    ) => {
      if (!target) return

      const normalizedOptions: EventListenerOptions = {
        passive: options.passive ?? false,
        capture: options.capture ?? false,
        once: options.once ?? false,
        ...options,
      }

      target.removeEventListener(event, handler as EventListener, normalizedOptions)

      // Remove from tracking
      listenersRef.current = listenersRef.current.filter(
        (l) =>
          !(
            l.target === target &&
            l.event === event &&
            l.handler === handler &&
            l.options.capture === normalizedOptions.capture
          )
      )
    },
    []
  )

  const removeAll = useCallback(() => {
    listenersRef.current.forEach((entry) => {
      entry.target.removeEventListener(entry.event, entry.handler as EventListener, {
        capture: entry.options.capture,
      })
    })
    listenersRef.current = []
  }, [])

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      removeAll()
    }
  }, [removeAll])

  return {
    add,
    remove,
    removeAll,
  }
}
