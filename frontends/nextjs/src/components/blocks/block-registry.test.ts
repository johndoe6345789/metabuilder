import { describe, expect, it } from 'vitest'
import { paletteItemByName } from './block-registry'

describe('paletteItemByName', () => {
  it('finds a block by its plain-language name', () => {
    expect(paletteItemByName('Container')?.type).toBe('container')
  })

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(paletteItemByName('  heading 1  ')?.type).toBe('html.h1')
  })

  it('returns undefined for a name no block uses', () => {
    expect(paletteItemByName('Frobnicator')).toBeUndefined()
  })
})
