/**
 * useHotkeys Hook
 * Global hotkey registration with combo key support
 *
 * Features:
 * - Support for combo keys (e.g., 'ctrl+shift+k', 'cmd+s')
 * - Scoped hotkey management per component
 * - Handler registration function
 * - Automatic cleanup on unmount
 * - Platform-aware (Mac vs Windows/Linux)
 * - Prevent default behavior
 * - Multiple handlers for same hotkey
 *
 * @example
 * // Basic hotkey
 * const hotkeys = useHotkeys()
 *
 * hotkeys.register('ctrl+s', () => {
 *   console.log('Save shortcut triggered')
 * })
 *
 * @example
 * // Platform-specific hotkeys
 * const hotkeys = useHotkeys()
 *
 * // Use cmd on Mac, ctrl on Windows
 * const saveKey = navigator.platform.includes('Mac') ? 'cmd+s' : 'ctrl+s'
 *
 * hotkeys.register(saveKey, () => saveDocument())
 * hotkeys.register('Escape', () => closeDialog())
 *
 * @example
 * // With options
 * const hotkeys = useHotkeys()
 *
 * const id = hotkeys.register('ctrl+shift+k', () => {
 *   openCommandPalette()
 * }, {
 *   preventDefault: true,
 *   enabled: isComponentVisible
 * })
 *
 * // Unregister later
 * useEffect(() => {
 *   return () => hotkeys.unregister(id)
 * }, [])
 *
 * @example
 * // Combo key parsing
 * // Supports: 'ctrl', 'cmd', 'shift', 'alt', 'meta'
 * // Case-insensitive key names
 * hotkeys.register('ctrl+shift+enter', handleSubmit)
 * hotkeys.register('cmd+opt+k', handleSearch) // opt = alt on Mac
 */

import { useEffect, useRef, useCallback } from 'react'

export interface HotkeysOptions {
  /** Prevent default behavior on hotkey press */
  preventDefault?: boolean
  /** Whether this hotkey is currently enabled */
  enabled?: boolean
  /** Debounce delay in milliseconds */
  debounceMs?: number
}

export interface UseHotkeysReturn {
  /** Register a hotkey combo, returns ID for later unregistration */
  register: (combo: string, handler: () => void, options?: HotkeysOptions) => string
  /** Unregister a hotkey by ID */
  unregister: (id: string) => void
  /** Unregister all hotkeys for this instance */
  unregisterAll: () => void
}

interface ParsedCombo {
  ctrl: boolean
  cmd: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
}

interface RegisteredHotkey {
  combo: ParsedCombo
  handler: () => void
  options: HotkeysOptions
  lastTriggeredAt: number
}

const parseCombo = (combo: string): ParsedCombo => {
  const parts = combo.toLowerCase().split('+')
  const parsed: ParsedCombo = {
    ctrl: false,
    cmd: false,
    shift: false,
    alt: false,
    meta: false,
    key: '',
  }

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i].trim()
    if (part === 'ctrl' || part === 'control') parsed.ctrl = true
    if (part === 'cmd' || part === 'command') parsed.cmd = true
    if (part === 'shift') parsed.shift = true
    if (part === 'alt' || part === 'option' || part === 'opt') parsed.alt = true
    if (part === 'meta') parsed.meta = true
  }

  parsed.key = parts[parts.length - 1].trim()
  return parsed
}

const isMac = () => {
  if (typeof window === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || '')
}

export function useHotkeys(): UseHotkeysReturn {
  const hotkeysRef = useRef<Map<string, RegisteredHotkey>>(new Map())
  const platformIsMacRef = useRef(isMac())

  const register = useCallback(
    (combo: string, handler: () => void, options: HotkeysOptions = {}): string => {
      const id = `hotkey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const parsedCombo = parseCombo(combo)

      hotkeysRef.current.set(id, {
        combo: parsedCombo,
        handler,
        options: {
          preventDefault: false,
          enabled: true,
          debounceMs: 0,
          ...options,
        },
        lastTriggeredAt: 0,
      })

      return id
    },
    []
  )

  const unregister = useCallback((id: string) => {
    hotkeysRef.current.delete(id)
  }, [])

  const unregisterAll = useCallback(() => {
    hotkeysRef.current.clear()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      hotkeysRef.current.forEach((hotkey) => {
        if (!hotkey.options.enabled) return

        const { combo, handler, options, lastTriggeredAt } = hotkey

        // Check key match
        const isKeyMatch = event.key.toLowerCase() === combo.key.toLowerCase()

        // Determine if ctrl/cmd is pressed (cross-platform)
        const isMetaPressed = (() => {
          if (combo.cmd && combo.ctrl) {
            return platformIsMacRef.current ? event.metaKey : event.ctrlKey
          }
          if (combo.cmd) {
            return platformIsMacRef.current ? event.metaKey : false
          }
          if (combo.ctrl) {
            return platformIsMacRef.current ? event.metaKey : event.ctrlKey
          }
          return true // No meta key required
        })()

        // Check shift
        const isShiftMatch = combo.shift ? event.shiftKey : true

        // Check alt (option on Mac)
        const isAltMatch = combo.alt ? event.altKey : true

        // Check meta
        const isMetaMatch = combo.meta ? event.metaKey : true

        if (isKeyMatch && isMetaPressed && isShiftMatch && isAltMatch && isMetaMatch) {
          // Check debounce
          const now = Date.now()
          if (
            options.debounceMs &&
            now - lastTriggeredAt < options.debounceMs
          ) {
            return
          }

          if (options.preventDefault) {
            event.preventDefault()
          }

          hotkey.lastTriggeredAt = now
          handler()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return {
    register,
    unregister,
    unregisterAll,
  }
}
