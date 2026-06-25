/**
 * Tests for useDocumentMouseEvents
 */

import { renderHook } from '@testing-library/react'
import { useDocumentMouseEvents } from '../useDocumentMouseEvents'

describe('useDocumentMouseEvents', () => {
  it('should add event listeners when enabled', () => {
    const onMouseMove = jest.fn()
    const onMouseUp = jest.fn()
    const addSpy = jest.spyOn(document, 'addEventListener')

    renderHook(() => useDocumentMouseEvents({ onMouseMove, onMouseUp, enabled: true }))

    expect(addSpy).toHaveBeenCalledWith('mousemove', onMouseMove)
    expect(addSpy).toHaveBeenCalledWith('mouseup', onMouseUp)

    addSpy.mockRestore()
  })

  it('should not add event listeners when disabled', () => {
    const onMouseMove = jest.fn()
    const onMouseUp = jest.fn()
    const addSpy = jest.spyOn(document, 'addEventListener')

    renderHook(() => useDocumentMouseEvents({ onMouseMove, onMouseUp, enabled: false }))

    expect(addSpy).not.toHaveBeenCalledWith('mousemove', onMouseMove)
    expect(addSpy).not.toHaveBeenCalledWith('mouseup', onMouseUp)

    addSpy.mockRestore()
  })

  it('should remove event listeners on unmount', () => {
    const onMouseMove = jest.fn()
    const onMouseUp = jest.fn()
    const removeSpy = jest.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useDocumentMouseEvents({ onMouseMove, onMouseUp, enabled: true })
    )

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('mousemove', onMouseMove)
    expect(removeSpy).toHaveBeenCalledWith('mouseup', onMouseUp)

    removeSpy.mockRestore()
  })

  it('should call onMouseMove when mousemove event fires', () => {
    const onMouseMove = jest.fn()
    const onMouseUp = jest.fn()

    renderHook(() => useDocumentMouseEvents({ onMouseMove, onMouseUp, enabled: true }))

    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 })
    document.dispatchEvent(event)

    expect(onMouseMove).toHaveBeenCalledWith(event)
  })

  it('should call onMouseUp when mouseup event fires', () => {
    const onMouseMove = jest.fn()
    const onMouseUp = jest.fn()

    renderHook(() => useDocumentMouseEvents({ onMouseMove, onMouseUp, enabled: true }))

    const event = new MouseEvent('mouseup')
    document.dispatchEvent(event)

    expect(onMouseUp).toHaveBeenCalledWith(event)
  })
})
