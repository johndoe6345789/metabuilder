export type SectionId = 'tv' | 'radio' | 'retro'

export interface StreamSection {
  id: SectionId
  label: string
  glyph: string
}

export const SECTIONS: StreamSection[] = [
  { id: 'tv', label: 'Live TV', glyph: '▶' },
  { id: 'radio', label: 'Radio', glyph: '~' },
  { id: 'retro', label: 'Retro Games', glyph: '◆' },
]
