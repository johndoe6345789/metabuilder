'use client'

import { useEffect } from 'react'

/**
 * ⌘Z / ⇧⌘Z, but not while someone is typing into a property field -- there
 * the browser's own undo is what they mean.
 */
export function useUndoRedoKeys(undo: () => void, redo: () => void): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== 'z'
      ) {
        return
      }
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [undo, redo])
}
