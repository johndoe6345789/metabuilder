import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useUndoRedoKeys } from './use-undo-redo-keys'

const press = (
  key: string,
  over: Partial<KeyboardEventInit> = {}
): KeyboardEvent =>
  new KeyboardEvent('keydown', { key, metaKey: true, ...over, bubbles: true })

describe('useUndoRedoKeys', () => {
  it('undoes on cmd/ctrl+Z', () => {
    const undo = vi.fn()
    const redo = vi.fn()
    renderHook(() => {
      useUndoRedoKeys(undo, redo)
    })
    window.dispatchEvent(press('z'))
    expect(undo).toHaveBeenCalledOnce()
    expect(redo).not.toHaveBeenCalled()
  })

  it('redoes on cmd/ctrl+shift+Z', () => {
    const undo = vi.fn()
    const redo = vi.fn()
    renderHook(() => {
      useUndoRedoKeys(undo, redo)
    })
    window.dispatchEvent(press('z', { shiftKey: true }))
    expect(redo).toHaveBeenCalledOnce()
    expect(undo).not.toHaveBeenCalled()
  })

  it('matches the key regardless of case', () => {
    const undo = vi.fn()
    renderHook(() => {
      useUndoRedoKeys(undo, vi.fn())
    })
    window.dispatchEvent(press('Z'))
    expect(undo).toHaveBeenCalledOnce()
  })

  it('ignores z with no modifier', () => {
    const undo = vi.fn()
    renderHook(() => {
      useUndoRedoKeys(undo, vi.fn())
    })
    window.dispatchEvent(press('z', { metaKey: false }))
    expect(undo).not.toHaveBeenCalled()
  })

  it('ignores every other key', () => {
    const undo = vi.fn()
    renderHook(() => {
      useUndoRedoKeys(undo, vi.fn())
    })
    window.dispatchEvent(press('a'))
    expect(undo).not.toHaveBeenCalled()
  })

  // The browser's own undo is what a person means while typing into a
  // property field, not the tree's history.
  it.each(['INPUT', 'TEXTAREA', 'SELECT'])(
    'defers to the browser while a %s is focused',
    tag => {
      const el = document.createElement(tag)
      document.body.appendChild(el)
      el.focus()
      const undo = vi.fn()
      renderHook(() => {
        useUndoRedoKeys(undo, vi.fn())
      })
      window.dispatchEvent(press('z'))
      expect(undo).not.toHaveBeenCalled()
      el.remove()
    }
  )

  it('removes its listener on unmount', () => {
    const undo = vi.fn()
    const { unmount } = renderHook(() => {
      useUndoRedoKeys(undo, vi.fn())
    })
    unmount()
    window.dispatchEvent(press('z'))
    expect(undo).not.toHaveBeenCalled()
  })
})
