'use client'

import { SECTIONS, type SectionId } from './sections'
import s from '../page.module.scss'

export interface SectionNavProps {
  active: SectionId
  onSelect: (id: SectionId) => void
}

export function SectionNav({ active, onSelect }: SectionNavProps) {
  return (
    <nav className={s.pillNav} role="tablist" aria-label="Stream sections">
      {SECTIONS.map((section, i) => (
        <button
          key={section.id}
          role="tab"
          aria-selected={active === section.id}
          className={s.pill}
          data-active={active === section.id}
          style={{ '--i': i } as React.CSSProperties}
          onClick={() => {
            onSelect(section.id)
          }}
        >
          <span className={s.pillGlyph}>{section.glyph}</span>
          {section.label}
        </button>
      ))}
      <div
        className={s.pillIndicator}
        style={
          {
            '--pos': SECTIONS.findIndex(sec => sec.id === active),
          } as React.CSSProperties
        }
      />
    </nav>
  )
}
