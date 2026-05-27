import { describe, it, expect } from 'vitest'
import { buildSvgDefs } from './svgDefs'
import type { Materials } from '@/lib/types'

describe('buildSvgDefs', () => {
  it('wraps output in <defs> tags', () => {
    const result = buildSvgDefs({})
    expect(result).toMatch(/^<defs>/)
    expect(result).toMatch(/<\/defs>$/)
  })

  it('always includes dropShadow filter', () => {
    const result = buildSvgDefs({})
    expect(result).toContain('id="dropShadow"')
    expect(result).toContain('feDropShadow')
  })

  it('always includes glow filter', () => {
    const result = buildSvgDefs({})
    expect(result).toContain('id="glow"')
    expect(result).toContain('feGaussianBlur')
  })

  it('creates a linearGradient for each material', () => {
    const materials: Materials = {
      steel: {
        name: 'Steel',
        gradient: {
          angle: 0,
          stops: [
            { offset: 0, color: '#aaa' },
            { offset: 100, color: '#777' },
          ],
        },
      },
      aluminium: {
        name: 'Aluminium',
        gradient: {
          angle: 90,
          stops: [
            { offset: 0, color: '#ccc' },
            { offset: 100, color: '#999' },
          ],
        },
      },
    }
    const result = buildSvgDefs(materials)
    expect(result).toContain('id="grad-steel"')
    expect(result).toContain('id="grad-aluminium"')
  })

  it('includes gradient stops with correct attributes', () => {
    const materials: Materials = {
      rubber: {
        name: 'Rubber',
        gradient: {
          angle: 45,
          stops: [
            { offset: 0, color: '#111' },
            { offset: 50, color: '#555' },
            { offset: 100, color: '#222' },
          ],
        },
      },
    }
    const result = buildSvgDefs(materials)
    expect(result).toContain('offset="0%"')
    expect(result).toContain('stop-color="#111"')
    expect(result).toContain('offset="50%"')
    expect(result).toContain('stop-color="#555"')
    expect(result).toContain('offset="100%"')
  })

  it('computes gradient direction from angle', () => {
    const materials: Materials = {
      mat: {
        name: 'Mat',
        gradient: {
          angle: 0,
          stops: [{ offset: 0, color: '#000' }],
        },
      },
    }
    const result = buildSvgDefs(materials)
    // angle=0 → cos(0)=1, sin(0)=0 → x2=100%, y2=50%
    expect(result).toContain('x2="100%"')
    expect(result).toContain('y2="50%"')
  })

  it('defaults angle to 0 when not specified', () => {
    const materials: Materials = {
      mat: {
        name: 'Mat',
        gradient: {
          stops: [{ offset: 0, color: '#000' }],
        },
      },
    }
    const result = buildSvgDefs(materials)
    // angle defaults to 0 → same as above
    expect(result).toContain('x2="100%"')
  })

  it('handles empty materials object', () => {
    const result = buildSvgDefs({})
    expect(result).not.toContain('linearGradient')
    expect(result).toContain('dropShadow')
  })
})
