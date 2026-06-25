import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGeometryRenderer } from './useGeometryRenderer'
import type { Geometry } from '@/lib/types'

// Mock renderShape to isolate the hook behavior
vi.mock('./svgShapes', () => ({
  renderShape: vi.fn((_geo, x, y, fill) => `<shape x="${x}" y="${y}" fill="${fill}"/>`),
}))

import { renderShape } from './svgShapes'

describe('useGeometryRenderer', () => {
  beforeEach(() => {
    vi.mocked(renderShape).mockClear()
  })

  describe('renderGeometry', () => {
    it('calls renderShape with correct coordinates', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 10 }
      result.current.renderGeometry(geo, 100, 200, 'steel')
      expect(renderShape).toHaveBeenCalledWith(geo, 100, 200, expect.any(String))
    })

    it('applies offsetX and offsetY from geometry', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5, offsetX: 20, offsetY: -10 }
      result.current.renderGeometry(geo, 100, 200, 'steel')
      // x = 100 + 20 = 120, y = 200 + (-10) = 190
      expect(renderShape).toHaveBeenCalledWith(geo, 120, 190, expect.any(String))
    })

    it('uses 0 for missing offsets', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'rect', width: 10, height: 5 }
      result.current.renderGeometry(geo, 50, 75, 'rubber')
      expect(renderShape).toHaveBeenCalledWith(geo, 50, 75, expect.any(String))
    })

    it('uses geo.fill directly when provided', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5, fill: '#ff0000' }
      result.current.renderGeometry(geo, 0, 0, 'steel')
      expect(renderShape).toHaveBeenCalledWith(geo, 0, 0, '#ff0000')
    })

    it('uses geo.material gradient url when geo.material is set', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5, material: 'aluminium' }
      result.current.renderGeometry(geo, 0, 0, 'steel')
      expect(renderShape).toHaveBeenCalledWith(geo, 0, 0, 'url(#grad-aluminium)')
    })

    it('uses partMaterial gradient url when no geo.fill and no geo.material', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5 }
      result.current.renderGeometry(geo, 0, 0, 'steel')
      expect(renderShape).toHaveBeenCalledWith(geo, 0, 0, 'url(#grad-steel)')
    })

    it('uses #888 fallback when no fill, no geo.material, and no partMaterial', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5 }
      result.current.renderGeometry(geo, 0, 0, '')
      expect(renderShape).toHaveBeenCalledWith(geo, 0, 0, '#888')
    })

    it('returns the SVG string from renderShape', () => {
      const { result } = renderHook(() => useGeometryRenderer())
      const geo: Geometry = { type: 'circle', r: 5 }
      const output = result.current.renderGeometry(geo, 10, 20, 'steel')
      expect(typeof output).toBe('string')
    })
  })
})
