import { useEffect } from 'react'

/**
 * Map of shortcut keys to handler functions.
 * Use '#' for Shift+3, '?' for Shift+/, etc.
 */
export interface KeyboardShortcutMap {
  [key: string]: () => void
}

const IGNORED_TAGS = new Set([
  'INPUT', 'TEXTAREA', 'SELECT',
])

function isEditable(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  if (IGNORED_TAGS.has(el.tagName)) return true
  return el.isContentEditable
}

/**
 * Gmail-style keyboard shortcuts hook.
 * Fires mapped actions on keydown unless an
 * input/textarea/contenteditable is focused.
 * @param shortcuts - key-to-action map
 * @param enabled - toggle listener (default true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutMap,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return
      const action = shortcuts[e.key]
      if (action) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}
