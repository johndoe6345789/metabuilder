/**
 * Tests for useCanvasGrid
 */

jest.mock('../../../../hooks/canvas', () => ({
  useProjectCanvas: jest.fn(),
}))

import { renderHook } from '@testing-library/react'
import { useProjectCanvas } from '../../../../hooks/canvas'
import { useCanvasGrid } from '../useCanvasGrid'

function setupMocks(overrides: any = {}) {
  ;(useProjectCanvas as jest.Mock).mockReturnValue({
    pan: { x: 0, y: 0 },
    showGrid: true,
    snapSize: 20,
    ...overrides,
  })
}

describe('useCanvasGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return gridOffset as {x: 0, y: 0} when pan is {0, 0}', () => {
    const { result } = renderHook(() => useCanvasGrid())
    expect(result.current.gridOffset).toEqual({ x: 0, y: 0 })
  })

  it('should return showGrid from canvas state', () => {
    const { result } = renderHook(() => useCanvasGrid())
    expect(result.current.showGrid).toBe(true)
  })

  it('should compute gridOffset as pan % snapSize', () => {
    setupMocks({ pan: { x: 55, y: 35 }, snapSize: 20 })
    const { result } = renderHook(() => useCanvasGrid())
    expect(result.current.gridOffset).toEqual({ x: 15, y: 15 })
  })

  it('should use snapSize for modulo calculation', () => {
    setupMocks({ pan: { x: 100, y: 50 }, snapSize: 25 })
    const { result } = renderHook(() => useCanvasGrid())
    expect(result.current.gridOffset).toEqual({ x: 0, y: 0 })
  })

  it('should handle negative pan values', () => {
    setupMocks({ pan: { x: -30, y: -15 }, snapSize: 20 })
    const { result } = renderHook(() => useCanvasGrid())
    // In JS: -30 % 20 = -10, -15 % 20 = -15
    expect(result.current.gridOffset.x).toBe(-10)
    expect(result.current.gridOffset.y).toBe(-15)
  })

  it('should return showGrid = false when disabled', () => {
    setupMocks({ showGrid: false })
    const { result } = renderHook(() => useCanvasGrid())
    expect(result.current.showGrid).toBe(false)
  })
})
