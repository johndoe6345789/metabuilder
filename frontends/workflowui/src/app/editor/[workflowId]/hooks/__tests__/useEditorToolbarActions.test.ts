/**
 * Tests for useEditorToolbarActions
 */

import { renderHook, act } from '@testing-library/react'
import { useEditorToolbarActions } from '../useEditorToolbarActions'

function makeInput() {
  const router = { back: jest.fn() }
  const setWorkflow = jest.fn()
  const setZoom = jest.fn()
  const setCanvasOffset = jest.fn()
  const handleSave = jest.fn()
  const handleRun = jest.fn()
  return { router, setWorkflow, setZoom, setCanvasOffset, handleSave, handleRun }
}

describe('useEditorToolbarActions', () => {
  it('onNameChange should call setWorkflow updater that changes name', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onNameChange('New Name') })

    expect(input.setWorkflow).toHaveBeenCalled()
    const updater = input.setWorkflow.mock.calls[0][0]
    const prev = { id: '1', name: 'Old', description: '', nodes: [], connections: [] }
    const next = updater(prev)
    expect(next.name).toBe('New Name')
  })

  it('onZoomIn should call setZoom with an updater that increases zoom', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onZoomIn() })

    expect(input.setZoom).toHaveBeenCalled()
    const updater = input.setZoom.mock.calls[0][0]
    expect(updater(1)).toBe(1.25)
    expect(updater(1.75)).toBe(2) // max 2
    expect(updater(2)).toBe(2)
  })

  it('onZoomOut should call setZoom with an updater that decreases zoom', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onZoomOut() })

    expect(input.setZoom).toHaveBeenCalled()
    const updater = input.setZoom.mock.calls[0][0]
    expect(updater(1)).toBe(0.75)
    expect(updater(0.5)).toBe(0.25)
    expect(updater(0.25)).toBe(0.25) // min 0.25
  })

  it('onZoomReset should call setZoom(1) and reset canvas offset', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onZoomReset() })

    expect(input.setZoom).toHaveBeenCalledWith(1)
    expect(input.setCanvasOffset).toHaveBeenCalledWith({ x: 0, y: 0 })
  })

  it('onBack should call router.back()', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onBack() })

    expect(input.router.back).toHaveBeenCalled()
  })

  it('onSave should call handleSave', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onSave() })

    expect(input.handleSave).toHaveBeenCalled()
  })

  it('onRun should call handleRun', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    act(() => { result.current.onRun() })

    expect(input.handleRun).toHaveBeenCalled()
  })

  it('should return all expected properties', () => {
    const input = makeInput()
    const { result } = renderHook(() => useEditorToolbarActions(input))

    expect(result.current).toHaveProperty('onNameChange')
    expect(result.current).toHaveProperty('onZoomIn')
    expect(result.current).toHaveProperty('onZoomOut')
    expect(result.current).toHaveProperty('onZoomReset')
    expect(result.current).toHaveProperty('onBack')
    expect(result.current).toHaveProperty('onSave')
    expect(result.current).toHaveProperty('onRun')
  })
})
