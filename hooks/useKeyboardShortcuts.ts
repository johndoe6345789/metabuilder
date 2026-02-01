/**
 * useKeyboardShortcuts Hook
 * Unified keyboard shortcut handling with meta key support
 *
 * Features:
 * - Register shortcuts with meta keys (cmd/ctrl, shift, alt, etc)
 * - Automatic platform detection (macOS vs Windows/Linux)
 * - Prevent default browser shortcuts
 * - Multiple callbacks per shortcut
 * - Clean unregistration and complete clearing
 * - Debouncing and preventDefault handling
 *
 * @example
 * const { registerShortcut, unregister, clearAll } = useKeyboardShortcuts()
 *
 * // Simple shortcut
 * registerShortcut({
 *   key: 's',
 *   ctrl: true,
 *   onPress: () => console.log('Save triggered')
 * })
 *
 * // macOS-specific shortcut
 * registerShortcut({
 *   key: 's',
 *   cmd: true,
 *   onPress: () => console.log('Save on Mac'),
 *   preventDefault: true
 * })
 *
 * // Multiple keys
 * registerShortcut({
 *   key: 'Enter',
 *   ctrl: true,
 *   shift: true,
 *   onPress: () => console.log('Ctrl+Shift+Enter')
 * })
 *
 * @example
 * // Cleanup on unmount
 * useEffect(() => {
 *   const id = registerShortcut({
 *     key: 'Escape',
 *     onPress: () => setOpen(false)
 *   })
 *   return () => unregister(id)
 * }, [])
 */

import { useEffect, useRef, useCallback } from 'react'

export interface KeyboardShortcut {
  /** Key to listen for (e.g., 's', 'Enter', 'ArrowUp') */
  key: string
  /** Trigger on Ctrl key (Windows/Linux) */
  ctrl?: boolean
  /** Trigger on Cmd key (macOS) */
  cmd?: boolean
  /** Trigger on Shift key */
  shift?: boolean
  /** Trigger on Alt key */
  alt?: boolean
  /** Callback when shortcut is triggered */
  onPress: () => void
  /** Whether to preventDefault on keydown */
  preventDefault?: boolean
  /** Debounce delay in ms */
  debounce?: number
}

export interface UseKeyboardShortcutsReturn {
  /** Register a new keyboard shortcut, returns ID for unregistration */
  registerShortcut: (shortcut: KeyboardShortcut) => string
  /** Unregister a specific shortcut by ID */
  unregister: (id: string) => void
  /** Clear all registered shortcuts */
  clearAll: () => void
}

const isMac = () => {
  if (typeof window === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || '')
}

export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut & { timeoutId?: NodeJS.Timeout }>>(
    new Map()
  )
  const platformIsMac = useRef(isMac())

  const registerShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const id = `shortcut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    shortcutsRef.current.set(id, shortcut)
    return id
  }, [])

  const unregister = useCallback((id: string) => {
    const shortcut = shortcutsRef.current.get(id)
    if (shortcut?.timeoutId) {
      clearTimeout(shortcut.timeoutId)
    }
    shortcutsRef.current.delete(id)
  }, [])

  const clearAll = useCallback(() => {
    shortcutsRef.current.forEach((shortcut) => {
      if (shortcut.timeoutId) {
        clearTimeout(shortcut.timeoutId)
      }
    })
    shortcutsRef.current.clear()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutsRef.current.forEach((shortcut, id) => {
        const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        // Determine if meta key matches (cmd on Mac, ctrl on Windows/Linux)
        const isMetaMatch = (() => {
          if (shortcut.cmd) {
            return platformIsMac.current ? event.metaKey : false
          }
          if (shortcut.ctrl) {
            return platformIsMac.current ? event.metaKey : event.ctrlKey
          }
          return !shortcut.cmd && !shortcut.ctrl
        })()

        const isShiftMatch = shortcut.shift ? event.shiftKey : true
        const isAltMatch = shortcut.alt ? event.altKey : true

        if (isKeyMatch && isMetaMatch && isShiftMatch && isAltMatch) {
          if (shortcut.preventDefault) {
            event.preventDefault()
          }

          // Handle debouncing
          if (shortcut.debounce) {
            const current = shortcutsRef.current.get(id)
            if (current?.timeoutId) {
              clearTimeout(current.timeoutId)
            }
            const timeoutId = setTimeout(() => {
              shortcut.onPress()
            }, shortcut.debounce)
            shortcutsRef.current.set(id, { ...shortcut, timeoutId })
          } else {
            shortcut.onPress()
          }
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // Cleanup debounce timeouts
      shortcutsRef.current.forEach((shortcut) => {
        if (shortcut.timeoutId) {
          clearTimeout(shortcut.timeoutId)
        }
      })
    }
  }, [])

  return {
    registerShortcut,
    unregister,
    clearAll,
  }
}
