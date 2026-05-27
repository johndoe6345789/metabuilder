import { describe, it, expect } from 'vitest'
import { renderSimpleShape } from './svgShapesSimple'
import type { Geometry } from '@/lib/types'

describe('renderSimpleShape', () => {
  describe('circle', () => {
    it('renders a circle element', () => {
      const geo: Geometry = { type: 'circle', r: 10 }
      const result = renderSimpleShape(geo, 100, 200, '#ff0')
      expect(result).toContain('<circle')
      expect(result).toContain('cx="100"')
      expect(result).toContain('cy="200"')
      expect(result).toContain('r="10"')
      expect(result).toContain('fill="#ff0"')
    })

    it('includes opacity attribute when provided', () => {
      const geo: Geometry = { type: 'circle', r: 5, opacity: 0.5 }
      const result = renderSimpleShape(geo, 0, 0, '#aaa')
      expect(result).toContain('opacity="0.5"')
    })

    it('excludes opacity attribute when not provided', () => {
      const geo: Geometry = { type: 'circle', r: 5 }
      const result = renderSimpleShape(geo, 0, 0, '#aaa')
      expect(result).not.toContain('opacity=')
    })
  })

  describe('ellipse', () => {
    it('renders an ellipse element', () => {
      const geo: Geometry = { type: 'ellipse', rx: 20, ry: 10 }
      const result = renderSimpleShape(geo, 50, 50, '#00f')
      expect(result).toContain('<ellipse')
      expect(result).toContain('rx="20"')
      expect(result).toContain('ry="10"')
      expect(result).toContain('cx="50"')
      expect(result).toContain('cy="50"')
    })
  })

  describe('rect', () => {
    it('renders a rect element with correct position', () => {
      const geo: Geometry = { type: 'rect', width: 40, height: 20 }
      const result = renderSimpleShape(geo, 100, 100, '#f0f')
      expect(result).toContain('<rect')
      // x = 100 - 40/2 = 80
      expect(result).toContain('x="80"')
      // y = 100 - 20/2 = 90
      expect(result).toContain('y="90"')
      expect(result).toContain('width="40"')
      expect(result).toContain('height="20"')
    })

    it('uses rx=0 when not specified', () => {
      const geo: Geometry = { type: 'rect', width: 10, height: 10 }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('rx="0"')
    })

    it('uses custom rx when provided', () => {
      const geo: Geometry = { type: 'rect', width: 10, height: 10, rx: 4 }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('rx="4"')
    })

    it('defaults width and height to 0', () => {
      const geo: Geometry = { type: 'rect' }
      const result = renderSimpleShape(geo, 10, 10, '#000')
      expect(result).toContain('width="0"')
      expect(result).toContain('height="0"')
    })
  })

  describe('line', () => {
    it('renders a line element', () => {
      const geo: Geometry = { type: 'line', x1: -10, y1: -5, x2: 10, y2: 5, stroke: '#333', strokeWidth: 2 }
      const result = renderSimpleShape(geo, 100, 200, '#000')
      expect(result).toContain('<line')
      // x1 = 100 + (-10) = 90
      expect(result).toContain('x1="90"')
      // y1 = 200 + (-5) = 195
      expect(result).toContain('y1="195"')
      // x2 = 100 + 10 = 110
      expect(result).toContain('x2="110"')
      // y2 = 200 + 5 = 205
      expect(result).toContain('y2="205"')
      expect(result).toContain('stroke="#333"')
      expect(result).toContain('stroke-width="2"')
    })

    it('defaults offsets to 0', () => {
      const geo: Geometry = { type: 'line', stroke: '#000', strokeWidth: 1 }
      const result = renderSimpleShape(geo, 50, 50, '#000')
      expect(result).toContain('x1="50"')
    })
  })

  describe('polygon', () => {
    it('renders a polygon element with correct points', () => {
      const geo: Geometry = {
        type: 'polygon',
        points: [0, -10, 10, 10, -10, 10],
      }
      const result = renderSimpleShape(geo, 100, 100, '#0f0')
      expect(result).toContain('<polygon')
      // Points offset by cx=100, cy=100:
      // (100+0, 100+(-10)) = 100,90
      // (100+10, 100+10) = 110,110
      // (100+(-10), 100+10) = 90,110
      expect(result).toContain('100,90')
      expect(result).toContain('110,110')
    })

    it('uses fill="none" when geo.fill is "none"', () => {
      const geo: Geometry = { type: 'polygon', fill: 'none', points: [0, 0, 10, 10] }
      const result = renderSimpleShape(geo, 0, 0, '#0f0')
      expect(result).toContain('fill="none"')
    })

    it('uses provided fill color when geo.fill is not "none"', () => {
      const geo: Geometry = { type: 'polygon', points: [0, 0] }
      const result = renderSimpleShape(geo, 0, 0, '#0f0')
      expect(result).toContain('fill="#0f0"')
    })

    it('includes stroke attributes when stroke is set', () => {
      const geo: Geometry = {
        type: 'polygon',
        stroke: '#333',
        strokeWidth: 2,
        points: [0, 0, 10, 10],
      }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('stroke="#333"')
      expect(result).toContain('stroke-width="2"')
    })

    it('defaults strokeWidth to 1 when stroke is set but strokeWidth is missing', () => {
      const geo: Geometry = { type: 'polygon', stroke: '#333', points: [] }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('stroke-width="1"')
    })

    it('handles empty points array', () => {
      const geo: Geometry = { type: 'polygon', points: [] }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('<polygon')
      expect(result).toContain('points=""')
    })
  })

  describe('text', () => {
    it('renders a text element', () => {
      const geo: Geometry = { type: 'text', content: 'Hello' }
      const result = renderSimpleShape(geo, 50, 50, '#000')
      expect(result).toContain('<text')
      expect(result).toContain('>Hello<')
      expect(result).toContain('text-anchor="middle"')
    })

    it('uses default fill color #333 when not specified', () => {
      const geo: Geometry = { type: 'text', content: 'Hi' }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('fill="#333"')
    })

    it('uses custom fill when provided', () => {
      const geo: Geometry = { type: 'text', content: 'Hi', fill: '#ff0' }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('fill="#ff0"')
    })

    it('uses default fontSize 10', () => {
      const geo: Geometry = { type: 'text', content: 'X' }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('font-size="10"')
    })

    it('uses custom fontSize when provided', () => {
      const geo: Geometry = { type: 'text', content: 'X', fontSize: 14 }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('font-size="14"')
    })

    it('uses default fontFamily monospace', () => {
      const geo: Geometry = { type: 'text', content: 'X' }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toContain('font-family="monospace"')
    })
  })

  describe('unknown type', () => {
    it('returns null for unknown shape type', () => {
      const geo: Geometry = { type: 'unknown-shape' }
      const result = renderSimpleShape(geo, 0, 0, '#000')
      expect(result).toBeNull()
    })
  })
})
