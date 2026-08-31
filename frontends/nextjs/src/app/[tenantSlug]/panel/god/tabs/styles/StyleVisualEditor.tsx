'use client'

/**
 * The style editor: named controls grouped by what they affect, with the raw
 * CSS kept behind an "Advanced" disclosure rather than being the only way in.
 */

import { useState } from 'react'
import { MANAGED_PROPS, STYLE_GROUPS } from './style-controls'
import { StyleGroupSection } from './StyleGroupSection'
import { AdvancedCssSection } from './AdvancedCssSection'
import s from './CssClassesTab.module.scss'

type Props = {
  props: Record<string, string>
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

export function StyleVisualEditor({ props, onSet, onClear }: Props) {
  const [open, setOpen] = useState<string | null>('text')

  // Anything hand-written that no control owns -- kept visible so the
  // Advanced editor never silently hides part of a style.
  const extra = Object.entries(props).filter(([k]) => !MANAGED_PROPS.has(k))

  return (
    <div className={s.groups}>
      {STYLE_GROUPS.map(group => (
        <StyleGroupSection
          key={group.id}
          group={group}
          isOpen={open === group.id}
          onToggle={() => {
            setOpen(current => (current === group.id ? null : group.id))
          }}
          props={props}
          onSet={onSet}
          onClear={onClear}
        />
      ))}

      <AdvancedCssSection extra={extra} onSet={onSet} onClear={onClear} />
    </div>
  )
}
