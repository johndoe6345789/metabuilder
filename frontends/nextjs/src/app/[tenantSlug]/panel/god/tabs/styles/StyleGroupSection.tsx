'use client'

import { StyleControlField } from './StyleControlField'
import type { StyleGroup } from './style-controls'
import s from './CssClassesTab.module.scss'

export interface StyleGroupSectionProps {
  group: StyleGroup
  isOpen: boolean
  onToggle: () => void
  // Partial, not Record: control.prop names an arbitrary CSS property,
  // and most of them aren't set on this class.
  props: Partial<Record<string, string>>
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

/** One collapsible group of named style controls -- Text, Spacing, etc. */
export function StyleGroupSection({
  group,
  isOpen,
  onToggle,
  props,
  onSet,
  onClear,
}: StyleGroupSectionProps) {
  const setCount = group.controls.filter(
    c => props[c.prop] !== undefined && props[c.prop] !== ''
  ).length

  return (
    <div className={s.group}>
      <button
        type="button"
        className={s.groupHead}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span
          className={`material-symbols-rounded ${s.groupTwist} ${
            isOpen ? s.groupTwistOpen : ''
          }`}
          aria-hidden="true"
        >
          chevron_right
        </span>
        <span className="material-symbols-rounded" aria-hidden="true">
          {group.icon}
        </span>
        {group.label}
        {setCount > 0 && <span className={s.groupCount}>{setCount}</span>}
      </button>
      {isOpen && (
        <div className={s.groupBody}>
          {group.controls.map(control => (
            <StyleControlField
              key={control.prop}
              control={control}
              value={props[control.prop]}
              onSet={onSet}
              onClear={onClear}
            />
          ))}
        </div>
      )}
    </div>
  )
}
