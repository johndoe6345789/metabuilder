import { describe, expect, it } from 'vitest'

import { SECTIONS } from './sections'

describe('SECTIONS', () => {
  it('declares tv, radio, and retro in that order', () => {
    expect(SECTIONS.map(s => s.id)).toEqual(['tv', 'radio', 'retro'])
  })

  it('gives every section a label and a glyph', () => {
    for (const section of SECTIONS) {
      expect(section.label.length).toBeGreaterThan(0)
      expect(section.glyph.length).toBeGreaterThan(0)
    }
  })
})
