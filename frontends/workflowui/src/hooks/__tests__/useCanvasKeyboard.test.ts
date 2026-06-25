/**
 * Tests for useCanvasKeyboard
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  selectSelectedItemIds: jest.fn((state: any) => state.selectedItemIds || new Set()),
  clearSelection: jest.fn(() => ({ type: 'canvas/clearSelection' })),
}))

import { renderHook } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { clearSelection } from '@metabuilder/redux-slices'
import { useCanvasKeyboard } from '../useCanvasKeyboard'

const mockDispatch = jest.fn()

function setupMocks(selectedIds = new Set<string>()) {
  ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
  ;(useSelector as jest.Mock).mockReturnValue(selectedIds)
}

function fireKeydown(key: string, extra: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...extra })
  window.dispatchEvent(event)
  return event
}

describe('useCanvasKeyboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should add keydown event listener on mount and remove on unmount', () => {
    setupMocks()
    const addSpy = jest.spyOn(window, 'addEventListener')
    const removeSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useCanvasKeyboard())
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('should call onSelectAll when Ctrl+A pressed', () => {
    const onSelectAll = jest.fn()
    renderHook(() => useCanvasKeyboard({ onSelectAll }))

    fireKeydown('a', { ctrlKey: true })

    expect(onSelectAll).toHaveBeenCalled()
  })

  it('should call onSelectAll when Meta+A pressed', () => {
    const onSelectAll = jest.fn()
    renderHook(() => useCanvasKeyboard({ onSelectAll }))

    fireKeydown('a', { metaKey: true })

    expect(onSelectAll).toHaveBeenCalled()
  })

  it('should call onDeleteSelected when Delete pressed and items are selected', () => {
    setupMocks(new Set(['item-1']))
    const onDeleteSelected = jest.fn()
    renderHook(() => useCanvasKeyboard({ onDeleteSelected }))

    fireKeydown('Delete')

    expect(onDeleteSelected).toHaveBeenCalled()
  })

  it('should not call onDeleteSelected when no items selected', () => {
    setupMocks(new Set())
    const onDeleteSelected = jest.fn()
    renderHook(() => useCanvasKeyboard({ onDeleteSelected }))

    fireKeydown('Delete')

    expect(onDeleteSelected).not.toHaveBeenCalled()
  })

  it('should call onDeleteSelected when Backspace pressed and items are selected', () => {
    setupMocks(new Set(['item-1']))
    const onDeleteSelected = jest.fn()
    renderHook(() => useCanvasKeyboard({ onDeleteSelected }))

    fireKeydown('Backspace')

    expect(onDeleteSelected).toHaveBeenCalled()
  })

  it('should call onDuplicateSelected when Ctrl+D pressed with items selected', () => {
    setupMocks(new Set(['item-1']))
    const onDuplicateSelected = jest.fn()
    renderHook(() => useCanvasKeyboard({ onDuplicateSelected }))

    fireKeydown('d', { ctrlKey: true })

    expect(onDuplicateSelected).toHaveBeenCalled()
  })

  it('should not call onDuplicateSelected when no items selected', () => {
    setupMocks(new Set())
    const onDuplicateSelected = jest.fn()
    renderHook(() => useCanvasKeyboard({ onDuplicateSelected }))

    fireKeydown('d', { ctrlKey: true })

    expect(onDuplicateSelected).not.toHaveBeenCalled()
  })

  it('should call onSearch when Ctrl+F pressed', () => {
    const onSearch = jest.fn()
    renderHook(() => useCanvasKeyboard({ onSearch }))

    fireKeydown('f', { ctrlKey: true })

    expect(onSearch).toHaveBeenCalled()
  })

  it('should dispatch clearSelection on Escape', () => {
    renderHook(() => useCanvasKeyboard())

    fireKeydown('Escape')

    expect(mockDispatch).toHaveBeenCalledWith(clearSelection())
  })

  it('should work with no handlers provided', () => {
    renderHook(() => useCanvasKeyboard())

    // Should not throw
    fireKeydown('a', { ctrlKey: true })
    fireKeydown('Delete')
    fireKeydown('Escape')
  })

  it('should handle arrow keys without throwing', () => {
    renderHook(() => useCanvasKeyboard())

    // Arrow keys should not throw
    fireKeydown('ArrowUp')
    fireKeydown('ArrowDown')
    fireKeydown('ArrowLeft')
    fireKeydown('ArrowRight')
  })
})
